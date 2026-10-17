import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/requireAdmin';
import { getCustomPageForAdmin, updateCustomPageMeta, updateSectionData, deleteCustomPage } from '@/lib/customPages';

export async function GET(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const page = await getCustomPageForAdmin(params.id);
  if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PUT(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { ok, error } = await updateCustomPageMeta(params.id, body);
  if (!ok) {
    const message = /Duplicate entry/i.test(error || '') ? 'A page with that URL slug already exists.' : error;
    return NextResponse.json({ error: message || 'Save failed' }, { status: 500 });
  }

  // If sections were also provided in the payload, save all section data simultaneously
  if (Array.isArray(body?.sections)) {
    for (const sec of body.sections) {
      if (sec.id && sec.data !== undefined) {
        await updateSectionData(sec.id, sec.data);
      }
    }
  }

  try {
    revalidatePath('/services');
    revalidatePath('/services/[slug]', 'page');
    revalidatePath('/industries');
    revalidatePath('/industries/[slug]', 'page');
    revalidatePath('/pages/[slug]', 'page');
    revalidatePath('/');
  } catch (e) {
    console.warn('[custom-pages] revalidate failed:', e);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  params = await params;
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ok, error } = await deleteCustomPage(params.id);
  if (!ok) return NextResponse.json({ error: error || 'Delete failed' }, { status: 500 });

  try {
    revalidatePath('/services');
    revalidatePath('/services/[slug]');
    revalidatePath('/');
  } catch (e) {
    console.warn('[custom-pages] revalidate failed:', e);
  }

  return NextResponse.json({ ok: true });
}
