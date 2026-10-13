import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { reorderCustomPages } from '@/lib/customPages';

/** Body: { ids: [5, 3, 4] } — full new display order for pages of one type. */
export async function POST(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!Array.isArray(body?.ids)) {
    return NextResponse.json({ error: '"ids" array is required' }, { status: 400 });
  }
  await reorderCustomPages(body.ids);
  return NextResponse.json({ ok: true });
}
