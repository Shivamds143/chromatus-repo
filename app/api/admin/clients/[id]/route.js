import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { updateClient, deleteClient, getClientById } from '@/lib/clients';

export async function GET(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });
  return NextResponse.json({ client });
}

export async function PUT(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body?.name?.trim()) {
    return NextResponse.json({ error: 'Client name is required' }, { status: 400 });
  }

  const { ok, error } = await updateClient(id, body);
  if (!ok) return NextResponse.json({ error: error || 'Update failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const { ok, error } = await deleteClient(id);
  if (!ok) return NextResponse.json({ error: error || 'Delete failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
