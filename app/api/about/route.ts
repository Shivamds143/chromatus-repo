import { NextResponse } from 'next/server';
import { getLiveAboutData } from '@/lib/about';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getLiveAboutData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[api/about] failed to load about data:', error);
    return NextResponse.json({ error: error?.message || 'Failed to load about data' }, { status: 500 });
  }
}
