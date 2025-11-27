
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = params.id;
  // toggle Reaction(type='APPRAISE')
  // Use the correct compound unique constraint for (messageId, userId, type)
  const existing = await db.reaction.findUnique({
    where: {
      messageId_userId_type: {
        messageId: id,
        userId,
        type: 'APPRAISE',
      },
    },
  });

  if (existing) {
    await db.$transaction([
      db.reaction.delete({ where: { id: existing.id } }),
      db.soapstoneMessage.update({ where: { id }, data: { appraises: { decrement: 1 } } }),
    ]);
    return NextResponse.json({ ok: true, appraised: false });
  } else {
    await db.$transaction([
      db.reaction.create({ data: { messageId: id, userId, type: 'APPRAISE' } }),
      db.soapstoneMessage.update({ where: { id }, data: { appraises: { increment: 1 } } }),
    ]);
    return NextResponse.json({ ok: true, appraised: true });
  }
}
