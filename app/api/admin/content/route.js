import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/requireAdmin';
import { CMS_PAGES } from '@/lib/cmsRegistry';
import { listSavedPageStatus } from '@/lib/cms';

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const statusMap = await listSavedPageStatus();
  const pages = CMS_PAGES.map((p) => ({
    ...p,
    isPublished: statusMap[p.key]?.isPublished || false,
    updatedAt: statusMap[p.key]?.updatedAt || null,
    hasDraft: Boolean(statusMap[p.key])
  }));

  return NextResponse.json({ pages });
}
