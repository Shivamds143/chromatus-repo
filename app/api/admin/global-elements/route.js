import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { getGlobalElements, saveGlobalElements } from '@/lib/globalElements';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const elements = await getGlobalElements();
  return NextResponse.json({ elements });
}

export async function PUT(request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ok, error } = await saveGlobalElements(body || {});
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
