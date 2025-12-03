
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { filterValidPrintifyProducts } from '@/app/lib/shop/printify-filters';
import { deduplicateProducts } from '@/app/lib/shop/catalog';

export async function GET(request: NextRequest) {
  try {
    // Use our new v1 Printify API route instead of the old implementation
    const response = await fetch(`${request.nextUrl.origin}/api/v1/printify/products`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      logger.error('Failed to fetch from v1 Printify API:', undefined, {
        status: response.status,
      });
      throw new Error(`Printify API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok) {
      logger.error('Printify API returned error:', data.error);
      throw new Error(data.error || 'Failed to fetch products');
    }

    // Filter out invalid/placeholder products first
    const validProducts = filterValidPrintifyProducts(data.data.products);

    // Transform products for frontend consumption
    const transformedProducts = validProducts
      .map((product: any) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price || 0,
        images: product.image ? [product.image] : product.images || [],
        variants: product.variants || [],
        category: product.tags?.[0] || 'Other',
        tags: product.tags || [],
        metadata: {
          printify_id: product.id,
          published: true,
          created_at: product.createdAt || new Date().toISOString(),
          updated_at: product.updatedAt || new Date().toISOString(),
        },
        blueprintId: product.blueprintId ?? null,
        printifyProductId: product.printifyProductId ?? String(product.id),
      }));

    // Deduplicate by blueprintId and printifyProductId
    const deduplicated = deduplicateProducts(transformedProducts, {
      deduplicateBy: 'both',
    });

    // Shop API: Transformed products from v1 Printify API

    return NextResponse.json(
      {
        products: deduplicated,
        source: 'v1-api',
        count: deduplicated.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    logger.error(
      'Shop products API error:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );

    // Return empty products with 200 status for graceful degradation
    return NextResponse.json(
      {
        products: [],
        source: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  }
}
