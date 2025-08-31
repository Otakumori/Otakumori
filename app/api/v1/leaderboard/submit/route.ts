import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { SubmitScoreRequestSchema, SubmitScoreResponseSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = SubmitScoreRequestSchema.parse(body);

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get or create leaderboards for all scopes and periods
    const leaderboards = await Promise.all([
      // Global leaderboards
      db.leaderboard.findFirst({
        where: {
          gameCode: validatedData.gameCode,
          scope: 'global',
          period: 'daily',
        },
      }),
      db.leaderboard.findFirst({
        where: {
          gameCode: validatedData.gameCode,
          scope: 'global',
          period: 'weekly',
        },
      }),
      db.leaderboard.findFirst({
        where: {
          gameCode: validatedData.gameCode,
          scope: 'global',
          period: 'all',
        },
      }),
      // Friends leaderboards
      db.leaderboard.findFirst({
        where: {
          gameCode: validatedData.gameCode,
          scope: 'friends',
          period: 'daily',
        },
      }),
      db.leaderboard.findFirst({
        where: {
          gameCode: validatedData.gameCode,
          scope: 'friends',
          period: 'weekly',
        },
      }),
      db.leaderboard.findFirst({
        where: {
          gameCode: validatedData.gameCode,
          scope: 'friends',
          period: 'all',
        },
      }),
    ]);

    // Create missing leaderboards
    const createdLeaderboards = await Promise.all(
      leaderboards.map(async (board, index) => {
        if (!board) {
          const scopes = ['global', 'global', 'global', 'friends', 'friends', 'friends'];
          const periods = ['daily', 'weekly', 'all', 'daily', 'weekly', 'all'];

          return await db.leaderboard.create({
            data: {
              gameCode: validatedData.gameCode,
              scope: scopes[index],
              period: periods[index],
            },
          });
        }
        return board;
      }),
    );

    let isPersonalBest = false;
    let newRank = undefined;
    let previousRank = undefined;

    // Submit score to all leaderboards
    for (const leaderboard of createdLeaderboards) {
      // Check if this is a personal best for this leaderboard
      const existingScore = await db.leaderboardScore.findFirst({
        where: {
          boardId: leaderboard.id,
          profileId: currentUser.id,
        },
        orderBy: { score: 'desc' },
      });

      if (!existingScore || validatedData.score > existingScore.score) {
        isPersonalBest = true;

        // Get previous rank
        if (existingScore) {
          const betterScores = await db.leaderboardScore.count({
            where: {
              boardId: leaderboard.id,
              score: { gt: existingScore.score },
            },
          });
          previousRank = betterScores + 1;
        }

        // Upsert the score using the existing unique constraint
        await db.leaderboardScore.upsert({
          where: {
            userId_game_diff: {
              userId: currentUser.id,
              game: validatedData.gameCode,
              diff: leaderboard.period,
            },
          },
          update: {
            score: validatedData.score,
            statsJson: validatedData.meta || {},
            boardId: leaderboard.id,
            profileId: currentUser.id,
            meta: validatedData.meta || {},
            createdAt: new Date(),
          },
          create: {
            userId: currentUser.id,
            game: validatedData.gameCode,
            diff: leaderboard.period,
            score: validatedData.score,
            statsJson: validatedData.meta || {},
            boardId: leaderboard.id,
            profileId: currentUser.id,
            meta: validatedData.meta || {},
          },
        });

        // Calculate new rank
        const betterScores = await db.leaderboardScore.count({
          where: {
            boardId: leaderboard.id,
            score: { gt: validatedData.score },
          },
        });
        newRank = betterScores + 1;
      }
    }

    // Create activity for the score submission
    await db.activity.create({
      data: {
        profileId: currentUser.id,
        type: 'score',
        payload: {
          gameCode: validatedData.gameCode,
          score: validatedData.score,
          isPersonalBest,
          newRank,
        },
        visibility: 'public',
      },
    });

    const response = SubmitScoreResponseSchema.parse({
      success: true,
      newRank,
      previousRank,
      isPersonalBest,
    });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Score submission error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
