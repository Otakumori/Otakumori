// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
    console.log(`Admin ${admin.id} requested playlists`);
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const data = await db.musicPlaylist.findMany({
    orderBy: { createdAt: 'desc' },
    include: { tracks: { orderBy: { sort: 'asc' } } },
  });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
    console.log(`Admin ${admin.id} creating playlist`);
  } catch (error) {
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
