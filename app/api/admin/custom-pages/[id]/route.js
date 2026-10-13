import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { getCustomPageForAdmin, updateCustomPageMeta, deleteCustomPage } from '@/lib/customPages';

export async function GET(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const page = await getCustomPageForAdmin(params.id);
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ page });
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

  const { ok, error } = await updateCustomPageMeta(params.id, body);
  if (!ok) {
    const message = /Duplicate entry/i.test(error || '') ? 'A page with that URL slug already exists.' : error;
    return NextResponse.json({ error: message || 'Save failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ok, error } = await deleteCustomPage(params.id);
  if (!ok) return NextResponse.json({ error: error || 'Delete failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
