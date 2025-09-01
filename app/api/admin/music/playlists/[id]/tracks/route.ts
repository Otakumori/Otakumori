 
 
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ ok: false }, { status: admin.status });

  const { title, artist, url } = await req.json();
  if (!title || !url)
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });

  const maxSort = await prisma.musicTrack.aggregate({
    _max: { sort: true },
    where: { playlistId: params.id },
  });

  const track = await prisma.musicTrack.create({
    data: {
      playlistId: params.id,
      title,
      artist: artist ?? '',
      url,
      sort: (maxSort._max.sort ?? 0) + 1,
    },
  });
  return NextResponse.json({ ok: true, track });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ ok: false }, { status: admin.status });

  // Reorder: { order: [{id, sort}, ...] }
  const { order } = await req.json();
  if (!Array.isArray(order))
    return NextResponse.json({ ok: false, error: 'Invalid order format' }, { status: 400 });

  await prisma.$transaction(
    order.map((o: { id: string; sort: number }) =>
      prisma.musicTrack.update({ where: { id: o.id }, data: { sort: o.sort } }),
    ),
  );
  return NextResponse.json({ ok: true });
}
