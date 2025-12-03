import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';

export const runtime = 'nodejs';

const SessionSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  userId: z.string().optional(),
  startTime: z.number(),
  endTime: z.number().optional(),
  score: z.number(),
  highScore: z.number(),
  actions: z.array(
    z.object({
      type: z.string(),
      timestamp: z.number(),
      data: z.record(z.string(), z.unknown()).optional(),
    }),
  ),
  metadata: z.record(z.string(), z.unknown()),
  synced: z.boolean(),
});

/**
 * POST /api/v1/analytics/session
 * Store game session analytics
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    // Validate request body
    const validation = SessionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid session data',
          details: validation.error.issues,
        },
        { status: 400 },
      );
    }

    const session = validation.data;

    // Store in database - only if we have a valid userId
    const finalUserId = userId || session.userId;
    if (!finalUserId) {
      return NextResponse.json({ ok: false, error: 'User ID is required' }, { status: 400 });
    }

    await db.gameSession.create({
      data: {
        id: session.id,
        gameId: session.gameId,
        userId: finalUserId,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : null,
        score: session.score,
        highScore: session.highScore,
        actions: session.actions as any,
        metadata: session.metadata as any,
      },
    });

    return NextResponse.json({
      ok: true,
      data: { sessionId: session.id },
    });
  } catch (error) {
    logger.error(
      'Session analytics error:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to store session',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/analytics/session?gameId=xxx
 * Get session statistics for a game
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const gameId = req.nextUrl.searchParams.get('gameId');
    if (!gameId) {
      return NextResponse.json({ ok: false, error: 'gameId required' }, { status: 400 });
    }

    // Get user's sessions for this game
    const sessions = await db.gameSession.findMany({
      where: {
        gameId,
        userId,
      },
      orderBy: {
        startTime: 'desc',
      },
      take: 50,
    });

    // Calculate statistics
    const totalSessions = sessions.length;
    const totalPlayTime = sessions.reduce((sum, s) => {
      const end = s.endTime || new Date();
      return sum + (end.getTime() - s.startTime.getTime());
    }, 0);
    const averageScore =
      sessions.reduce((sum, s) => sum + (s.score ?? 0), 0) / (totalSessions || 1);
    const highScore = Math.max(...sessions.map((s) => s.highScore ?? 0), 0);

    return NextResponse.json({
      ok: true,
      data: {
        totalSessions,
        totalPlayTime,
        averageScore,
        highScore,
        recentSessions: sessions.slice(0, 10).map((s) => ({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          score: s.score,
          duration: s.endTime ? s.endTime.getTime() - s.startTime.getTime() : null,
        })),
      },
    });
  } catch (error) {
    logger.error(
      'Session stats error:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
