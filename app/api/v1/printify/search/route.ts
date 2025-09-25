/**
 * Advanced Printify Product Search API
 *
 * Supports:
 * - Text search across title, description, tags
 * - Advanced filtering (price, category, stock, features)
 * - Multiple sorting options
 * - Pagination with metadata
 * - Real-time filter suggestions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdvancedPrintifyService } from '@/app/lib/printify/advanced-service';
import { z } from 'zod';

export const runtime = 'nodejs';

const SearchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  colors: z.string().optional(), // comma-separated
  sizes: z.string().optional(), // comma-separated
  inStock: z.enum(['true', 'false']).optional(),
  expressEligible: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['title', 'price', 'created_at', 'popularity', 'relevance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = SearchParamsSchema.parse(Object.fromEntries(searchParams));

    const advancedService = getAdvancedPrintifyService();

    // Parse array parameters
    const colors = params.colors ? params.colors.split(',').filter(Boolean) : undefined;
    const sizes = params.sizes ? params.sizes.split(',').filter(Boolean) : undefined;
    const tags = params.category ? [params.category] : undefined;

    const searchOptions = {
      query: params.q,
      filters: {
        priceRange: {
          min: params.minPrice,
          max: params.maxPrice,
        },
        colors,
        sizes,
        tags,
        inStock: params.inStock === 'true' ? true : undefined,
        expressEligible: params.expressEligible === 'true' ? true : undefined,
      },
      sortBy: params.sortBy || 'relevance',
      sortOrder: params.sortOrder || 'desc',
      page: params.page || 1,
      limit: params.limit || 20,
    };

    const result = await advancedService.searchProducts(searchOptions);

    // Track search event for analytics
    if (typeof globalThis !== 'undefined' && 'gtag' in globalThis) {
      (globalThis as any).gtag('event', 'search', {
        search_term: params.q || '',
        search_category: params.category || 'all',
        results_count: result.total,
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        products: result.products,
        pagination: {
          page: result.page,
          totalPages: result.totalPages,
          total: result.total,
          limit: searchOptions.limit,
        },
        filters: result.filters,
        searchQuery: params.q || '',
        appliedFilters: searchOptions.filters,
      },
    });
  } catch (error) {
    console.error('Printify search error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid search parameters',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
