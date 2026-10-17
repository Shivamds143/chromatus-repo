import { NextResponse } from 'next/server';
import { getLiveIndustriesData } from '@/lib/industries';
import { getIndustriesEnabled } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [data, enabled] = await Promise.all([
      getLiveIndustriesData(),
      getIndustriesEnabled(),
    ]);
    return NextResponse.json({ ...data, enabled });
  } catch (error: any) {
    console.error('[api/industries] failed to load industries:', error);
    return NextResponse.json({ error: error?.message || 'Failed to load industries' }, { status: 500 });
  }
}
