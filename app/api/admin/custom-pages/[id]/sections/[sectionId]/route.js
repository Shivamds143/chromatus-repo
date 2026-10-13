import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { updateSectionData, deleteSection } from '@/lib/customPages';

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
  if (typeof body?.data !== 'object' || body.data === null) {
    return NextResponse.json({ error: '"data" object is required' }, { status: 400 });
  }

  const { ok, error } = await updateSectionData(params.sectionId, body.data);
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ok, error } = await deleteSection(params.sectionId);
  if (!ok) return NextResponse.json({ error: error || 'Delete failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
