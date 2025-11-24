/**
 * Single Product API - Prisma-based product lookup
 *
 * Gets a single product by ID from Prisma cache
 * Falls back to Printify if not found in Prisma
 */

import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { serializeProduct, type CatalogProduct } from '@/lib/catalog/serialize';
import {
  generateRequestId,
  createApiError,
  createApiSuccess,
} from '@/app/lib/api-contracts';
import { getPrintifyService } from '@/app/lib/printify/service';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = generateRequestId();

  try {
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        createApiError('VALIDATION_ERROR', 'Invalid product ID', requestId),
        { status: 400 },
      );
    }

    // Try to find product in Prisma first
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
      // Product found in Prisma cache
      const serialized = serializeProduct(product);

      // Return product directly in data to match expected format
      return NextResponse.json(
        createApiSuccess(serialized, requestId),
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            'X-OTM-Source': 'prisma-cache',
            'X-OTM-Last-Synced': product.lastSyncedAt?.toISOString() ?? '',
          },
        },
      );
    }

    // Product not found in Prisma - try Printify fallback
    // Check if it's a Printify product ID
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
      // Found by Printify ID
      const serialized = serializeProduct(printifyProduct);

      // Return product directly in data to match expected format
      return NextResponse.json(
        createApiSuccess(serialized, requestId),
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            'X-OTM-Source': 'prisma-cache',
            'X-OTM-Last-Synced': printifyProduct.lastSyncedAt?.toISOString() ?? '',
          },
        },
      );
    }

    // Try fetching from Printify API as last resort
    // Note: This is a fallback - ideally products should be synced to Prisma first
    try {
      const printifyService = getPrintifyService();
      const printifyProductData = await printifyService.getProduct(printifyProductId);

      if (printifyProductData) {
        // Transform Printify product to CatalogProduct format
        const primaryImage = printifyProductData.images?.find((img) => img.is_default) 
          ?? printifyProductData.images?.[0];
        const priceRange = printifyProductData.variants?.length 
          ? {
              min: Math.min(...printifyProductData.variants.map((v) => v.price)),
              max: Math.max(...printifyProductData.variants.map((v) => v.price)),
            }
          : { min: null, max: null };

        const catalogProduct: CatalogProduct = {
          id: String(printifyProductData.id),
          title: printifyProductData.title,
          slug: `product-${printifyProductData.id}`, // Basic slug
          description: printifyProductData.description ?? '',
          image: primaryImage?.src ?? null,
          images: printifyProductData.images?.map((img) => img.src) ?? [],
          tags: printifyProductData.tags ?? [],
          category: printifyProductData.tags?.[0] ?? null,
          categorySlug: null,
          price: priceRange.min ? priceRange.min / 100 : null,
          priceCents: priceRange.min,
          priceRange: {
            min: priceRange.min,
            max: priceRange.max,
          },
          available: printifyProductData.variants?.some((v) => v.is_available && v.is_enabled) ?? false,
          visible: printifyProductData.visible ?? true,
          active: true,
          isLocked: printifyProductData.is_locked ?? false,
          variants: printifyProductData.variants?.map((v) => ({
            id: String(v.id),
            title: v.title ?? null,
            sku: v.sku ?? null,
            price: v.price ? v.price / 100 : null,
            priceCents: v.price,
            inStock: v.is_available ?? true,
            isEnabled: v.is_enabled ?? true,
            printifyVariantId: v.id,
            optionValues: [],
            previewImageUrl: null,
          })) ?? [],
          integrationRef: null,
          printifyProductId: String(printifyProductData.id),
          blueprintId: printifyProductData.blueprint_id ?? null,
          printProviderId: printifyProductData.print_provider_id ?? null,
          lastSyncedAt: null,
        };

        return NextResponse.json(
          createApiSuccess(catalogProduct, requestId),
          {
            headers: {
              'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
              'X-OTM-Source': 'printify-api',
            },
          },
        );
      }
    } catch (printifyError) {
      // Printify fetch failed, continue to 404
      console.warn('[Products API] Printify fallback failed:', printifyError);
    }

    // Product not found
    return NextResponse.json(
      createApiError('NOT_FOUND', `Product with ID ${id} not found`, requestId),
      { status: 404 },
    );
  } catch (error) {
    console.error('[Products API] Error:', error);
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
