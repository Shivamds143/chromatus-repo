import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { listCustomPages, createCustomPage } from '@/lib/customPages';

const VALID_TYPES = new Set(['custom', 'service', 'industry']);

export async function GET(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const pageType = VALID_TYPES.has(type) ? type : 'custom';

  const pages = await listCustomPages(pageType);
  return NextResponse.json({ pages });
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
  if (!body?.title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }
  const pageType = VALID_TYPES.has(body.pageType) ? body.pageType : 'custom';

  const { ok, error, result } = await createCustomPage({ ...body, pageType });
  if (!ok) {
    const message = /Duplicate entry/i.test(error || '') ? 'A page with that URL slug already exists.' : error;
    return NextResponse.json({ error: message || 'Save failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, id: result.insertId });
}
