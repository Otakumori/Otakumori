/**
 * AI-Powered Product Recommendations API
 *
 * Provides intelligent product recommendations using multiple algorithms:
 * - Collaborative filtering (user-based)
 * - Content-based filtering (product similarity)
 * - Hybrid approach (combining both)
 * - Trending products (popularity-based)
 */

import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { getAdvancedPrintifyService } from '@/app/lib/printify/advanced-service';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

export const runtime = 'nodejs';

const RecommendationParamsSchema = z.object({
  productId: z.string().optional(),
  category: z.string().optional(),
  algorithm: z.enum(['collaborative', 'content_based', 'hybrid', 'trending']).optional(),
  limit: z.coerce.number().min(1).max(20).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = RecommendationParamsSchema.parse(Object.fromEntries(searchParams));

    // Get user context for personalized recommendations
    const authResult = await auth();
    const userId = authResult.userId;

    const advancedService = getAdvancedPrintifyService();

    const recommendations = await advancedService.getRecommendations({
      userId: userId || undefined,
      productId: params.productId,
      category: params.category,
      algorithm: params.algorithm || 'content_based',
      limit: params.limit || 6,
    });

    // Track recommendation request for analytics
    if (typeof globalThis !== 'undefined' && 'gtag' in globalThis) {
      (globalThis as any).gtag('event', 'view_item_list', {
        item_list_id: 'recommendations',
        item_list_name: `Recommendations (${params.algorithm || 'content_based'})`,
        items: recommendations.slice(0, 5).map((product, index) => ({
          item_id: product.id,
          item_name: product.title,
          index: index,
          item_category: product.tags[0] || 'uncategorized',
          price: Math.min(...product.variants.map((v) => v.price)),
        })),
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        recommendations,
        algorithm: params.algorithm || 'content_based',
        context: {
          productId: params.productId,
          category: params.category,
          isPersonalized: !!userId,
        },
        metadata: {
          total: recommendations.length,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    logger.error('Printify recommendations error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid recommendation parameters',
          details: error.issues,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Recommendations failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
