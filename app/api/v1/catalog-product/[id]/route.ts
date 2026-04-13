import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { getMerchizeService } from '@/app/lib/merchize/service';
import { serializeProduct } from '@/lib/catalog/serialize';
import { generateRequestId, createApiError, createApiSuccess } from '@/app/lib/api-contracts';

export const runtime = 'nodejs';

function isRenderableImage(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const normalized = url.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes('seller.merchize.com/login')) return false;
  if (normalized.includes('drive.google.com/drive/folders')) return false;
  if (normalized.includes('docs.google.com')) return false;
  if (normalized.includes('placeholder') || normalized.includes('seed:')) return false;
  if (normalized.startsWith('/')) return true;
  if (normalized.includes('images-api.printify.com')) return true;
  return /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(normalized);
}

function cleanImages(images: string[]) {
  return images.filter((image, index, arr) => isRenderableImage(image) && arr.indexOf(image) === index).slice(0, 8);
}

function toMerchizeDetailProduct(product: Awaited<ReturnType<ReturnType<typeof getMerchizeService>['getProducts']>>[number]) {
  const images = cleanImages(product.images.map((image) => image.url).filter(Boolean));
  const priceCents = product.price != null ? Math.round(product.price * 100) : null;
  return {
    id: `merchize:${product.id}`,
    title: product.title,
    slug: product.handle ?? `merchize-${product.id}`,
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
    provider: 'merchize' as const,
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

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(createApiError('VALIDATION_ERROR', 'Missing product id', requestId), { status: 400 });
    }

    if (id.startsWith('merchize:')) {
      const merchizeId = id.replace(/^merchize:/, '');
      const merchizeProducts = await getMerchizeService().getProducts({ limit: 50, page: 1 });
      const found = merchizeProducts.find((product) => product.id === merchizeId);
      if (!found) {
        return NextResponse.json(createApiError('NOT_FOUND', 'Product not found', requestId), { status: 404 });
      }
      return NextResponse.json(createApiSuccess(toMerchizeDetailProduct(found), requestId), {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      });
    }

    const product = await db.product.findUnique({
      where: { id },
      include: {
        ProductVariant: true,
        ProductImage: { orderBy: { position: 'asc' } },
      },
    });

    if (!product) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Product not found', requestId), { status: 404 });
    }

    const serialized = serializeProduct(product);
    const images = cleanImages(serialized.images || []);
    const normalized = {
      ...serialized,
      image: isRenderableImage(serialized.image) ? serialized.image : images[0] ?? null,
      images,
      description: serialized.description || '',
    };

    return NextResponse.json(createApiSuccess(normalized, requestId), {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error('Catalog product detail API error', { requestId, route: '/api/v1/catalog-product/[id]' }, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(createApiError('INTERNAL_ERROR', 'Failed to fetch catalog product', requestId), { status: 500 });
  }
}
