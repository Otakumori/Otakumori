
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireLocalViewer } from '@/app/lib/auth/viewer';
export const runtime = 'nodejs';

export async function PATCH(req: Request) {
  const viewer = await requireLocalViewer();

  const { displayName } = (await req.json()) as { displayName: string };
  await prisma.user.update({ where: { id: viewer.localUserId }, data: { displayName } });
  return NextResponse.json({ ok: true, data: { updated: true } });
}
