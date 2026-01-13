import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/lib/request-id';
import { withRateLimit } from '@/app/lib/rate-limiting';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return withRateLimit('game-stats-get', async () => {
    const requestId = generateRequestId();

    try {
      const { userId: clerkId } = await auth();
      if (!clerkId) {
        return NextResponse.json(
          { ok: false, error: 'Authentication required', requestId },
          { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
        );
      }

      // Convert Clerk ID to database user ID
      const user = await db.user.findUnique({
        where: { clerkId },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json(
          { ok: false, error: 'User not found', requestId },
          { status: 404 },
        );
      }

      // Get all user's best scores per game
      const bestScores = await db.leaderboardScore.findMany({
        where: {
          userId: user.id,
        },
        select: {
          game: true,
          score: true,
          diff: true,
          createdAt: true,
        },
        orderBy: {
          score: 'desc',
        },
      });

      // Get petal transactions for games
      const petalTransactions = await db.petalTransaction.findMany({
        where: {
          userId: user.id,
          source: {
            in: ['petal-samurai', 'petal-storm-rhythm', 'memory-match', 'bubble-girl', 'puzzle-reveal'],
          },
        },
        select: {
          amount: true,
          source: true,
          createdAt: true,
        },
      });

      // Aggregate stats per game
      const gameStatsMap = new Map<
        string,
        {
          gameId: string;
          bestScore: number;
          petalsEarned: number;
          gamesPlayed: number;
        }
      >();

      // Process best scores
      for (const score of bestScores) {
        const gameId = score.game;
        if (!gameStatsMap.has(gameId)) {
          gameStatsMap.set(gameId, {
            gameId,
            bestScore: score.score,
            petalsEarned: 0,
            gamesPlayed: 1,
          });
        } else {
          const stats = gameStatsMap.get(gameId)!;
          if (score.score > stats.bestScore) {
            stats.bestScore = score.score;
          }
          stats.gamesPlayed++;
        }
      }

      // Process petal transactions
      for (const transaction of petalTransactions) {
        if (transaction.amount > 0) {
          // Only count earned petals (positive amounts)
          const gameId = transaction.source;
          if (!gameStatsMap.has(gameId)) {
            gameStatsMap.set(gameId, {
              gameId,
              bestScore: 0,
              petalsEarned: transaction.amount,
              gamesPlayed: 0,
            });
          } else {
            const stats = gameStatsMap.get(gameId)!;
            stats.petalsEarned += transaction.amount;
          }
        }
      }

      // Convert to array and format
      const stats = Array.from(gameStatsMap.values()).map((stat) => ({
        gameId: stat.gameId,
        bestScore: stat.bestScore > 0 ? stat.bestScore : undefined,
        petalsEarned: stat.petalsEarned > 0 ? stat.petalsEarned : undefined,
        gamesPlayed: stat.gamesPlayed,
      }));

      return NextResponse.json({
        ok: true,
        data: {
          stats,
          totalGames: stats.length,
        },
        requestId,
      });
    } catch (error) {
      console.error('Game stats error:', error);
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to fetch game stats',
          requestId,
        },
        { status: 500 },
      );
    }
  });
}
