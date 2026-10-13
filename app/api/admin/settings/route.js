import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { getSiteSettings, saveSiteSettings } from '@/lib/settings';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await getSiteSettings();
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

  const hexPattern = /^#[0-9a-fA-F]{6}$/;
  const colorFields = [
    'colorNavy',
    'colorNavyLight',
    'colorNavyDark',
    'colorBrandblue',
    'colorBrandblueDark',
    'colorBrandorange',
    'colorBrandorangeDark'
  ];
  for (const field of colorFields) {
    if (body[field] && !hexPattern.test(body[field])) {
      return NextResponse.json({ error: `${field} must be a hex color like #1F82C5` }, { status: 400 });
    }
  }

  const { ok, error } = await saveSiteSettings(body);
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
