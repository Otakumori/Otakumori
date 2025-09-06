// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/authz';

export const runtime = 'nodejs';

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await requireAdmin();
    // admin is { id: string } on success
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  await prisma.musicTrack.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
