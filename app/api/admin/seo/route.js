import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { listSeoMeta, upsertSeoMeta } from '@/lib/seo';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const entries = await listSeoMeta();
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
  if (!body?.pagePath) {
    return NextResponse.json({ error: 'pagePath is required' }, { status: 400 });
  }

  const { ok, error } = await upsertSeoMeta(body.pagePath, body);
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
