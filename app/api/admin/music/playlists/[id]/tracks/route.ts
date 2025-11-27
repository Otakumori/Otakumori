
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
    console.warn(`Admin ${admin.id} adding track to playlist ${params.id}`);
  } catch (error) {
    console.error('Admin auth failed for track addition:', error);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { title, artist, url } = await req.json();
  if (!title || !url)
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });

  const maxSort = await db.musicTrack.aggregate({
    _max: { sort: true },
    where: { playlistId: params.id },
  });

  const track = await db.musicTrack.create({
    data: {
      MusicPlaylist: { connect: { id: params.id } },
      title,
      artist: artist ?? '',
      url,
      sort: (maxSort._max.sort ?? 0) + 1,
    },
  });
  return NextResponse.json({ ok: true, track });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
    console.warn(`Admin ${admin.id} reordering tracks in playlist ${params.id}`);
  } catch (error) {
    console.error('Admin auth failed for track reordering:', error);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Reorder: { order: [{id, sort}, ...] }
  const { order } = await req.json();
  if (!Array.isArray(order))
    return NextResponse.json({ ok: false, error: 'Invalid order format' }, { status: 400 });

  await db.$transaction(
    order.map((o: { id: string; sort: number }) =>
      db.musicTrack.update({ where: { id: o.id }, data: { sort: o.sort } }),
    ),
  );
  return NextResponse.json({ ok: true });
}
