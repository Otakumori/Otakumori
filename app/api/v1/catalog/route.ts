import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { serializeProduct, type CatalogProduct } from '@/lib/catalog/serialize';
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

function isRenderableListingImage(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const normalized = url.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes('seller.merchize.com/login')) return false;
  if (normalized.includes('drive.google.com/drive/folders')) return false;
  if (normalized.includes('drive.google.com/drive/u/')) return false;
  if (normalized.includes('docs.google.com')) return false;
  if (normalized.includes('placeholder') || normalized.includes('seed:')) return false;
  if (normalized.startsWith('/')) return true;
  if (normalized.includes('images-api.printify.com')) return true;
  return /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(normalized);
}

function normalizeListingImages(images: string[]): string[] {
  return images.filter((image, index, arr) => isRenderableListingImage(image) && arr.indexOf(image) === index).slice(0, 2);
}

function getPriceRange(products: CatalogProduct[]): { min: number; max: number } {
  let min = 0;
  let max = 0;
  let hasPrice = false;

  for (const product of products) {
    if (typeof product.price !== 'number' || !Number.isFinite(product.price)) continue;

    if (!hasPrice) {
      min = product.price;
      max = product.price;
      hasPrice = true;
      continue;
    }

    if (product.price < min) min = product.price;
    if (product.price > max) max = product.price;
  }

  return { min: hasPrice ? min : 0, max: hasPrice ? max : 0 };
}

function getAvailableCategories(products: CatalogProduct[]): string[] {
  const categories = new Set<string>();

  for (const product of products) {
    const category = product.categorySlug || product.category;
    if (category) categories.add(category);
  }

  return Array.from(categories);
}

function toListingProduct(product: CatalogProduct): CatalogProduct {
  const images = normalizeListingImages(product.images || []);
  const primaryImage = isRenderableListingImage(product.image) ? product.image : images[0] ?? null;
  const trimmedVariants = (product.variants || [])
    .filter((variant) => variant.isEnabled && variant.inStock)
    .slice(0, 12)
    .map((variant) => ({
      id: variant.id,
      title: variant.title,
      sku: variant.sku,
      price: variant.price,
      priceCents: variant.priceCents,
      inStock: variant.inStock,
      isEnabled: variant.isEnabled,
      printifyVariantId: variant.printifyVariantId,
      optionValues: (variant.optionValues || []).slice(0, 6),
      previewImageUrl: isRenderableListingImage(variant.previewImageUrl) ? variant.previewImageUrl : null,
    }));

  return {
    ...product,
    description: (product.description || '').slice(0, 400),
    image: primaryImage,
    images: primaryImage ? [primaryImage, ...images.filter((image) => image !== primaryImage)].slice(0, 2) : images,
    available: trimmedVariants.length > 0,
    variants: trimmedVariants,
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

    const prismaProducts = await db.product.findMany({
      where: { active: true, visible: true },
      include: { ProductVariant: true, ProductImage: { orderBy: { position: 'asc' } } },
      take: 120,
      orderBy: { updatedAt: 'desc' },
    });

    const checkoutSafeProducts = prismaProducts
      .map(serializeProduct)
      .map(toListingProduct)
      .filter((product) => Boolean(product.image) && product.available && product.variants.length > 0);

    const filtered = sortProducts(filterProducts(checkoutSafeProducts, params), params);
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);
    const priceRange = getPriceRange(checkoutSafeProducts);

    return NextResponse.json(createApiSuccess({
      products: paginated,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        perPage: limit,
      },
      filters: {
        availableCategories: getAvailableCategories(checkoutSafeProducts),
        priceRange,
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
    logger.error('Catalog API error', { requestId, route: '/api/v1/catalog' }, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(createApiError('INTERNAL_ERROR', 'Failed to fetch catalog', requestId), { status: 500 });
  }
}
