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
import { serializeProduct } from '@/lib/catalog/serialize';

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
    const existingAnd = Array.isArray(where.AND)
      ? where.AND
      : where.AND
        ? [where.AND]
        : [];
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

function buildOrderBy(params: z.infer<typeof SearchParamsSchema>): Prisma.ProductOrderByWithRelationInput {
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
    const skip = (page - 1) * limit;

    const where = buildProductWhere(params);
    const orderBy = buildOrderBy(params);

    const [total, products, priceAggregate, categories] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        include: {
          ProductVariant: true,
          ProductImage: true,
        },
        skip,
        take: limit,
        orderBy,
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

    const totalPages = Math.max(1, Math.ceil(total / limit));
    let serialized = products.map(serializeProduct);

    if (params.sortBy === 'price') {
      serialized = serialized.sort((a, b) => {
        const aPrice = a.priceRange.min ?? a.priceCents ?? Number.MAX_SAFE_INTEGER;
        const bPrice = b.priceRange.min ?? b.priceCents ?? Number.MAX_SAFE_INTEGER;
        return (params.sortOrder === 'asc' ? 1 : -1) * (aPrice - bPrice);
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        products: serialized,
        pagination: {
          page,
          totalPages,
          total,
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
