import { NextResponse } from 'next/server';
import { getMediaById } from '@/lib/media';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const { id } = params;
  const item = await getMediaById(id);

  if (!item) {
    return new NextResponse('Media not found', { status: 404 });
  }

  if (item.data) {
    const buffer = Buffer.from(item.data, 'base64');
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': item.mime_type || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(buffer.length)
      }
    });
  }

  if (item.url && item.url !== `/api/media/${id}`) {
    return NextResponse.redirect(new URL(item.url, request.url));
  }

  return new NextResponse('Media content not found', { status: 404 });
}
