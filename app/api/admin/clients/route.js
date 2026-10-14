import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/requireAdmin';
import { listAllClients, createClient, reorderClients } from '@/lib/clients';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const clients = await listAllClients();
  return NextResponse.json({ clients });
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

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
  }

  const { ok, error, result } = await createClient(body);
  if (!ok) return NextResponse.json({ error: error || 'Save failed' }, { status: 500 });
  
  try {
    revalidatePath('/');
  } catch {}

  return NextResponse.json({ ok: true, id: result?.insertId });
}

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

  await reorderClients(body.ids);
  return NextResponse.json({ ok: true });
}
