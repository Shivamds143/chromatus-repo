import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { listApplicationsAdmin } from '@/lib/applications';

export async function GET(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const jobId = new URL(request.url).searchParams.get('jobId');
  const applications = await listApplicationsAdmin(jobId || undefined);
  return NextResponse.json({ applications });
}
