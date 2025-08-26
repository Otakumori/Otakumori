/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
export const dynamic = "force-dynamic";      // tells Next this cannot be statically analyzed
export const runtime = "nodejs";              // keep on Node runtime (not edge)
export const preferredRegion = "iad1";        // optional: co-locate w/ your logs region
export const maxDuration = 10;                // optional guard

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { GetGameStatsResponseSchema } from '@/app/lib/contracts';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's game runs
    const gameRuns = await db.gameRun.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' }
    });

    // Group by game and calculate stats
    const gameStats = new Map<string, {
      gameKey: string;
      totalRuns: number;
      bestScore: number;
      averageScore: number;
      totalPetalsEarned: number;
      lastPlayed?: string;
    }>();

    gameRuns.forEach(run => {
      const existing = gameStats.get(run.gameKey) || {
        gameKey: run.gameKey,
        totalRuns: 0,
        bestScore: 0,
        averageScore: 0,
        totalPetalsEarned: 0,
        lastPlayed: undefined
      };

      existing.totalRuns += 1;
      existing.bestScore = Math.max(existing.bestScore, run.score);
      existing.totalPetalsEarned += run.rewardPetals;
      
      if (!existing.lastPlayed || run.startedAt > new Date(existing.lastPlayed)) {
        existing.lastPlayed = run.startedAt.toISOString();
      }

      gameStats.set(run.gameKey, existing);
    });

    // Calculate average scores
    gameStats.forEach(stats => {
      const gameRunsForGame = gameRuns.filter(run => run.gameKey === stats.gameKey);
      const totalScore = gameRunsForGame.reduce((sum, run) => sum + run.score, 0);
      stats.averageScore = Math.round(totalScore / stats.totalRuns);
    });

    // Calculate total stats
    const totalStats = {
      totalRuns: gameRuns.length,
      totalPetalsEarned: gameRuns.reduce((sum, run) => sum + run.rewardPetals, 0),
      favoriteGame: gameStats.size > 0 ? 
        Array.from(gameStats.values()).reduce((a, b) => a.totalRuns > b.totalRuns ? a : b).gameKey : 
        undefined
    };

    return NextResponse.json({
      ok: true,
      data: {
        stats: Array.from(gameStats.values()),
        totalStats
      }
    });

  } catch (error) {
    console.error('Error fetching game stats:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
