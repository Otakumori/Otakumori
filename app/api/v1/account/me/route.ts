// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';
export const runtime = 'nodejs';

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { id: u.id },
    select: { id: true, username: true, displayName: true, avatarUrl: true, petalBalance: true },
  });
  if (!me) return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });

  return NextResponse.json({
    ok: true,
    data: {
      id: me.id,
      username: me.username,
      displayName: me.displayName,
      legalName: null, // Not in current schema
      avatarUrl: me.avatarUrl,
      petalBalance: me.petalBalance,
    },
  });
}
