/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';
export const runtime = 'nodejs';

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { id: u.id },
    select: { id: true, username: true, display_name: true, avatarUrl: true, petalBalance: true },
  });
  if (!me) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

  return NextResponse.json({
    ok: true,
    data: {
      id: me.id,
      username: me.username,
      displayName: me.display_name,
      legalName: null, // Not in current schema
      avatarUrl: me.avatarUrl,
      petalBalance: me.petalBalance,
    },
  });
}
