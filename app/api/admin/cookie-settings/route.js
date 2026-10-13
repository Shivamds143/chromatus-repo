import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import {
  getCookieConsentSettings,
  saveCookieConsentSettings,
  CATEGORY_KEYS
} from '@/lib/cookieConsent';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await getCookieConsentSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body?.bannerTitle || !String(body.bannerTitle).trim()) {
    return NextResponse.json({ error: 'Banner title is required' }, { status: 400 });
  }
  if (!Array.isArray(body?.categories) || body.categories.length === 0) {
    return NextResponse.json({ error: 'Categories are required' }, { status: 400 });
  }
  const keys = body.categories.map((c) => c?.key);
  const missing = CATEGORY_KEYS.filter((k) => !keys.includes(k));
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing categories: ${missing.join(', ')}` }, { status: 400 });
  }

  const { ok, error } = await saveCookieConsentSettings(body);
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
