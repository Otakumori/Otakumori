
import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
    logger.warn(`Admin ${admin.id} requested playlists`);
  } catch (error) {
    logger.error('Admin auth failed for playlist creation', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const data = await db.musicPlaylist.findMany({
    orderBy: { createdAt: 'desc' },
    include: { MusicTrack: { orderBy: { sort: 'asc' } } },
  });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
    logger.warn(`Admin ${admin.id} creating playlist`);
  } catch (error) {
    logger.error('Playlist creation error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { name, isPublic = true } = await req.json();
  const { userId } = await auth();
  if (!name || !userId)
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });

  const pl = await db.musicPlaylist.create({
    data: { name, isPublic, createdBy: userId },
  });
  return NextResponse.json({ ok: true, playlist: pl });
}
