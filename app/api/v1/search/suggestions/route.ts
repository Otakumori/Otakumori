import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { logger } from '@/app/lib/logger';
import { SearchSuggestionRequestSchema, type SearchSuggestionRequest } from '@/app/lib/contracts';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const suggestionRequest = SearchSuggestionRequestSchema.parse(body);

    logger.info('Search suggestions request received', {
      userId,
      extra: { query: suggestionRequest.query, searchType: suggestionRequest.searchType },
    });

    const suggestions = await getSearchSuggestions(suggestionRequest);

    logger.info('Search suggestions completed', {
      userId,
      extra: {
        query: suggestionRequest.query,
        suggestionCount: suggestions.length,
      },
    });

    return NextResponse.json({ ok: true, data: { suggestions } });
  } catch (error) {
    logger.error('Search suggestions request failed', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request parameters' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Failed to get suggestions' }, { status: 500 });
  }
}

async function getSearchSuggestions(request: SearchSuggestionRequest) {
  const { query, searchType, limit } = request;

  // Get existing suggestions from database
  const existingSuggestions = await db.searchSuggestion.findMany({
    where: {
      query: { contains: query, mode: 'insensitive' },
      suggestionType: searchType === 'all' ? undefined : searchType,
    },
    orderBy: [{ popularity: 'desc' }, { lastUsed: 'desc' }],
    take: limit,
  });

  // Generate dynamic suggestions based on search type
  const dynamicSuggestions = await generateDynamicSuggestions(query, searchType, limit);

  // Combine and deduplicate suggestions
  const allSuggestions = [...existingSuggestions, ...dynamicSuggestions];
  const uniqueSuggestions = allSuggestions.filter(
    (suggestion, index, self) =>
      index ===
      self.findIndex(
        (s) => s.query === suggestion.query && s.suggestionType === suggestion.suggestionType,
      ),
  );

  // Sort by relevance and return top results
  return uniqueSuggestions
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit);
}

async function generateDynamicSuggestions(query: string, searchType: string, limit: number) {
  const suggestions: any[] = [];

  try {
    // Generate user suggestions
    if (searchType === 'people' || searchType === 'all') {
      const userSuggestions = await db.user.findMany({
        where: {
          OR: [
            { username: { contains: query, mode: 'insensitive' } },
            { display_name: { contains: query, mode: 'insensitive' } },
          ],
          visibility: { not: 'private' },
        },
        select: {
          id: true,
          username: true,
          display_name: true,
        },
        take: Math.ceil(limit / 2),
      });

      suggestions.push(
        ...userSuggestions.map((user) => ({
          query: user.display_name || user.username,
          suggestionType: 'user',
          targetId: user.id,
          targetType: 'user',
          popularity: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      );
    }

    // Generate product suggestions
    if (searchType === 'products' || searchType === 'all') {
      const productSuggestions = await db.product.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          active: true,
        },
        select: {
          id: true,
          name: true,
        },
        take: Math.ceil(limit / 2),
      });

      suggestions.push(
        ...productSuggestions.map((product) => ({
          query: product.name,
          suggestionType: 'product',
          targetId: product.id,
          targetType: 'product',
          popularity: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      );
    }

    // Generate tag suggestions
    const tagSuggestions = await db.product.findMany({
      where: {
        category: { contains: query, mode: 'insensitive' },
        active: true,
      },
      select: {
        category: true,
      },
      take: 10,
    });

    const uniqueTags = new Set<string>();
    tagSuggestions.forEach((product) => {
      if (product.category && product.category.toLowerCase().includes(query.toLowerCase())) {
        uniqueTags.add(product.category);
      }
    });

    suggestions.push(
      ...Array.from(uniqueTags)
        .slice(0, 3)
        .map((tag) => ({
          query: tag,
          suggestionType: 'tag',
          targetId: null,
          targetType: null,
          popularity: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
    );
  } catch (error) {
    logger.warn('Failed to generate dynamic suggestions', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }

  return suggestions;
}
