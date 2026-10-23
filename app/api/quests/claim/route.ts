import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { awardStreakShardIfEligible, userDayNY } from '@/app/lib/quests/server';
import { db } from '@/lib/db';
import { grantPetals } from '@/app/lib/petals/grant';

const ClaimRequestSchema = z.object({
  assignmentId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'auth' }, { status: 401 });
    }

    const body = ClaimRequestSchema.parse(await request.json());

    const assignment = await db.questAssignment.findUnique({
      where: { id: body.assignmentId },
      include: { Quest: true },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'notfound' }, { status: 404 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true, petalBalance: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'notfound' }, { status: 404 });
    }

    if (assignment.userId !== user.id) {
      return NextResponse.json({ error: 'forbidden' }, { status: 403 });
    }

    if (!assignment.completedAt) {
      return NextResponse.json({ error: 'incomplete' }, { status: 400 });
    }

    if (assignment.claimedAt) {
      return NextResponse.json({ ok: true, already: true, message: 'Already claimed' });
    }

    const quest = assignment.Quest;
    if (!quest) {
      return NextResponse.json({ error: 'quest_not_found' }, { status: 404 });
    }

    const day = assignment.day ?? userDayNY();
    const baseReward = quest.basePetals ?? 0;
    const bonusReward = assignment.bonusEligible ? (quest.bonusPetals ?? 0) : 0;
    const totalReward = baseReward + bonusReward;

    if (totalReward <= 0) {
      return NextResponse.json({ error: 'reward_unavailable' }, { status: 409 });
    }

    // Central reward authority owns source caps and persistence. The stable key makes
    // retries/concurrent claims safe if this request fails after the reward commits.
    const petalResult = await grantPetals({
      userId: user.id,
      amount: totalReward,
      source: 'quest_reward',
      metadata: {
        assignmentId: assignment.id,
        questKey: quest.key,
        questTitle: quest.title,
        bonusEligible: assignment.bonusEligible,
      },
      description: `Quest reward: ${quest.key}`,
      idempotencyKey: `quest_assignment:${assignment.id}`,
    });

    if (!petalResult.success) {
      return NextResponse.json(
        { error: 'reward_failed', code: petalResult.errorCode },
        { status: 503 },
      );
    }

    if (petalResult.granted <= 0 && !petalResult.duplicate) {
      return NextResponse.json({ error: 'daily_cap_reached' }, { status: 429 });
    }

    const claim = await db.questAssignment.updateMany({
      where: { id: assignment.id, claimedAt: null },
      data: { claimedAt: new Date() },
    });

    if (claim.count === 0) {
      return NextResponse.json({ ok: true, already: true, message: 'Already claimed' });
    }

    const streakShardAwarded = await awardStreakShardIfEligible(user.id, day);

    return NextResponse.json({
      ok: true,
      petalsGranted: petalResult.granted,
      totalReward,
      capped: petalResult.limited || false,
      dailyCapRemaining: petalResult.dailyRemaining,
      streakShardAwarded,
      newBalance: petalResult.newBalance,
      lifetimePetalsEarned: petalResult.lifetimeEarned,
      quest: {
        key: quest.key,
        title: quest.title,
        basePetals: quest.basePetals,
        bonusPetals: quest.bonusPetals,
        bonusEligible: assignment.bonusEligible,
      },
    });
  } catch (error) {
    logger.error(
      'Quest claim error',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
