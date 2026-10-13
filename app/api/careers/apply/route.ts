import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getDatabase } from "@/lib/mongodb";
import { saveJobApplicationFallback } from "@/lib/storage-fallback";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const RESUMES_DIR = path.join(process.cwd(), "data", "resumes");

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Honeypot check - bot caught
    const honeypot = formData.get("company_website") as string | null;
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    const fullName = (formData.get("fullName") as string | null)?.trim() || "";
    const email = (formData.get("email") as string | null)?.trim() || "";
    const phone = (formData.get("phone") as string | null)?.trim() || null;
    const position = (formData.get("position") as string | null)?.trim() || "General Application";
    const experience = (formData.get("experience") as string | null)?.trim() || null;
    const rawLinkedinUrl = (formData.get("linkedinUrl") as string | null)?.trim() || null;
    const linkedinUrl = rawLinkedinUrl
      ? /^https?:\/\//i.test(rawLinkedinUrl)
        ? rawLinkedinUrl
        : `https://${rawLinkedinUrl}`
      : null;
    const message = (formData.get("message") as string | null)?.trim() || null;

    if (!fullName) {
      return NextResponse.json({ ok: false, error: "Candidate full name is required." }, { status: 400 });
    }

    if (!email || !emailPattern.test(email)) {
      return NextResponse.json({ ok: false, error: "A valid email address is required." }, { status: 400 });
    }

    const resumeFile = formData.get("resume") as File | null;
    if (!resumeFile || typeof resumeFile === "string" || resumeFile.size === 0) {
      return NextResponse.json({ ok: false, error: "Please upload your resume or CV file." }, { status: 400 });
    }

    if (resumeFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { ok: false, error: "Resume file size exceeds the 10MB limit." },
        { status: 400 }
      );
    }

    const originalName = resumeFile.name || "resume.pdf";
    const ext = path.extname(originalName).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { ok: false, error: "Only PDF (.pdf) and Word documents (.doc, .docx) are supported." },
        { status: 400 }
      );
    }

    // Sanitize candidate name for filename
    const safeName = fullName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const storedFileName = `${safeName}_${uniqueSuffix}${ext}`;

    // Read file buffer
    const fileBytes = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(fileBytes);
    const resumeBase64 = buffer.toString("base64");

    // Optional local disk cache: works on local dev; gracefully catches in serverless read-only environments (e.g. Vercel)
    const resumesDir = process.env.VERCEL
      ? path.join("/tmp", "resumes")
      : path.join(process.cwd(), "data", "resumes");
    try {
      await fs.mkdir(resumesDir, { recursive: true });
      const destinationPath = path.join(resumesDir, storedFileName);
      await fs.writeFile(destinationPath, buffer);
    } catch (fsErr) {
      console.warn("Local disk write skipped in serverless environment:", fsErr);
    }

    const record = {
      fullName,
      email: email.toLowerCase(),
      phone,
      position,
      experience,
      linkedinUrl,
      message,
      resumeFileName: storedFileName,
      resumeOriginalName: originalName,
      resumeFileSize: resumeFile.size,
      resumeMimeType: resumeFile.type || (ext === ".pdf" ? "application/pdf" : "application/msword"),
      resumeBase64,
      createdAt: new Date(),
    };

    let savedToMongo = false;
    try {
      const db = await getDatabase();
      await db.collection("jobApplications").insertOne(record);
      savedToMongo = true;
    } catch (dbError) {
      console.warn("MongoDB unavailable, saving application to fallback storage:", dbError);
      try {
        await saveJobApplicationFallback(record);
      } catch (fallbackError) {
        console.error("Failed to save to both MongoDB and fallback store:", fallbackError);
        return NextResponse.json(
          { ok: false, error: "Could not save your application. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      ok: true,
      savedToMongo,
      message: "Application and resume submitted successfully.",
    });
  } catch (error: any) {
    console.error("Error processing job application:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error occurred." },
      { status: 500 }
    );
  }
}
