import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { listAllFaqs, createFaq, reorderFaqs } from '@/lib/faqs';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const faqs = await listAllFaqs();
  return NextResponse.json({ faqs });
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
  if (!body?.question || !body?.answer) {
    return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
  }

  const { ok, error, result } = await createFaq(body);
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });
  return NextResponse.json({ ok: true, id: result.insertId });
}

/** Body: { ids: [3, 1, 2] } — full new display order. */
export async function PATCH(request) {
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
  await reorderFaqs(body.ids);
  return NextResponse.json({ ok: true });
}
