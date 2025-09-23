// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // For now: serve the newest public playlist
    const pl = await prisma.musicPlaylist.findFirst({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: { tracks: { orderBy: { sort: 'asc' } } },
    });

    return NextResponse.json({ ok: true, playlist: pl ?? null });
  } catch (error) {
    console.error('Music playlist API error:', error);
    // Return empty playlist to prevent errors
    return NextResponse.json({
      ok: true,
      playlist: null,
    });
  }
}
