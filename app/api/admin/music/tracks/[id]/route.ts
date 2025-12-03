
import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
    logger.warn(`Admin ${admin.id} deleting track ${params.id}`);
  } catch (error) {
    logger.error('Admin auth failed for track operation', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await db.musicTrack.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
