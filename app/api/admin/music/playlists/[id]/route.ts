// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
    console.log(`Admin ${admin.id} updating playlist ${params.id}`);
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { name, isPublic } = await req.json();
  const pl = await db.musicPlaylist.update({
    where: { id: params.id },
    data: { ...(name && { name }), ...(typeof isPublic === 'boolean' && { isPublic }) },
  });
  return NextResponse.json({ ok: true, playlist: pl });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
    console.log(`Admin ${admin.id} deleting playlist ${params.id}`);
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await db.musicTrack.deleteMany({ where: { playlistId: params.id } });
  await db.musicPlaylist.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
