// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
    console.warn(`Admin ${admin.id} deleting track ${params.id}`);
  } catch (error) {
    console.error('Admin auth failed for track deletion:', error);
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await db.musicTrack.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
