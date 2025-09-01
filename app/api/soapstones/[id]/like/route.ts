 
 
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const msgId = params.id;

  // toggle: if like exists -> remove; else -> create
  const existing = await prisma.soapstoneLike.findUnique({
    where: { messageId_userId: { messageId: msgId, userId } },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.soapstoneLike.delete({ where: { id: existing.id } }),
      prisma.soapstoneMessage.update({
        where: { id: msgId },
        data: { upvotes: { decrement: 1 } },
      }),
    ]);
    return NextResponse.json({ ok: true, liked: false });
  } else {
    await prisma.$transaction([
      prisma.soapstoneLike.create({ data: { messageId: msgId, userId } }),
      prisma.soapstoneMessage.update({
        where: { id: msgId },
        data: { upvotes: { increment: 1 } },
      }),
    ]);
    return NextResponse.json({ ok: true, liked: true });
  }
}
