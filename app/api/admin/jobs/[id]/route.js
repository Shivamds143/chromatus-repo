import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { getJobById, updateJob, deleteJob } from '@/lib/jobs';

export async function GET(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const job = await getJobById(params.id);
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ job });
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

  const { ok, error } = await updateJob(params.id, body || {});
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ok, error } = await deleteJob(params.id);
  if (!ok) return NextResponse.json({ error: error || 'Delete failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
