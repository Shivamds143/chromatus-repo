import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { listRedirects, upsertRedirect } from '@/lib/redirects';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const entries = await listRedirects();
  return NextResponse.json({ entries });
}

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ok, error } = await upsertRedirect(body);
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
