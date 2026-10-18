import { NextResponse } from 'next/server';
import { performSearch } from '@/lib/search';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const data = await performSearch(q);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[api/search] search error:', error);
    return NextResponse.json(
      { error: error?.message || 'Search failed', results: [], pages: [], articles: [] },
      { status: 500 }
    );
  }
}
