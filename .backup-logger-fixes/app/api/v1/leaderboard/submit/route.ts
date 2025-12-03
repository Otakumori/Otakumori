
import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { SubmitScoreRequestSchema, SubmitScoreResponseSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

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

    const leaderboardConfigs = [
      { scope: 'global', period: 'daily' },
      { scope: 'global', period: 'weekly' },
      { scope: 'global', period: 'all' },
      { scope: 'friends', period: 'daily' },
      { scope: 'friends', period: 'weekly' },
      { scope: 'friends', period: 'all' },
    ] as const;

    const existingLeaderboards = await Promise.all(
      leaderboardConfigs.map((config) =>
        db.leaderboard.findFirst({
          where: {
            gameCode: validatedData.gameCode,
            scope: config.scope,
            period: config.period,
          },
        }),
      ),
    );

    const leaderboards = await Promise.all(
      leaderboardConfigs.map((config, index) => {
        const board = existingLeaderboards[index];
        if (board) return board;
        return db.leaderboard.create({
          data: {
            gameCode: validatedData.gameCode,
            scope: config.scope,
            period: config.period,
          },
        });
      }),
    );
    let isPersonalBest = false;
    let newRank: number | undefined;
    let previousRank: number | undefined;

    // Submit score to all leaderboards
    for (const leaderboard of leaderboards) {
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
    logger.error('Score submission error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
