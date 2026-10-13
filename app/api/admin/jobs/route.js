import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { getAllJobsAdmin, createJob } from '@/lib/jobs';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jobs = await getAllJobsAdmin();
  return NextResponse.json({ jobs });
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

  const { ok, error, result } = await createJob(body || {});
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });
  return NextResponse.json({ ok: true, id: result.insertId });
}
