import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { getAllEnquiries } from '@/lib/leads';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const enquiries = await getAllEnquiries();
  return NextResponse.json({ enquiries });
}
