import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { PREVIEW_COOKIE } from '@/lib/preview';

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body = {};
  try {
    body = await request.json();
  } catch {
    // no body means "disable"
  }

  const res = NextResponse.json({ ok: true, enabled: !!body.enable });
  if (body.enable) {
    res.cookies.set(PREVIEW_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4 // 4 hours
    });
  } else {
    res.cookies.set(PREVIEW_COOKIE, '', { path: '/', maxAge: 0 });
  }
  return res;
}
