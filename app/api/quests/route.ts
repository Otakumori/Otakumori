import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { DAILY_QUESTS } from '@/app/lib/quests';
import { legacyRewardRouteDisabled } from '@/app/lib/petals/legacyRewardRoute';

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

export async function POST() {
  return legacyRewardRouteDisabled('/api/quests/claim');
}
