import { NextResponse } from 'next/server';
import { getCookieConsentSettings } from '@/lib/cookieConsent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getCookieConsentSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('[api/cookie-settings] failed to load cookie settings:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to load cookie settings' },
      { status: 500 }
    );
  }
}
