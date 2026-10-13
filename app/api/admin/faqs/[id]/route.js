import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { updateFaq, deleteFaq } from '@/lib/faqs';

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
  if (!body?.question || !body?.answer) {
    return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
  }

  const { ok, error } = await updateFaq(params.id, body);
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ok, error } = await deleteFaq(params.id);
  if (!ok) return NextResponse.json({ error: error || 'Delete failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
