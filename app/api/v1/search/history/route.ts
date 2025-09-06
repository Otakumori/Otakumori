// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { logger } from '@/app/lib/logger';
import { SearchHistoryRequestSchema } from '@/app/lib/contracts';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const historyRequest = SearchHistoryRequestSchema.parse({
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    });

    logger.info('Search history request received', {
      userId,
      extra: { limit: historyRequest.limit, offset: historyRequest.offset },
    });

    const [history, totalCount] = await Promise.all([
      db.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: historyRequest.limit,
        skip: historyRequest.offset,
      }),
      db.searchHistory.count({
        where: { userId },
      }),
    ]);

    const response = {
      history: history.map((h) => ({
        ...h,
        createdAt: h.createdAt.toISOString(),
        updatedAt: h.updatedAt.toISOString(),
      })),
      totalCount,
      hasMore: historyRequest.offset + historyRequest.limit < totalCount,
    };

    logger.info('Search history completed', {
      userId,
      extra: {
        historyCount: history.length,
        totalCount,
      },
    });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    logger.error('Search history request failed', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request parameters' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Failed to get search history' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get('id');

    if (historyId) {
      // Delete specific search history item
      await db.searchHistory.deleteMany({
        where: {
          id: historyId,
          userId,
        },
      });

      logger.info('Search history item deleted', {
        userId,
        extra: { historyId },
      });
    } else {
      // Clear all search history
      await db.searchHistory.deleteMany({
        where: { userId },
      });

      logger.info('All search history cleared', {
        userId,
      });
    }

    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (error) {
    logger.error('Search history deletion failed', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return NextResponse.json(
      { ok: false, error: 'Failed to delete search history' },
      { status: 500 },
    );
  }
}
