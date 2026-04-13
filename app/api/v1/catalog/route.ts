import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { getMerchizeService } from '@/app/lib/merchize/service';
import { serializeProduct, type CatalogProduct } from '@/lib/catalog/serialize';
import { createProductSlug } from '@/lib/catalog/mapPrintify';
import { generateRequestId, createApiError, createApiSuccess } from '@/app/lib/api-contracts';

export const runtime = 'nodejs';

const QueryParamsSchema = z.object({
  page: z.string().optional().transform((val) => {
    const parsed = val ? parseInt(val, 10) : 1;
    return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
  }),
  limit: z.string().optional().transform((val) => {
    const parsed = val ? parseInt(val, 10) : 20;
    return Number.isNaN(parsed) || parsed < 1 ? 20 : Math.min(parsed, 50);
  }),
  category: z.string().optional(),
  q: z.string().optional(),
  minPrice: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const parsed = parseFloat(val);
    return Number.isNaN(parsed) ? undefined : Math.max(0, parsed);
  }),
  maxPrice: z.string().optional().transform((val) => {
    if (!val) return undefined;
    const parsed = parseFloat(val);
    return Number.isNaN(parsed) ? undefined : Math.max(0, parsed);
  }),
  inStock: z.enum(['true', 'false']).optional().transform((val) => val === 'true'),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'price', 'relevance', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

function toMerchizeCatalogProduct(product: Awaited<ReturnType<ReturnType<typeof getMerchizeService>['getProducts']>>[number]): CatalogProduct {
  const priceCents = product.price != null ? Math.round(product.price * 100) : null;
  const images = product.images.map((image) => image.url).filter(Boolean);
  return {
    id: `merchize:${product.id}`,
    title: product.title,
    slug: createProductSlug(product.title, `merchize-${product.id}`),
    description: product.description ?? '',
    image: images[0] ?? null,
    images,
    tags: ['merchize'],
    category: 'merchize-catalog',
    categorySlug: 'merchize-catalog',
    price: product.price,
    priceCents,
    priceRange: { min: priceCents, max: priceCents },
    available: true,
    visible: true,
    active: true,
    provider: 'merchize',
    variants: [{
      id: `merchize:${product.id}:default`,
      title: product.title,
      sku: product.sku,
      price: product.price,
      priceCents,
      inStock: true,
      isEnabled: true,
      printifyVariantId: 0,
      optionValues: [],
      previewImageUrl: images[0] ?? null,
    }],
    integrationRef: 'merchize',
    printifyProductId: null,
    blueprintId: null,
    printProviderId: null,
    lastSyncedAt: null,
  };
}

function filterProducts(products: CatalogProduct[], params: z.infer<typeof QueryParamsSchema>): CatalogProduct[] {
  return products.filter((product) => {
    if (params.category && product.categorySlug !== params.category && product.category !== params.category && !product.tags.includes(params.category)) {
      return false;
    }
    if (params.q) {
      const q = params.q.trim().toLowerCase();
      const haystack = [product.title, product.description, ...(product.tags || []), product.category || '', product.categorySlug || '', product.provider || ''].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (params.inStock && !product.available) return false;
    if (params.minPrice != null && (product.price ?? -1) < params.minPrice) return false;
    if (params.maxPrice != null && (product.price ?? Number.MAX_SAFE_INTEGER) > params.maxPrice) return false;
    return true;
  });
}

function sortProducts(products: CatalogProduct[], params: z.infer<typeof QueryParamsSchema>): CatalogProduct[] {
  const sortBy = params.sortBy ?? 'relevance';
  const sortOrder = params.sortOrder ?? 'desc';
  const direction = sortOrder === 'asc' ? 1 : -1;

  return [...products].sort((a, b) => {
    switch (sortBy) {
      case 'name':
      case 'title':
        return direction * a.title.localeCompare(b.title);
      case 'price': {
        const aPrice = a.priceCents ?? Number.MAX_SAFE_INTEGER;
        const bPrice = b.priceCents ?? Number.MAX_SAFE_INTEGER;
        return direction * (aPrice - bPrice);
      }
      default:
        return direction * a.title.localeCompare(b.title);
    }
  });
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { searchParams } = new URL(request.url);
    const parsed = QueryParamsSchema.safeParse(Object.fromEntries(searchParams));
    if (!parsed.success) {
      return NextResponse.json(createApiError('VALIDATION_ERROR', 'Invalid query parameters', requestId, parsed.error.issues), { status: 400 });
    }

    const params = parsed.data;
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    const [prismaProducts, merchizeProducts] = await Promise.all([
      db.product.findMany({
        where: { active: true, visible: true },
        include: { ProductVariant: true, ProductImage: { orderBy: { position: 'asc' } } },
        take: 200,
        orderBy: { updatedAt: 'desc' },
      }),
      getMerchizeService().getProducts({ limit: 50, page: 1 }),
    ]);

    const merged = [
      ...prismaProducts.map(serializeProduct),
      ...merchizeProducts.map(toMerchizeCatalogProduct),
    ];

    const filtered = sortProducts(filterProducts(merged, params), params);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json(createApiSuccess({
      products: paginated,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        perPage: limit,
      },
      filters: {
        availableCategories: Array.from(new Set(merged.map((product) => product.categorySlug || product.category).filter(Boolean))) as string[],
        priceRange: {
          min: merged.reduce((min, product) => product.price != null ? Math.min(min, product.price) : min, Number.POSITIVE_INFINITY),
          max: merged.reduce((max, product) => product.price != null ? Math.max(max, product.price) : max, 0),
        },
        availableColors: [],
        availableSizes: [],
      },
    }, requestId), {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error('Merged catalog API error', { requestId, route: '/api/v1/catalog' }, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(createApiError('INTERNAL_ERROR', 'Failed to fetch merged catalog', requestId), { status: 500 });
  }
}
