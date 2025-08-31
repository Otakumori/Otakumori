/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';
export const runtime = 'nodejs';

export async function PATCH(req: Request) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const { displayName } = (await req.json()) as { displayName: string };
  await prisma.user.update({ where: { id: u.id }, data: { display_name: displayName } });
  return NextResponse.json({ ok: true, data: { updated: true } });
}
