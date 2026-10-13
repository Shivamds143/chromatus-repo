import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { getCmsPageMeta } from '@/lib/cmsRegistry';
import { getDefaultForKey } from '@/lib/cmsDefaults';
import { getRawPageContent, savePageContent } from '@/lib/cms';

export async function GET(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const meta = getCmsPageMeta(params.key);
  if (!meta) return NextResponse.json({ error: 'Unknown page key' }, { status: 404 });

  const fallback = getDefaultForKey(params.key);
  const { data, isPublished, updatedAt } = await getRawPageContent(params.key);

  return NextResponse.json({
    meta,
    fallback,
    // What the editor should load: the saved draft if one exists, else
    // the original static content (deep-cloned via JSON round-trip).
    current: data ?? JSON.parse(JSON.stringify(fallback)),
    isPublished,
    updatedAt
  });
}

export async function PUT(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const meta = getCmsPageMeta(params.key);
  if (!meta) return NextResponse.json({ error: 'Unknown page key' }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body.data !== 'object' || body.data === null) {
    return NextResponse.json({ error: '"data" object is required' }, { status: 400 });
  }

  const { ok, error } = await savePageContent(params.key, body.data, !!body.isPublished);
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
