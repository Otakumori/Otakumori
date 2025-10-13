import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/v1/leaderboard?gameId=xxx&limit=10
 * Get top players for a game
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const gameId = req.nextUrl.searchParams.get('gameId');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10);

    if (!gameId) {
      return NextResponse.json({ ok: false, error: 'gameId required' }, { status: 400 });
    }

    // Get top scores for the game
    const topScores = await db.gameSession.findMany({
      where: {
        gameId,
        endTime: {
          not: null,
        },
      },
      select: {
        userId: true,
        highScore: true,
      },
      orderBy: {
        highScore: 'desc',
      },
      take: limit,
    });

    // Format leaderboard entries (using userId for now, can add User join later)
    const entries = topScores.map((score, index) => ({
      rank: index + 1,
      username: score.userId ? `Player_${score.userId.slice(0, 8)}` : 'Anonymous',
      score: score.highScore,
      avatar: undefined,
      isCurrentUser: score.userId === userId,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        gameId,
        entries,
        total: entries.length,
      },
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
