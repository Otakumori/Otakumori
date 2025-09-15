import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { DAILY_QUESTS } from '@/app/lib/quests';

const db = new PrismaClient();

function startOfDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ quests: DAILY_QUESTS, progress: {}, claimed: [] });

  const today = startOfDay();
  const progress = await db.questProgress
    .findMany({ where: { userId, date: today } })
    .catch(() => []);
  const claimed = await db.questClaim.findMany({ where: { userId, date: today } }).catch(() => []);

  const progressMap: Record<string, number> = Object.fromEntries(
    progress.map((p: { questId: string; count: number }) => [p.questId, p.count]),
  );
  const claimedIds: string[] = claimed.map((c: { questId: string }) => c.questId);
  return NextResponse.json({ quests: DAILY_QUESTS, progress: progressMap, claimed: claimedIds });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthorized', { status: 401 });
  const { questId } = await req.json();
  const q = DAILY_QUESTS.find((q) => q.id === questId);
  if (!q) return new NextResponse('Not found', { status: 404 });

  const today = startOfDay();

  const prog: { count: number } | null = await db.questProgress
    .findUnique({ where: { userId_date_questId: { userId, date: today, questId } } })
    .catch(() => null);
  const count = prog?.count ?? 0;

  if (count < q.target) return new NextResponse('Not complete', { status: 400 });

  const already: { id: string } | null = await db.questClaim
    .findUnique({ where: { userId_date_questId: { userId, date: today, questId } } })
    .catch(() => null);
  if (already) return new NextResponse('Already claimed', { status: 409 });

  // reward petals
  await db.$transaction([
    db.questClaim.create({ data: { userId, date: today, questId } }),
    db.userPetals.upsert({
      where: { userId },
      update: { total: { increment: q.reward } },
      create: { userId, total: q.reward },
    }),
  ]);

  return NextResponse.json({ ok: true, reward: q.reward });
}
