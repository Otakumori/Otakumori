// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  const msgId = params.id;

  // toggle: if reaction exists -> remove; else -> create
  // Use the Reaction model for soapstone likes
  const existing = await prisma.reaction.findUnique({
    where: {
      messageId_userId_type: {
        messageId: msgId,
        userId,
        type: 'HEART',
      },
    },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.reaction.delete({ where: { id: existing.id } }),
      prisma.soapstoneMessage.update({
        where: { id: msgId },
        data: {
          appraises: { decrement: 1 },
        },
      }),
    ]);
    return NextResponse.json({ ok: true, liked: false });
  } else {
    // Create new heart reaction
    await prisma.$transaction([
      prisma.reaction.create({
        data: {
          messageId: msgId,
          userId,
          type: 'HEART',
        },
      }),
      prisma.soapstoneMessage.update({
        where: { id: msgId },
        data: {
          appraises: { increment: 1 },
        },
      }),
    ]);
    return NextResponse.json({ ok: true, liked: true });
  }
}
