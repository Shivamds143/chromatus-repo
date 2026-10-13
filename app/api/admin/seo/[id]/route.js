import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { deleteSeoMeta } from '@/lib/seo';

export async function DELETE(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ok, error } = await deleteSeoMeta(params.id);
  if (!ok) return NextResponse.json({ error: error || 'Delete failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
