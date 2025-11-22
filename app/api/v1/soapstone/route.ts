import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import {
  SoapstoneCreateSchema,
  createApiSuccess,
  createApiError,
  generateRequestId,
} from '../../../lib/api-contracts';
import { checkIdempotency, storeIdempotencyResponse } from '../../../lib/idempotency';
import { withRateLimit } from '../../../lib/rate-limiting';

export const runtime = 'nodejs';

// GET /api/v1/soapstone - List soapstone messages
export async function GET(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    const { Visibility } = await import('@prisma/client');

    const messages = await db.soapstoneMessage.findMany({
      where: {
        status: Visibility.PUBLIC,
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
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

    return NextResponse.json(
      createApiSuccess(
        {
          items: items.map((msg) => ({
            id: msg.id,
            body: msg.text,
            text: msg.text, // Alias for compatibility
            createdAt: msg.createdAt.toISOString(),
            x: msg.x,
            y: msg.y,
            appraises: msg.appraises || 0,
            user: msg.User
              ? {
                  id: msg.User.id,
                  displayName: msg.User.displayName,
                  avatarUrl: msg.User.avatarUrl,
                }
              : null,
          })),
          nextCursor,
          hasMore,
        },
        requestId,
      ),
    );
  } catch (error) {
    console.error('Error fetching soapstone messages:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch messages', requestId),
      { status: 500 },
    );
  }
}

// POST /api/v1/soapstone - Create soapstone message
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
    const rateLimitedHandler = withRateLimit('SOAPSTONE_PLACE', async (req) => {
      // Parse and validate request body
      const body = await req.json();
      const validation = SoapstoneCreateSchema.safeParse(body);

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

      const { body: messageBody, x, y } = validation.data;

      const { Visibility } = await import('@prisma/client');

      // Create soapstone message with optional x/y coordinates
      const message = await db.soapstoneMessage.create({
        data: {
          text: messageBody,
          authorId: userId,
          status: Visibility.PUBLIC,
          ...(x !== undefined && y !== undefined && { x: Math.round(x), y: Math.round(y) }),
        },
        include: {
          User: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      });

      const response = createApiSuccess(
        {
          id: message.id,
          body: message.text,
          text: message.text, // Alias for compatibility
          createdAt: message.createdAt.toISOString(),
          x: message.x,
          y: message.y,
          appraises: message.appraises || 0,
          user: {
            id: message.User!.id,
            displayName: message.User!.displayName,
            avatarUrl: message.User!.avatarUrl,
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
    });

    return rateLimitedHandler(req);
  } catch (error) {
    console.error('Error creating soapstone message:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to create message', requestId),
      { status: 500 },
    );
  }
}
