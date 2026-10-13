import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { deleteMedia } from '@/lib/media';

export async function DELETE(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ok, error } = await deleteMedia(params.id);
  if (!ok) return NextResponse.json({ error: error || 'Delete failed' }, { status: 400 });

  return NextResponse.json({ ok: true });
}
