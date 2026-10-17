import { NextResponse } from 'next/server';
import { getLiveIndustriesData } from '@/lib/industries';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getLiveIndustriesData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[api/industries] failed to load industries:', error);
    return NextResponse.json({ error: error?.message || 'Failed to load industries' }, { status: 500 });
  }
}
