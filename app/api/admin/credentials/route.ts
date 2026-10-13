import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, generateSessionToken } from "@/lib/admin-auth";
import { getActiveCredentials, updateAdminCredentials } from "@/lib/admin-credentials";

export async function GET() {
  try {
    const creds = await getActiveCredentials();
    return NextResponse.json({
      ok: true,
      username: creds.username,
      email: creds.email,
      updatedAt: creds.updatedAt,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load credentials." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid request payload." }, { status: 400 });
    }

    const { currentPassword, newUsername, newEmail, newPassword } = body as {
      currentPassword?: string;
      newUsername?: string;
      newEmail?: string;
      newPassword?: string;
    };

    if (!currentPassword) {
      return NextResponse.json(
        { ok: false, error: "Current password is required to verify changes." },
        { status: 400 }
      );
    }

    const result = await updateAdminCredentials({
      currentPassword,
      newUsername,
      newEmail,
      newPassword,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    // Refresh cookie with updated username
    const finalUsername = newUsername?.trim() || (await getActiveCredentials()).username;
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, generateSessionToken(finalUsername), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      ok: true,
      message: "Admin credentials successfully updated.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Could not update credentials." },
      { status: 500 }
    );
  }
}
