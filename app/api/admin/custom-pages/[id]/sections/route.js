import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { addSection, reorderSections, SECTION_TYPES } from '@/lib/customPages';

export async function POST(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!SECTION_TYPES.some((s) => s.type === body?.type)) {
    return NextResponse.json({ error: 'Unknown section type' }, { status: 400 });
  }

  const { ok, error, result } = await addSection(params.id, body.type);
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });
  return NextResponse.json({ ok: true, id: result.insertId });
}

/** Body: { ids: [5, 3, 4] } — full new display order for this page's sections. */
export async function PUT(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!Array.isArray(body?.ids)) {
    return NextResponse.json({ error: '"ids" array is required' }, { status: 400 });
  }
  await reorderSections(body.ids);
  return NextResponse.json({ ok: true });
}
