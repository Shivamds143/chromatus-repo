import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { getAllNewsletterSubscribers } from '@/lib/leads';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subscribers = await getAllNewsletterSubscribers();
  return NextResponse.json({ subscribers });
}
