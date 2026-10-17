import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { getSiteSettings, saveSiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/section-visibility
 * Returns current visibility settings for all toggleable sections.
 */
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const settings = await getSiteSettings();
  return NextResponse.json({
    industriesEnabled: settings.industriesEnabled !== false,
  });
}

/**
 * PATCH /api/admin/section-visibility
 * Body: { industriesEnabled: boolean }
 * Updates only section visibility flags in site_settings.
 */
export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Only allow known boolean visibility fields
  const ALLOWED = ['industriesEnabled'] as const;
  const patch: Record<string, boolean> = {};
  for (const key of ALLOWED) {
    if (key in body) {
      patch[key] = Boolean(body[key]);
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No valid visibility fields provided' }, { status: 400 });
  }

  // Merge with existing settings so we never wipe other values
  const existing = await getSiteSettings();
  const { ok, error } = await saveSiteSettings({ ...existing, ...patch });
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });

  return NextResponse.json({ ok: true, ...patch });
}
