import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { DAILY_QUESTS } from '@/app/lib/quests';

const db = new PrismaClient();

function startOfDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split('T')[0];
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ quests: DAILY_QUESTS, progress: {}, claimed: [] });

  const today = startOfDay();
  const assignments = await db.questAssignment
    .findMany({ where: { userId, day: today } })
    .catch(() => []);

  const progressMap: Record<string, number> = Object.fromEntries(
    assignments.map((a) => [a.questId, a.progress]),
  );
  const claimedIds: string[] = assignments.filter((a) => a.claimedAt).map((a) => a.questId);
  return NextResponse.json({ quests: DAILY_QUESTS, progress: progressMap, claimed: claimedIds });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });
  const { questId } = await req.json();
  const q = DAILY_QUESTS.find((q) => q.id === questId);
  if (!q) return new NextResponse('Not found', { status: 404 });

  const today = startOfDay();

  const assignment = await db.questAssignment
    .findUnique({ where: { userId_questId_day: { userId, questId, day: today } } })
    .catch(() => null);

  if (!assignment || assignment.progress < q.target) {
    return new NextResponse('Not complete', { status: 400 });
  }

  if (assignment.claimedAt) {
    return new NextResponse('Already claimed', { status: 409 });
  }

  // reward petals
  await db.$transaction([
    db.questAssignment.update({
      where: { id: assignment.id },
      data: { claimedAt: new Date() },
    }),
    db.petalWallet.upsert({
      where: { userId },
      update: { balance: { increment: q.reward } },
      create: { User: { connect: { id: userId } }, balance: q.reward },
    }),
  ]);

  return NextResponse.json({ ok: true, reward: q.reward });
}
