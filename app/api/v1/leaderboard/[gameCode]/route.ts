import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { LeaderboardRequestSchema, LeaderboardResponseSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: { gameCode: string } }) {
  try {
    const { userId } = auth();
    const { gameCode } = params;
    const { searchParams } = new URL(request.url);

    const queryParams = {
      gameCode,
      scope: searchParams.get('scope') || 'global',
      period: searchParams.get('period') || 'daily',
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    const validatedParams = LeaderboardRequestSchema.parse(queryParams);

    // Get current user if authenticated
    let currentUser = null;
    if (userId) {
      currentUser = await db.user.findUnique({
        where: { clerkId: userId },
      });
    }

    // Get or create leaderboard
    let leaderboard = await db.leaderboard.findFirst({
      where: {
        gameCode: validatedParams.gameCode,
        scope: validatedParams.scope,
        period: validatedParams.period,
      },
    });

    if (!leaderboard) {
      // Create new leaderboard if it doesn't exist
      leaderboard = await db.leaderboard.create({
        data: {
          gameCode: validatedParams.gameCode,
          scope: validatedParams.scope,
          period: validatedParams.period,
        },
      });
    }

    // Build where clause for scores
    let whereClause: any = {
      boardId: leaderboard.id,
    };

    // If friends scope, filter to friends only
    if (validatedParams.scope === 'friends' && currentUser) {
      // Get mutual followers (friends)
      const friends = await db.user.findMany({
        where: {
          AND: [
            {
              followers: {
                some: { followerId: currentUser.id },
              },
            },
            {
              following: {
                some: { followeeId: currentUser.id },
              },
            },
          ],
        },
        select: { id: true },
      });

      const friendIds = friends.map((f) => f.id);
      friendIds.push(currentUser.id); // Include current user

      whereClause.profileId = { in: friendIds };
    }

    // Get scores with user info
    const scores = await db.leaderboardScore.findMany({
      where: whereClause,
      include: {
        profile: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: [
        { score: 'desc' },
        { createdAt: 'asc' }, // Earlier submission wins ties
      ],
      take: validatedParams.limit,
    });

    // Calculate ranks
    const scoresWithRanks = scores.map((score, index) => ({
      profileId: score.profileId,
      username: score.profile?.username || 'Unknown',
      display_name: score.profile?.display_name || null,
      avatarUrl: score.profile?.avatarUrl || null,
      score: score.score,
      rank: index + 1,
      meta: score.meta as any,
      createdAt: score.createdAt.toISOString(),
    }));

    // Get user's rank if authenticated
    let userRank = undefined;
    if (currentUser) {
      const userScore = await db.leaderboardScore.findFirst({
        where: {
          boardId: leaderboard.id,
          profileId: currentUser.id,
        },
        orderBy: { score: 'desc' },
      });

      if (userScore) {
        // Count how many scores are better than user's score
        const betterScores = await db.leaderboardScore.count({
          where: {
            boardId: leaderboard.id,
            score: { gt: userScore.score },
          },
        });

        userRank = {
          rank: betterScores + 1,
          score: userScore.score,
        };
      }
    }

    // Get total player count
    const totalPlayers = await db.leaderboardScore.count({
      where: { boardId: leaderboard.id },
    });

    // Build response
    const responseData = {
      gameCode: validatedParams.gameCode,
      scope: validatedParams.scope,
      period: validatedParams.period,
      scores: scoresWithRanks,
      userRank,
      totalPlayers,
    };

    const validatedResponse = LeaderboardResponseSchema.parse(responseData);

    return NextResponse.json({ ok: true, data: validatedResponse });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid query parameters' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
