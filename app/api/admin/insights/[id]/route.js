import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { getArticleByIdAdmin, updateArticle, deleteArticle } from '@/lib/insights';

const VALID_TYPES = new Set(['blog', 'whitepaper', 'case_study', 'report', 'webinar']);

function validate(body) {
  if (!body?.title?.trim()) return 'Title is required.';
  if (!body?.summary?.trim()) return 'Summary is required.';
  if (!VALID_TYPES.has(body?.type)) return 'A valid type is required.';
  if (!body?.tag?.trim()) return 'Tag is required.';
  if (!body?.published_at) return 'Published date is required.';
  return null;
}

export async function GET(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const article = await getArticleByIdAdmin(params.id);
  if (!article) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ article });
}

export async function PUT(request, { params }) {
  params = await params;
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

  const { ok, error } = await updateArticle(params.id, body);
  if (!ok) return NextResponse.json({ error: error || 'Update failed' }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ok, error } = await deleteArticle(params.id);
  if (!ok) return NextResponse.json({ error: error || 'Delete failed' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
