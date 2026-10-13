import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { saveContactSubmissionFallback } from "@/lib/storage-fallback";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const {
    fullName,
    email,
    phone,
    company,
    message,
    company_website: honeypot, // hidden field — real visitors never fill this in
  } = body as Record<string, string>;

  // Bot caught the honeypot — pretend success without processing anything.
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!fullName?.trim() || !company?.trim()) {
    return NextResponse.json({ ok: false, error: "Missing required fields." }, { status: 400 });
  }
  if (!email?.trim() || !emailPattern.test(email.trim())) {
    return NextResponse.json({ ok: false, error: "A valid email is required." }, { status: 400 });
  }

  const record = {
    fullName: fullName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    company: company.trim(),
    message: message?.trim() || null,
    createdAt: new Date(),
  };

  let savedToMongo = false;

  try {
    const database = await getDatabase();
    await database.collection("contactSubmissions").insertOne(record);
    savedToMongo = true;
  } catch (error) {
    console.warn("MongoDB unavailable, saving contact submission to fallback store:", error);
    try {
      await saveContactSubmissionFallback(record);
    } catch (fallbackError) {
      console.error("Failed to save to both MongoDB and fallback storage:", fallbackError);
      return NextResponse.json(
        { ok: false, error: "We could not save your request. Please try again or call us." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true, savedToMongo });
}
