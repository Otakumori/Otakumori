/**
 * Products API - Prisma-based product listing
 *
 * Supports:
 * - Text search across name, description, tags
 * - Category filtering
 * - Price range filtering
 * - Stock availability filtering
 * - Pagination and sorting
 * - Returns products from Prisma cache
 */

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { type Prisma } from '@prisma/client';
import { db } from '@/app/lib/db';
import { serializeProduct, type CatalogProduct } from '@/lib/catalog/serialize';
import {
  generateRequestId,
  createApiError,
  createApiSuccess,
} from '@/app/lib/api-contracts';
import { logger } from '@/app/lib/logger';

export const runtime = 'nodejs';

const QueryParamsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = val ? parseInt(val, 10) : 1;
      return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = val ? parseInt(val, 10) : 20;
      return Number.isNaN(parsed) || parsed < 1 ? 20 : Math.min(parsed, 50);
    }),
  category: z.string().optional(),
  q: z.string().optional(), // search query
  minPrice: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const parsed = parseFloat(val);
      return Number.isNaN(parsed) ? undefined : Math.max(0, parsed);
    }),
  maxPrice: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const parsed = parseFloat(val);
      return Number.isNaN(parsed) ? undefined : Math.max(0, parsed);
    }),
  inStock: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'price']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

function buildProductWhere(params: z.infer<typeof QueryParamsSchema>): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    active: true,
    visible: true,
  };

  // Category filter
  if (params.category) {
    where.OR = [
      { categorySlug: params.category },
      { category: params.category },
      { tags: { has: params.category } },
    ];
  }

  // Search query
  if (params.q) {
    const query = params.q.trim();
    const searchConditions: Prisma.ProductWhereInput[] = [
      { name: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
      { tags: { hasSome: [query.toLowerCase()] } },
    ];

    if (where.OR) {
      // If category filter exists, combine with AND
      where.AND = [
        { OR: where.OR },
        { OR: searchConditions },
      ];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  // Price range filter
  const variantFilters: Prisma.ProductVariantWhereInput = {};
  if (params.minPrice != null || params.maxPrice != null) {
    const minCents = params.minPrice != null ? Math.round(params.minPrice * 100) : undefined;
    const maxCents = params.maxPrice != null ? Math.round(params.maxPrice * 100) : undefined;

    if (minCents != null || maxCents != null) {
      variantFilters.priceCents = {
        ...(minCents != null ? { gte: minCents } : {}),
        ...(maxCents != null ? { lte: maxCents } : {}),
      };
    }
  }

  // Stock filter
  if (params.inStock === true) {
    variantFilters.inStock = true;
    variantFilters.isEnabled = true;
  }

  // Apply variant filters if any
  if (Object.keys(variantFilters).length > 0) {
    where.ProductVariant = { some: variantFilters };
  }

  return where;
}

function buildOrderBy(
  params: z.infer<typeof QueryParamsSchema>,
): Prisma.ProductOrderByWithRelationInput {
  const sortOrder = params.sortOrder ?? 'desc';

  switch (params.sortBy) {
    case 'name':
      return { name: sortOrder };
    case 'createdAt':
      return { createdAt: sortOrder };
    case 'updatedAt':
      return { updatedAt: sortOrder };
    case 'price':
      // Price sorting is handled in application layer after serialization
      return { updatedAt: 'desc' };
    default:
      return { createdAt: 'desc' };
  }
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { searchParams } = new URL(request.url);
    const parsed = QueryParamsSchema.safeParse(Object.fromEntries(searchParams));

    if (!parsed.success) {
      return NextResponse.json(
        createApiError(
          'VALIDATION_ERROR',
          'Invalid query parameters',
          requestId,
          parsed.error.issues,
        ),
        { status: 400 },
      );
    }

    const params = parsed.data;
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const where = buildProductWhere(params);
    const orderBy = buildOrderBy(params);

    // Query Prisma
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          ProductVariant: true,
          ProductImage: {
            orderBy: { position: 'asc' },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
      }),
      db.product.count({ where }),
    ]);

    // Transform to CatalogProduct format
    let serialized = products.map(serializeProduct);

    // Handle price sorting in application layer
    if (params.sortBy === 'price') {
      serialized = serialized.sort((a: CatalogProduct, b: CatalogProduct) => {
        const aPrice = a.priceRange.min ?? a.priceCents ?? Number.MAX_SAFE_INTEGER;
        const bPrice = b.priceRange.min ?? b.priceCents ?? Number.MAX_SAFE_INTEGER;
        return (params.sortOrder === 'asc' ? 1 : -1) * (aPrice - bPrice);
      });
    }

    // Get the most recent lastSyncedAt from products
    const lastSyncedAt =
      products.length > 0
        ? products
          .map((p) => p.lastSyncedAt)
          .filter((date): date is Date => date !== null)
          .sort((a, b) => b.getTime() - a.getTime())[0]?.toISOString() ?? null
        : null;

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      createApiSuccess(
        {
          products: serialized,
          pagination: {
            currentPage: page,
            totalPages,
            total,
            perPage: limit,
          },
          lastSyncedAt,
        },
        requestId,
      ),
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Products API error', { requestId, route: '/api/v1/products' }, undefined, err);
    return NextResponse.json(
      createApiError(
        'INTERNAL_ERROR',
        'Failed to fetch products',
        requestId,
      ),
      { status: 500 },
    );
  }
}
