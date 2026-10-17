import { NextResponse } from 'next/server';
import { getGlobalElements } from '@/lib/globalElements';
import { getSiteSettings } from '@/lib/settings';
import { getFooterCustomPages } from '@/lib/customPages';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [elements, settings, footerPages] = await Promise.all([
      getGlobalElements(),
      getSiteSettings(),
      getFooterCustomPages()
    ]);
    return NextResponse.json({ elements, settings, footerPages });
  } catch (error: any) {
    console.error('[api/global-elements] failed to load global elements:', error);
    return NextResponse.json({ error: error?.message || 'Failed to load global elements' }, { status: 500 });
  }
}
