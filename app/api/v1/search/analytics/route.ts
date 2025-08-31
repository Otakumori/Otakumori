import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { logger } from '@/app/lib/logger';
import { SearchAnalyticsRequestSchema, type SearchAnalyticsRequest } from '@/app/lib/contracts';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const analyticsRequest = SearchAnalyticsRequestSchema.parse(body);

    logger.info('Search analytics request received', {
      userId,
      extra: {
        query: analyticsRequest.query,
        searchType: analyticsRequest.searchType,
        resultCount: analyticsRequest.resultCount,
      },
    });

    // Save search analytics
    await db.searchAnalytics.create({
      data: {
        query: analyticsRequest.query,
        searchType: analyticsRequest.searchType,
        resultCount: analyticsRequest.resultCount,
        clickedResultId: analyticsRequest.clickedResultId,
        clickedResultType: analyticsRequest.clickedResultType,
        sessionId: analyticsRequest.sessionId,
        userId,
      },
    });

    // Update search suggestion popularity if it's a click
    if (analyticsRequest.clickedResultId && analyticsRequest.clickedResultType) {
      await updateSuggestionPopularity(analyticsRequest);
    }

    logger.info('Search analytics saved', {
      userId,
      extra: {
        query: analyticsRequest.query,
        hasClick: !!analyticsRequest.clickedResultId,
      },
    });

    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (error) {
    logger.error('Search analytics request failed', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid analytics data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Failed to save analytics' }, { status: 500 });
  }
}

async function updateSuggestionPopularity(analyticsRequest: SearchAnalyticsRequest) {
  try {
    // Find matching search suggestion
    const suggestion = await db.searchSuggestion.findFirst({
      where: {
        query: analyticsRequest.query,
        targetId: analyticsRequest.clickedResultId,
        suggestionType: analyticsRequest.clickedResultType!,
      },
    });

    if (suggestion) {
      // Update popularity and last used
      await db.searchSuggestion.update({
        where: { id: suggestion.id },
        data: {
          popularity: { increment: 1 },
          lastUsed: new Date(),
        },
      });
    } else {
      // Create new suggestion if it doesn't exist
      await db.searchSuggestion.create({
        data: {
          query: analyticsRequest.query,
          suggestionType: analyticsRequest.clickedResultType!,
          targetId: analyticsRequest.clickedResultId,
          targetType: analyticsRequest.clickedResultType!,
          popularity: 1,
          lastUsed: new Date(),
        },
      });
    }
  } catch (error) {
    // Don't fail the analytics request if suggestion update fails
    logger.warn('Failed to update suggestion popularity', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}
