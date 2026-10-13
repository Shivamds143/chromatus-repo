import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";
import { ADMIN_COOKIE_NAME, isValidToken } from "@/lib/admin-auth";
import { getDatabase } from "@/lib/mongodb";
import { getFallbackData } from "@/lib/storage-fallback";
import { ObjectId } from "mongodb";

const RESUMES_DIR = path.join(process.cwd(), "data", "resumes");

type RouteProps = {
  params: Promise<{ id: string }> | { id: string };
};

export async function GET(request: NextRequest, { params }: RouteProps) {
  try {
    // 1. Verify admin session
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!isValidToken(token)) {
      return new NextResponse("Unauthorized: Admin login required.", { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    if (!id) {
      return new NextResponse("Missing resume identifier", { status: 400 });
    }

    const downloadOnly = request.nextUrl.searchParams.get("download") === "1";

    let resumeFileName = "";
    let resumeOriginalName = "resume.pdf";
    let resumeMimeType = "application/pdf";

    // Check if ID is a direct filename (e.g. ends with .pdf, .docx, .doc)
    if (id.endsWith(".pdf") || id.endsWith(".docx") || id.endsWith(".doc")) {
      resumeFileName = path.basename(id);
      resumeOriginalName = resumeFileName;
      if (resumeFileName.endsWith(".pdf")) resumeMimeType = "application/pdf";
      else if (resumeFileName.endsWith(".docx")) {
        resumeMimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      } else {
        resumeMimeType = "application/msword";
      }
    } else {
      // Look up application record by ID in MongoDB or fallback store
      let foundRecord: any = null;

      try {
        const db = await getDatabase();
        if (ObjectId.isValid(id)) {
          foundRecord = await db.collection("jobApplications").findOne({ _id: new ObjectId(id) });
        }
        if (!foundRecord) {
          foundRecord = await db.collection("jobApplications").findOne({ resumeFileName: id });
        }
      } catch {
        // Mongo query error, will check fallback
      }

      if (!foundRecord) {
        const fallback = await getFallbackData();
        foundRecord = fallback.jobApplications.find(
          (app) => app.id === id || app.resumeFileName === id
        );
      }

      if (foundRecord) {
        resumeFileName = foundRecord.resumeFileName;
        resumeOriginalName = foundRecord.resumeOriginalName || resumeFileName;
        resumeMimeType = foundRecord.resumeMimeType || "application/pdf";

        // If stored in MongoDB as base64 (serverless/Vercel support)
        if (foundRecord.resumeBase64) {
          const fileBuffer = Buffer.from(foundRecord.resumeBase64, "base64");
          const sanitizedOriginalName = encodeURIComponent(resumeOriginalName.replace(/[\r\n]/g, ""));
          const dispositionType = downloadOnly || !resumeMimeType.includes("pdf") ? "attachment" : "inline";

          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              "Content-Type": resumeMimeType,
              "Content-Disposition": `${dispositionType}; filename="${sanitizedOriginalName}"; filename*=UTF-8''${sanitizedOriginalName}`,
              "Content-Length": fileBuffer.length.toString(),
              "Cache-Control": "private, max-age=3600",
            },
          });
        }
      } else {
        // Fallback: try using the ID itself as filename
        resumeFileName = path.basename(id);
      }
    }

    // Secure the file path to prevent directory traversal attacks
    const safeFileName = path.basename(resumeFileName);
    let fileBuffer: Buffer | null = null;
    try {
      fileBuffer = await fs.readFile(path.join(RESUMES_DIR, safeFileName));
    } catch {
      try {
        fileBuffer = await fs.readFile(path.join("/tmp", "resumes", safeFileName));
      } catch {
        fileBuffer = null;
      }
    }

    if (!fileBuffer) {
      return new NextResponse("Resume file not found on server.", { status: 404 });
    }

    // Escape or encode original file name for Content-Disposition header
    const sanitizedOriginalName = encodeURIComponent(resumeOriginalName.replace(/[\r\n]/g, ""));
    const dispositionType = downloadOnly || !resumeMimeType.includes("pdf") ? "attachment" : "inline";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": resumeMimeType,
        "Content-Disposition": `${dispositionType}; filename="${sanitizedOriginalName}"; filename*=UTF-8''${sanitizedOriginalName}`,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Error serving resume:", error);
    return new NextResponse("Failed to retrieve resume.", { status: 500 });
  }
}
