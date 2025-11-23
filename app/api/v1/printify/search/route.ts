/**
 * Catalog Product Search API
 *
 * Supports:
 * - Text search across title, description, tags
 * - Category and price range filtering
 * - Stock availability filtering
 * - Pagination and sorting
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { type Prisma } from '@prisma/client';
import { db } from '@/app/lib/db';
import { serializeProduct, type CatalogProduct } from '@/lib/catalog/serialize';
import { deduplicateProducts } from '@/app/lib/shop/catalog';

export const runtime = 'nodejs';

const SearchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  colors: z.string().optional(), // comma-separated (future use)
  sizes: z.string().optional(), // comma-separated (future use)
  inStock: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['title', 'price', 'created_at', 'relevance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
});

function buildProductWhere(params: z.infer<typeof SearchParamsSchema>): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    active: true,
    visible: true,
    // Exclude placeholder products
    primaryImageUrl: {
      not: null,
    },
    // Exclude products with placeholder in image URL or test/draft titles
    NOT: [
      {
        primaryImageUrl: {
          contains: 'placeholder',
          mode: 'insensitive',
        },
      },
      {
        primaryImageUrl: {
          contains: 'seed:',
          mode: 'insensitive',
        },
      },
      {
        integrationRef: {
          startsWith: 'seed:',
        },
      },
      {
        name: {
          contains: '[test]',
          mode: 'insensitive',
        },
      },
      {
        name: {
          contains: '[draft]',
          mode: 'insensitive',
        },
      },
      {
        name: {
          contains: '[placeholder]',
          mode: 'insensitive',
        },
      },
    ],
  };

  if (params.category) {
    where.OR = [
      { categorySlug: params.category },
      { category: params.category },
      { tags: { has: params.category } },
    ];
  }

  if (params.q) {
    const query = params.q.trim();
    const existingAnd = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];
    where.AND = [
      ...existingAnd,
      {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { hasSome: [query.toLowerCase()] } },
        ],
      },
    ];
  }

  const variantFilters: Prisma.ProductVariantWhereInput = {};

  if (params.minPrice != null || params.maxPrice != null) {
    const minCents =
      params.minPrice != null ? Math.max(0, Math.round(params.minPrice * 100)) : undefined;
    const maxCents =
      params.maxPrice != null ? Math.max(0, Math.round(params.maxPrice * 100)) : undefined;

    if (minCents != null || maxCents != null) {
      variantFilters.priceCents = {
        ...(minCents != null ? { gte: minCents } : {}),
        ...(maxCents != null ? { lte: maxCents } : {}),
      };
    }
  }

  if (params.inStock === 'true') {
    variantFilters.inStock = true;
    variantFilters.isEnabled = true;
  }

  if (Object.keys(variantFilters).length > 0) {
    where.ProductVariant = { some: variantFilters };
  }

  return where;
}

function buildOrderBy(
  params: z.infer<typeof SearchParamsSchema>,
): Prisma.ProductOrderByWithRelationInput {
  const sortOrder = params.sortOrder ?? 'desc';

  switch (params.sortBy) {
    case 'title':
      return { name: sortOrder };
    case 'created_at':
      return { createdAt: sortOrder };
    default:
      return { updatedAt: 'desc' };
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const parsed = SearchParamsSchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Invalid search parameters',
        details: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const params = parsed.data;

  try {
    const limit = params.limit ?? 20;
    const page = params.page ?? 1;

    const where = buildProductWhere(params);
    const orderBy = buildOrderBy(params);

    // Get ALL products first (or a large batch), then filter and paginate
    // This ensures accurate counts after filtering/deduplication
    const [allProducts, priceAggregate, categories] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          ProductVariant: true,
          ProductImage: true,
        },
        orderBy,
        // Get more products to account for filtering/deduplication
        take: 500, // Reasonable limit for filtering
      }),
      db.productVariant.aggregate({
        _min: { priceCents: true },
        _max: { priceCents: true },
        where: {
          Product: {
            active: true,
            visible: true,
          },
        },
      }),
      db.product.findMany({
        where: {
          active: true,
          visible: true,
        },
        select: {
          categorySlug: true,
        },
        distinct: ['categorySlug'],
      }),
    ]);

    let serialized = allProducts.map(serializeProduct);

    // Filter out invalid/placeholder products - check image and integrationRef
    // Only filter obvious placeholders, not products that might have "test" or "draft" in their actual name
    serialized = serialized.filter((product: CatalogProduct) => {
      const imageUrl = product.image ?? product.images?.[0];
      if (!imageUrl || imageUrl.trim() === '') return false;
      if (typeof imageUrl === 'string' && (imageUrl.includes('placeholder') || imageUrl.includes('seed:'))) return false;
      if (product.integrationRef?.startsWith('seed:')) return false;
      // Only filter if title explicitly starts with [test] or [draft] - not if it contains the word
      const lowerTitle = product.title?.toLowerCase() || '';
      if (lowerTitle.startsWith('[test]') || lowerTitle.startsWith('[draft]') || lowerTitle.startsWith('[placeholder]')) {
        return false;
      }
      return true;
    });

    // Deduplicate by blueprintId and printifyProductId to prevent duplicate product cards
    // This handles cases where products were synced multiple times with different IDs
    serialized = deduplicateProducts(serialized, {
      deduplicateBy: 'both', // Deduplicates by blueprintId, printifyProductId, and id
    });

    if (params.sortBy === 'price') {
      serialized = serialized.sort((a: CatalogProduct, b: CatalogProduct) => {
        const aPrice = a.priceRange.min ?? a.priceCents ?? Number.MAX_SAFE_INTEGER;
        const bPrice = b.priceRange.min ?? b.priceCents ?? Number.MAX_SAFE_INTEGER;
        return (params.sortOrder === 'asc' ? 1 : -1) * (aPrice - bPrice);
      });
    }

    // Now paginate from the filtered/deduplicated results
    const total = serialized.length;
    const skip = (page - 1) * limit;
    const paginatedProducts = serialized.slice(skip, skip + limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      ok: true,
      data: {
        products: paginatedProducts,
        pagination: {
          page,
          totalPages,
          total, // Total after filtering and deduplication
          limit,
        },
        filters: {
          availableCategories: categories
            .map((entry) => entry.categorySlug)
            .filter((value): value is string => Boolean(value)),
          priceRange: {
            min: priceAggregate._min.priceCents ?? 0,
            max: priceAggregate._max.priceCents ?? 0,
          },
          availableColors: [],
          availableSizes: [],
        },
        searchQuery: params.q || '',
        appliedFilters: {
          ...params,
        },
      },
    });
  } catch (error) {
    console.error('Catalog search error:', error);

    return NextResponse.json({
      ok: true,
      data: {
        products: [],
        pagination: {
          page: 1,
          totalPages: 0,
          total: 0,
          limit: params.limit ?? 20,
        },
        filters: {
          availableCategories: [],
          priceRange: { min: 0, max: 0 },
          availableColors: [],
          availableSizes: [],
        },
        searchQuery: params.q || '',
        appliedFilters: params,
      },
    });
  }
}
