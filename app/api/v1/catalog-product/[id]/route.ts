import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { serializeProduct } from '@/lib/catalog/serialize';
import { getCatalogFallbackProduct } from '@/lib/catalog/e2eFallback';
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
  return images
    .filter((image, index, arr) => isRenderableImage(image) && arr.indexOf(image) === index)
    .slice(0, 8);
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Missing product id', requestId),
        { status: 400 },
      );
    }

    const fallbackProduct = getCatalogFallbackProduct(id);
    if (fallbackProduct) {
      return NextResponse.json(createApiSuccess(fallbackProduct, requestId), {
        headers: {
          'Cache-Control': 'no-store',
          'X-OTM-Source': 'preview-fallback',
        },
      });
    }

    if (id.startsWith('merchize:')) {
      return NextResponse.json(
        createApiError(
          'NOT_FOUND',
          'Merchize products are not public until they are imported into the local catalog.',
          requestId,
        ),
        { status: 404 },
      );
    }

    const product = await db.product.findUnique({
      where: { id },
      include: {
        ProductVariant: true,
        ProductImage: { orderBy: { position: 'asc' } },
      },
    });

    if (!product) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Product not found', requestId), {
        status: 404,
      });
    }

    if (!product.active || !product.visible) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Product not found', requestId), {
        status: 404,
      });
    }

    const serialized = serializeProduct(product);
    const images = cleanImages(serialized.images || []);
    const normalized = {
      ...serialized,
      image: isRenderableImage(serialized.image) ? serialized.image : (images[0] ?? null),
      images,
      description: serialized.description || '',
    };

    return NextResponse.json(createApiSuccess(normalized, requestId), {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'Catalog product detail API error',
      { requestId, route: '/api/v1/catalog-product/[id]' },
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch catalog product', requestId),
      { status: 500 },
    );
  }
}
