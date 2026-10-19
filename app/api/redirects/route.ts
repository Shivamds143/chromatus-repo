import { NextRequest, NextResponse } from 'next/server';
import { findActiveRedirect } from '@/lib/redirects';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  if (!path) return NextResponse.json({ redirect: null });

  try {
    const row = await findActiveRedirect(path);
    if (!row) return NextResponse.json({ redirect: null });
    return NextResponse.json({
      redirect: {
        fromPath: row.from_path,
        toPath: row.to_path,
        statusCode: row.status_code || 301,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ redirect: null, error: err?.message }, { status: 500 });
  }
}
