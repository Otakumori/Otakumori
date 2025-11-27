
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
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
    const analyticsData: any = {
      query: analyticsRequest.query,
      searchType: analyticsRequest.searchType,
      resultCount: analyticsRequest.resultCount,
      userId,
    };
    if (analyticsRequest.clickedResultId !== undefined)
      analyticsData.clickedResultId = analyticsRequest.clickedResultId;
    if (analyticsRequest.clickedResultType !== undefined)
      analyticsData.clickedResultType = analyticsRequest.clickedResultType;
    if (analyticsRequest.sessionId !== undefined)
      analyticsData.sessionId = analyticsRequest.sessionId;
    await db.searchAnalytics.create({
      data: analyticsData,
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
    const whereClause: any = { query: analyticsRequest.query };
    if (analyticsRequest.clickedResultId !== undefined)
      whereClause.targetId = analyticsRequest.clickedResultId;
    if (analyticsRequest.clickedResultType)
      whereClause.suggestionType = analyticsRequest.clickedResultType;
    const suggestion = await db.searchSuggestion.findFirst({ where: whereClause });

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
      const suggestionData: any = {
        query: analyticsRequest.query,
        targetType: analyticsRequest.clickedResultType!,
        popularity: 1,
        lastUsed: new Date(),
      };
      if (analyticsRequest.clickedResultType)
        suggestionData.suggestionType = analyticsRequest.clickedResultType;
      if (analyticsRequest.clickedResultId !== undefined)
        suggestionData.targetId = analyticsRequest.clickedResultId;
      await db.searchSuggestion.create({ data: suggestionData });
    }
  } catch (error) {
    // Don't fail the analytics request if suggestion update fails
    logger.warn('Failed to update suggestion popularity', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}
