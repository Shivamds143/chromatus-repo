import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  verifyPassword,
  findAdminByUsername,
  touchLastLogin
} from '@/lib/adminAuth';

// Very small in-memory rate limiter (per server process) to slow down
// brute-force login attempts without adding an extra dependency.
const attempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.since > WINDOW_MS) {
    attempts.set(ip, { count: 1, since: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'local';
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    const username = (body?.username || '').trim();
    const password = body?.password || '';

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const admin = await findAdminByUsername(username);
    if (!admin || !verifyPassword(password, admin.password_hash)) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const token = createSessionToken(admin.username);
    await touchLastLogin(admin.username);

    const response = NextResponse.json({ ok: true, username: admin.username });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12 // 12 hours
    });
    return response;
  } catch (err) {
    console.error('Error during admin login:', err);
    return NextResponse.json(
      { error: err?.message || 'Authentication failed. Please try again.' },
      { status: 500 }
    );
  }
}
