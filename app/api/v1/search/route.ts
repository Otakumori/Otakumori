// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { logger } from '@/app/lib/logger';
import {
  SearchRequestSchema,
  // SearchResponseSchema,
  type SearchRequest,
  type SearchResult,
} from '@/app/lib/contracts';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const searchRequest = SearchRequestSchema.parse(body);

    logger.info('Search request received', {
      userId,
      extra: { query: searchRequest.query, searchType: searchRequest.searchType },
    });

    const results: SearchResult[] = [];
    let totalCount = 0;

    // Search users
    if (searchRequest.searchType === 'people' || searchRequest.searchType === 'all') {
      const userResults = await searchUsers(searchRequest, userId);
      results.push(...userResults);
    }

    // Search products
    if (searchRequest.searchType === 'products' || searchRequest.searchType === 'all') {
      const productResults = await searchProducts(searchRequest);
      results.push(...productResults);
    }

    // Search content (comments, activities)
    if (searchRequest.searchType === 'content' || searchRequest.searchType === 'all') {
      const contentResults = await searchContent(searchRequest, userId);
      results.push(...contentResults);
    }

    // Sort by relevance score if available
    results.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    // Apply pagination
    const paginatedResults = results.slice(
      searchRequest.offset,
      searchRequest.offset + searchRequest.limit,
    );

    totalCount = results.length;

    // Save search to history
    await saveSearchHistory(userId, searchRequest, totalCount);

    // Get search suggestions
    const suggestions = await getSearchSuggestions(searchRequest.query, searchRequest.searchType);

    const response = {
      results: paginatedResults,
      totalCount,
      hasMore: searchRequest.offset + searchRequest.limit < totalCount,
      suggestions,
      filters: searchRequest.filters,
    };

    logger.info('Search completed', {
      userId,
      extra: {
        query: searchRequest.query,
        resultCount: totalCount,
        returnedCount: paginatedResults.length,
      },
    });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    logger.error('Search request failed', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid search parameters' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Search failed' }, { status: 500 });
  }
}

async function searchUsers(
  searchRequest: SearchRequest,
  _currentUserId: string,
): Promise<SearchResult[]> {
  const { query, filters: _filters } = searchRequest;

  // Build where clause for user search
  const whereClause: any = {
    OR: [
      { username: { contains: query, mode: 'insensitive' } },
      { displayName: { contains: query, mode: 'insensitive' } },
      { bio: { contains: query, mode: 'insensitive' } },
    ],
    // Exclude blocked users and private profiles
    AND: [
      { id: { not: _currentUserId } }, // Don't show self in search
      { visibility: { not: 'private' } },
    ],
  };

  // Apply additional filters
  if (_filters?.userId) {
    whereClause.AND.push({ id: _filters.userId });
  }

  const users = await db.user.findMany({
    where: whereClause,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      visibility: true,
    },
    take: 20, // Limit user results
  });

  return users.map((user) => ({
    id: user.id,
    type: 'user' as const,
    title: user.displayName || user.username,
    description: user.bio || `@${user.username}`,
    url: `/profile/${user.username}`,
    relevanceScore: calculateUserRelevanceScore(user, query),
    metadata: {
      username: user.username,
      avatarUrl: user.avatarUrl,
      visibility: user.visibility,
    },
  }));
}

async function searchProducts(searchRequest: SearchRequest): Promise<SearchResult[]> {
  const { query, filters: _filters } = searchRequest;

  const whereClause: any = {
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { category: { contains: query, mode: 'insensitive' } },
    ],
    active: true,
  };

  const products = await db.product.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      description: true,
      primaryImageUrl: true,
      category: true,
      ProductVariant: {
        select: {
          priceCents: true,
          currency: true,
        },
        take: 1,
      },
    },
    take: 20,
  });

  return products.map((product) => ({
    id: product.id,
    type: 'product' as const,
    title: product.name,
    description: product.description || undefined,
    url: `/shop/product/${product.id}`,
    relevanceScore: calculateProductRelevanceScore(product, query),
    metadata: {
      price: product.ProductVariant[0]?.priceCents,
      currency: product.ProductVariant[0]?.currency,
      imageUrl: product.primaryImageUrl,
      category: product.category,
    },
  }));
}

async function searchContent(
  searchRequest: SearchRequest,
  currentUserId: string,
): Promise<SearchResult[]> {
  const { query, filters } = searchRequest;
  const results: SearchResult[] = [];

  // Log search for analytics
  console.warn('Search query:', { query, userId: currentUserId, filters: filters || {} });

  // Search comments
  const comments = await db.comment.findMany({
    where: {
      content: { contains: query, mode: 'insensitive' },
      User: {
        visibility: { not: 'PRIVATE' },
      },
    },
    select: {
      id: true,
      content: true,
      contentType: true,
      contentId: true,
      createdAt: true,
      User: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    take: 10,
  });

  results.push(
    ...comments.map((comment) => ({
      id: comment.id,
      type: 'comment' as const,
      title: `Comment by ${comment.User.displayName || comment.User.username}`,
      description: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : ''),
      url: getCommentUrl(comment),
      relevanceScore: calculateContentRelevanceScore(comment.content, query),
      metadata: {
        author: comment.User,
        contentType: comment.contentType,
        contentId: comment.contentId,
        createdAt: comment.createdAt.toISOString(),
      },
    })),
  );

  // Search activities
  const activities = await db.activity.findMany({
    where: {
      OR: [
        { type: { contains: query, mode: 'insensitive' } },
        { payload: { path: ['description'], string_contains: query } },
      ],
      User: {
        visibility: { not: 'PRIVATE' },
      },
    },
    select: {
      id: true,
      type: true,
      payload: true,
      createdAt: true,
      User: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    take: 10,
  });

  results.push(
    ...activities.map((activity) => ({
      id: activity.id,
      type: 'activity' as const,
      title: `${activity.User.displayName || activity.User.username} - ${activity.type}`,
      description: (activity.payload as any)?.description || activity.type,
      url: `/profile/${activity.User.username}`,
      relevanceScore: calculateContentRelevanceScore(activity.type, query),
      metadata: {
        user: activity.User,
        activityType: activity.type,
        createdAt: activity.createdAt.toISOString(),
      },
    })),
  );

  return results;
}

function calculateUserRelevanceScore(user: any, query: string): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  // Exact username match gets highest score
  if (user.username.toLowerCase() === lowerQuery) {
    score += 100;
  } else if (user.username.toLowerCase().startsWith(lowerQuery)) {
    score += 80;
  } else if (user.username.toLowerCase().includes(lowerQuery)) {
    score += 60;
  }

  // Display name matches
  if (user.displayName) {
    if (user.displayName.toLowerCase().includes(lowerQuery)) {
      score += 40;
    }
  }

  // Bio matches
  if (user.bio && user.bio.toLowerCase().includes(lowerQuery)) {
    score += 20;
  }

  return score;
}

function calculateProductRelevanceScore(product: any, query: string): number {
  let score = 0;
  const lowerQuery = query.toLowerCase();

  // Name matches get highest score
  if (product.name.toLowerCase().includes(lowerQuery)) {
    score += 80;
  }

  // Description matches
  if (product.description && product.description.toLowerCase().includes(lowerQuery)) {
    score += 40;
  }

  // Category matches
  if (product.category && product.category.toLowerCase().includes(lowerQuery)) {
    score += 60;
  }

  return score;
}

function calculateContentRelevanceScore(content: string, query: string): number {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerContent.includes(lowerQuery)) {
    return 50;
  }

  return 0;
}

function getCommentUrl(comment: any): string {
  switch (comment.contentType) {
    case 'profile':
      return `/profile/${comment.contentId}`;
    case 'achievement':
      return `/mini-games/achievements`;
    case 'leaderboard':
      return `/mini-games/leaderboard`;
    case 'activity':
      return `/profile/${comment.contentId}`;
    default:
      return '/';
  }
}

async function saveSearchHistory(
  userId: string,
  searchRequest: SearchRequest,
  resultCount: number,
) {
  try {
    await db.searchHistory.create({
      data: {
        userId,
        query: searchRequest.query,
        searchType: searchRequest.searchType,
        filters: searchRequest.filters || {},
        resultCount,
      },
    });
  } catch (error) {
    // Don't fail the search if history saving fails
    logger.warn('Failed to save search history', {
      userId,
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
  }
}

async function getSearchSuggestions(query: string, searchType: string) {
  try {
    const whereClause: any = { query: { contains: query, mode: 'insensitive' } };
    if (searchType !== 'all') whereClause.suggestionType = searchType;
    const suggestions = await db.searchSuggestion.findMany({
      where: whereClause,
      orderBy: [{ popularity: 'desc' }, { lastUsed: 'desc' }],
      take: 5,
    });

    return suggestions;
  } catch (error) {
    logger.warn('Failed to get search suggestions', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return [];
  }
}
