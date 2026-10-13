import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { getAllArticlesAdmin, createArticle } from '@/lib/insights';

const VALID_TYPES = new Set(['blog', 'whitepaper', 'case_study', 'report', 'webinar']);

function validate(body) {
  if (!body?.title?.trim()) return 'Title is required.';
  if (!body?.summary?.trim()) return 'Summary is required.';
  if (!VALID_TYPES.has(body?.type)) return 'A valid type is required.';
  if (!body?.tag?.trim()) return 'Tag is required.';
  if (!body?.published_at) return 'Published date is required.';
  return null;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const articles = await getAllArticlesAdmin();
  return NextResponse.json({ articles });
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

  const err = validate(body);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const { ok, error, result } = await createArticle(body);
  if (!ok) return NextResponse.json({ error: error || 'Create failed' }, { status: 500 });

  return NextResponse.json({ ok: true, id: result.insertId });
}
