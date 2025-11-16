import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { DAILY_QUESTS } from '@/app/lib/quests';
import { PetalService } from '@/app/lib/petals';

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

  // Mark quest as claimed
  await db.questAssignment.update({
    where: { id: assignment.id },
    data: { claimedAt: new Date() },
  });

  // Award petals using PetalService (tracks lifetimeEarned)
  const petalService = new PetalService();
  const petalResult = await petalService.awardPetals(userId, {
    type: 'earn',
    amount: q.reward,
    reason: `Quest reward: ${q.id}`,
    source: 'other', // Quest rewards are separate from games/achievements
    metadata: {
      questId: q.id,
      questTitle: q.title,
    },
  });

  return NextResponse.json({
    ok: true,
    reward: petalResult.success ? petalResult.awarded : q.reward,
    balance: petalResult.newBalance,
    lifetimePetalsEarned: petalResult.lifetimePetalsEarned,
  });
}
