import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import {
  GameSaveCreateSchema,
  createApiSuccess,
  createApiError,
  generateRequestId,
} from '../../../lib/api-contracts';
import { checkIdempotency, storeIdempotencyResponse } from '../../../lib/idempotency';
import { withRateLimit } from '../../../lib/rate-limiting';

export const runtime = 'nodejs';

// POST /api/v1/game-saves - Save game progress
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        createApiError('AUTH_REQUIRED', 'Authentication required', requestId),
        {
          status: 401,
          headers: { 'x-otm-reason': 'AUTH_REQUIRED' },
        },
      );
    }

    // Check idempotency
    const idempotencyKey = req.headers.get('x-idempotency-key');
    if (idempotencyKey) {
      const idempotencyResult = await checkIdempotency(idempotencyKey);
      if (idempotencyResult.response) {
        return idempotencyResult.response;
      }
    }

    // Apply rate limiting
    const rateLimitedHandler = withRateLimit('GAME_SAVE', async (req) => {
      // Parse and validate request body
      const body = await req.json();
      const validation = GameSaveCreateSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          createApiError(
            'VALIDATION_ERROR',
            'Invalid request data',
            requestId,
            validation.error.issues,
          ),
          { status: 400 },
        );
      }

      const { gameId, slot, payload } = validation.data;

      // Validate game ID exists in our games list
      const validGameIds = [
        'samurai-petal-slice',
        'anime-memory-match',
        'bubble-pop-gacha',
        'otaku-beat-em-up',
        'petal-collection',
        'memory-match',
        'bubble-girl',
        'petal-storm-rhythm',
        'bubble-ragdoll',
        'blossomware',
        'dungeon-of-desire',
        'maid-cafe-manager',
        'thigh-coliseum',
        'quick-math',
        'puzzle-reveal',
        'petal-samurai',
      ];

      if (!validGameIds.includes(gameId)) {
        return NextResponse.json(createApiError('VALIDATION_ERROR', 'Invalid game ID', requestId), {
          status: 400,
        });
      }

      try {
        // Upsert game save (create or update)
        const gameSave = await db.gameSave.upsert({
          where: {
            userId_gameId_slot: {
              userId,
              gameId,
              slot,
            },
          },
          update: {
            payload,
            updatedAt: new Date(),
          },
          create: {
            userId,
            gameId,
            slot,
            payload,
          },
        });

        const response = createApiSuccess(
          {
            id: gameSave.id,
            gameId: gameSave.gameId,
            slot: gameSave.slot,
            payload: gameSave.payload,
            updatedAt: gameSave.updatedAt,
          },
          requestId,
        );

        // Store idempotency response
        const idempotencyKey = req.headers.get('idempotency-key');
        if (idempotencyKey) {
          await storeIdempotencyResponse(idempotencyKey, response);
        }

        return NextResponse.json(response, { status: 200 });
      } catch (error: any) {
        console.error('Error saving game:', error);
        return NextResponse.json(
          createApiError('INTERNAL_ERROR', 'Failed to save game', requestId),
          { status: 500 },
        );
      }
    });

    return rateLimitedHandler(req);
  } catch (error) {
    console.error('Error in game save handler:', error);
    return NextResponse.json(createApiError('INTERNAL_ERROR', 'Failed to save game', requestId), {
      status: 500,
    });
  }
}

// GET /api/v1/game-saves - Get user's game saves
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        createApiError('AUTH_REQUIRED', 'Authentication required', requestId),
        {
          status: 401,
          headers: { 'x-otm-reason': 'AUTH_REQUIRED' },
        },
      );
    }

    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

    const gameSaves = await db.gameSave.findMany({
      where: {
        userId,
        ...(gameId && { gameId }),
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(
      createApiSuccess(
        {
          saves: gameSaves.map((save) => ({
            id: save.id,
            gameId: save.gameId,
            slot: save.slot,
            payload: save.payload,
            updatedAt: save.updatedAt,
          })),
        },
        requestId,
      ),
    );
  } catch (error) {
    console.error('Error fetching game saves:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch game saves', requestId),
      { status: 500 },
    );
  }
}
