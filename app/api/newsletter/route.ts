import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { saveNewsletterSubscriptionFallback } from "@/lib/storage-fallback";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const { email, website: honeypot } = body as Record<string, string>;

  // Bot caught the honeypot — pretend success without processing anything.
  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  if (!email?.trim() || !emailPattern.test(email.trim())) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let savedToMongo = false;

  try {
    const database = await getDatabase();
    await database.collection("newsletterSubscriptions").updateOne(
      { email: normalizedEmail },
      {
        $setOnInsert: {
          email: normalizedEmail,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
    savedToMongo = true;
  } catch (error) {
    console.warn("MongoDB unavailable, saving newsletter to fallback store:", error);
    try {
      await saveNewsletterSubscriptionFallback(normalizedEmail);
    } catch (fallbackError) {
      console.error("Failed to save newsletter to fallback store:", fallbackError);
      return NextResponse.json(
        { ok: false, error: "We could not save your subscription. Please try again." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ ok: true, savedToMongo });
}
