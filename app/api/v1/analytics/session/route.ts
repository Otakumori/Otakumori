import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  isMissingSchemaError,
  requireLocalViewer,
} from '@/app/lib/auth/viewer';

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

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}

/**
 * POST /api/v1/analytics/session
 * Store game session analytics
 */
export async function POST(req: NextRequest) {
  try {
    const { localUserId } = await requireLocalViewer();
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

    await db.gameSession.create({
      data: {
        id: session.id,
        gameId: session.gameId,
        userId: localUserId,
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
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof LocalUserUnavailableError || isMissingSchemaError(error)) {
      return NextResponse.json(
        { ok: false, error: 'Session analytics are temporarily unavailable' },
        { status: 503 },
      );
    }
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        {
          ok: false,
          error: 'DUPLICATE_SESSION',
          message: 'This game session has already been recorded.',
        },
        { status: 409 },
      );
    }
    const { logger } = await import('@/app/lib/logger');
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
    const { localUserId } = await requireLocalViewer();

    const gameId = req.nextUrl.searchParams.get('gameId');
    if (!gameId) {
      return NextResponse.json({ ok: false, error: 'gameId required' }, { status: 400 });
    }

    // Get user's sessions for this game
    const sessions = await db.gameSession.findMany({
      where: {
        gameId,
        userId: localUserId,
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
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof LocalUserUnavailableError || isMissingSchemaError(error)) {
      return NextResponse.json(
        { ok: false, error: 'Session analytics are temporarily unavailable' },
        { status: 503 },
      );
    }
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'Session stats error:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'Failed to fetch stats' }, { status: 500 });
  }
}
