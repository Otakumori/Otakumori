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

import { type NextRequest, NextResponse } from 'next/server';
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

    let result;
    try {
      result = await advancedService.searchProducts(searchOptions);
    } catch (serviceError) {
      console.error('Printify search service error:', serviceError);

      // Return empty result with error info instead of throwing
      return NextResponse.json({
        ok: true,
        data: {
          products: [],
          pagination: {
            page: 1,
            totalPages: 0,
            total: 0,
            perPage: params.limit || 20,
          },
          filters: {
            availableCategories: [],
            priceRange: { min: 0, max: 0 },
            availableColors: [],
            availableSizes: [],
          },
        },
        error:
          serviceError instanceof Error ? serviceError.message : 'Service temporarily unavailable',
      });
    }

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
          details: error.issues,
        },
        { status: 400 },
      );
    }

    // Check if it's a Printify authentication error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('401') || errorMessage.includes('Unauthenticated')) {
      console.warn('Printify authentication failed - returning empty results');
      // Return empty results instead of failing the entire page
      return NextResponse.json({
        ok: true,
        data: {
          products: [],
          pagination: {
            page: 1,
            totalPages: 0,
            total: 0,
            limit: 20,
          },
          filters: {},
          searchQuery: '',
          appliedFilters: {},
        },
      });
    }

    // For other errors, also return empty results to prevent page breaks
    console.warn('Printify search failed - returning empty results:', errorMessage);
    return NextResponse.json({
      ok: true,
      data: {
        products: [],
        pagination: {
          page: 1,
          totalPages: 0,
          total: 0,
          limit: 20,
        },
        filters: {},
        searchQuery: '',
        appliedFilters: {},
      },
    });
  }
}
