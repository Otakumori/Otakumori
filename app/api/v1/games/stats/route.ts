
export const dynamic = 'force-dynamic'; // tells Next this cannot be statically analyzed
export const runtime = 'nodejs'; // keep on Node runtime (not edge)
export const preferredRegion = 'iad1'; // optional: co-locate w/ your logs region
export const maxDuration = 10; // optional guard

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.warn('Game stats requested from:', request.headers.get('user-agent'));
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get user's game runs
    const gameRuns = await db.gameRun.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
    });

    type GameStatAccumulator = {
      gameKey: string;
      totalRuns: number;
      totalScore: number;
      bestScore: number;
      totalPetalsEarned: number;
      lastPlayed?: string;
    };

    const accumulators = new Map<string, GameStatAccumulator>();

    for (const run of gameRuns) {
      let stats = accumulators.get(run.gameKey);
      if (!stats) {
        stats = {
          gameKey: run.gameKey,
          totalRuns: 0,
          totalScore: 0,
          bestScore: 0,
          totalPetalsEarned: 0,
        };
        accumulators.set(run.gameKey, stats);
      }

      stats.totalRuns += 1;
      stats.totalScore += run.score;
      stats.bestScore = Math.max(stats.bestScore, run.score);
      stats.totalPetalsEarned += run.rewardPetals;

      const startedAtIso = run.startedAt.toISOString();
      if (!stats.lastPlayed || startedAtIso > stats.lastPlayed) {
        stats.lastPlayed = startedAtIso;
      }
    }

    const statsList = Array.from(accumulators.values());
    const responseStats = statsList.map((stat) => {
      const { totalScore, lastPlayed, ...rest } = stat;
      const base = {
        ...rest,
        averageScore: rest.totalRuns > 0 ? Math.round(totalScore / rest.totalRuns) : 0,
      };
      return lastPlayed ? { ...base, lastPlayed } : base;
    });

    const totalStats = {
      totalRuns: gameRuns.length,
      totalPetalsEarned: gameRuns.reduce((sum, run) => sum + run.rewardPetals, 0),
      favoriteGame: statsList.length
        ? statsList.reduce((prev, current) => (current.totalRuns > prev.totalRuns ? current : prev))
            .gameKey
        : undefined,
    };
    return NextResponse.json({
      ok: true,
      data: {
        stats: responseStats,
        totalStats,
      },
    });
  } catch (error) {
    console.error('Error fetching game stats:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
