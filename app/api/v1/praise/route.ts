import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import {
  PraiseCreateSchema,
  createApiSuccess,
  createApiError,
  generateRequestId,
} from '../../../lib/api-contracts';
import { checkIdempotency, storeIdempotencyResponse } from '../../../lib/idempotency';
import { withRateLimit } from '../../../lib/rate-limiting';

export const runtime = 'nodejs';

// POST /api/v1/praise - Send praise
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
    const rateLimitedHandler = withRateLimit('PRAISE_SEND', async (req) => {
      // Parse and validate request body
      const body = await req.json();
      const validation = PraiseCreateSchema.safeParse(body);

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

      const { receiverId } = validation.data;

      // Prevent self-praise
      if (userId === receiverId) {
        return NextResponse.json(
          createApiError('VALIDATION_ERROR', 'Cannot praise yourself', requestId),
          { status: 400 },
        );
      }

      // Check if receiver exists
      const receiver = await db.user.findUnique({
        where: { id: receiverId },
        select: { id: true },
      });

      if (!receiver) {
        return NextResponse.json(createApiError('NOT_FOUND', 'User not found', requestId), {
          status: 404,
        });
      }

      try {
        // Create praise (will fail if duplicate due to unique constraint)
        const praise = await db.praise.create({
          data: {
            userId: userId,
            targetId: receiverId,
          },
          include: {
            User: {
              select: {
                id: true,
                display_name: true,
                avatarUrl: true,
              },
            },
          },
        });

        const response = createApiSuccess(
          {
            id: praise.id,
            senderId: praise.userId,
            receiverId: praise.targetId,
            createdAt: praise.createdAt,
            sender: {
              id: praise.User.id,
              displayName: praise.User.display_name,
              avatarUrl: praise.User.avatarUrl,
            },
          },
          requestId,
        );

        // Store idempotency response
        const idempotencyKey = req.headers.get('idempotency-key');
        if (idempotencyKey) {
          await storeIdempotencyResponse(idempotencyKey, response);
        }

        return NextResponse.json(response, { status: 201 });
      } catch (error: any) {
        // Check if it's a duplicate entry error
        if (error.code === 'P2002' && error.meta?.target?.includes('senderId')) {
          return NextResponse.json(
            createApiError(
              'DUPLICATE_ENTRY',
              'You have already praised this user today',
              requestId,
            ),
            { status: 409 },
          );
        }
        throw error;
      }
    });

    return rateLimitedHandler(req);
  } catch (error) {
    console.error('Error creating praise:', error);
    return NextResponse.json(createApiError('INTERNAL_ERROR', 'Failed to send praise', requestId), {
      status: 500,
    });
  }
}

// GET /api/v1/praise - Get praise received by user
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
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const praises = await db.praise.findMany({
      where: {
        targetId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      include: {
        User: {
          select: {
            id: true,
            display_name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const hasMore = praises.length > limit;
    const items = hasMore ? praises.slice(0, -1) : praises;
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return NextResponse.json(
      createApiSuccess(
        {
          items: items.map((praise) => ({
            id: praise.id,
            senderId: praise.userId,
            receiverId: praise.targetId,
            createdAt: praise.createdAt,
            sender: {
              id: praise.User.id,
              displayName: praise.User.display_name,
              avatarUrl: praise.User.avatarUrl,
            },
          })),
          nextCursor,
          hasMore,
        },
        requestId,
      ),
    );
  } catch (error) {
    console.error('Error fetching praises:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch praises', requestId),
      { status: 500 },
    );
  }
}
