import { NextResponse } from 'next/server';
import { getLiveServicesData } from '@/lib/services';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const data = await getLiveServicesData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[api/services] failed to load services:', error);
    return NextResponse.json({ error: error?.message || 'Failed to load services' }, { status: 500 });
  }
}
