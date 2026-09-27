/**
 * Single Product API - Prisma-based product lookup
 *
 * Gets a single public, buy-ready product from the same catalogue authority
 * used by the storefront. Provider API fallback is intentionally prohibited:
 * a direct PDP URL must not reveal a product that the storefront cannot sell.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { serializeProduct } from '@/lib/catalog/serialize';
import { generateRequestId, createApiError, createApiSuccess } from '@/app/lib/api-contracts';
import { getCatalogFallbackProduct } from '@/lib/catalog/e2eFallback';
import { toPublicCatalogProduct } from '@/lib/catalog/publicProduct';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const requestId = generateRequestId();

  try {
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Invalid product ID', requestId),
        { status: 400 },
      );
    }

    const fallbackProduct = getCatalogFallbackProduct(id);
    if (fallbackProduct) {
      const publicFallback = toPublicCatalogProduct(fallbackProduct, { allowTestFallback: true });
      if (!publicFallback) {
        return NextResponse.json(createApiError('NOT_FOUND', 'Product not found', requestId), {
          status: 404,
        });
      }
      return NextResponse.json(createApiSuccess(publicFallback, requestId), {
        headers: {
          'Cache-Control': 'no-store',
          'X-OTM-Source': 'ci-fallback',
        },
      });
    }

    // Try to find product in Prisma first. Hidden/archived local catalog state
    // must win over provider fallback so admins can safely remove items from shop.
    const product = await db.product.findUnique({
      where: { id },
      include: {
        ProductVariant: true,
        ProductImage: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (product) {
      const publicProduct = toPublicCatalogProduct(serializeProduct(product));
      if (!publicProduct) {
        return NextResponse.json(
          createApiError('NOT_FOUND', `Product with ID ${id} not found`, requestId),
          { status: 404 },
        );
      }

      return NextResponse.json(createApiSuccess(publicProduct, requestId), {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-OTM-Source': 'prisma-cache',
          'X-OTM-Last-Synced': product.lastSyncedAt?.toISOString() ?? '',
        },
      });
    }

    // Preserve local compatibility lookups by Printify product ID without a provider fallback.
    const printifyProductId = id;
    const printifyProduct = await db.product.findFirst({
      where: {
        printifyProductId: printifyProductId,
      },
      include: {
        ProductVariant: true,
        ProductImage: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (printifyProduct) {
      const publicProduct = toPublicCatalogProduct(serializeProduct(printifyProduct));
      if (!publicProduct) {
        return NextResponse.json(
          createApiError('NOT_FOUND', `Product with ID ${id} not found`, requestId),
          { status: 404 },
        );
      }

      return NextResponse.json(createApiSuccess(publicProduct, requestId), {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'X-OTM-Source': 'prisma-cache',
          'X-OTM-Last-Synced': printifyProduct.lastSyncedAt?.toISOString() ?? '',
        },
      });
    }

    // Product not found
    return NextResponse.json(
      createApiError('NOT_FOUND', `Product with ID ${id} not found`, requestId),
      { status: 404 },
    );
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      '[Products API] Error:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      createApiError(
        'INTERNAL_ERROR',
        'Failed to fetch product',
        requestId,
        error instanceof Error ? error.message : String(error),
      ),
      { status: 500 },
    );
  }
}
