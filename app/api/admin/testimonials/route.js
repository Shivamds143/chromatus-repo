import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { listAllTestimonials, createTestimonial, reorderTestimonials } from '@/lib/testimonials';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const testimonials = await listAllTestimonials();
  return NextResponse.json({ testimonials });
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
  if (!body?.quote || !body?.authorName) {
    return NextResponse.json({ error: 'Quote and author name are required' }, { status: 400 });
  }

  const { ok, error, result } = await createTestimonial(body);
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
  await reorderTestimonials(body.ids);
  return NextResponse.json({ ok: true });
}
