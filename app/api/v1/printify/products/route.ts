import { type NextRequest, NextResponse } from 'next/server';
import { getPrintifyService } from '@/app/lib/printify/service';
import { stripHtml } from '@/lib/html';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  per_page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 100)),
  sync: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

export async function GET(request: NextRequest) {
  const requestId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));

    // If sync is requested, trigger a background sync
    if (query.sync) {
      // Don't await this - let it run in background
      syncProductsInBackground().catch((error) => {
        console.error('Background sync failed:', error);
      });
    }

    let result;
    try {
      result = await getPrintifyService().getProducts(query.page, query.per_page);
    } catch (serviceError) {
      console.error('Printify service error:', serviceError);

      // Return empty result instead of 500
      return NextResponse.json(
        {
          ok: true,
          data: {
            products: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              total: 0,
              perPage: query.per_page,
            },
          },
          source: 'error-fallback',
          error: serviceError instanceof Error ? serviceError.message : 'Service unavailable',
          requestId,
        },
        { status: 200 },
      );
    }

    // Transform products to match expected format
    const products = result.data.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: stripHtml(product.description || ''),
      price: product.variants?.[0]?.price ? product.variants[0].price / 100 : 0, // Convert cents to dollars
      image: product.images?.[0]?.src || '/assets/placeholder-product.jpg',
      tags: product.tags || [],
      variants:
        product.variants?.map((v: any) => ({
          id: v.id,
          price: v.price / 100, // Convert cents to dollars
          is_enabled: v.is_enabled,
          in_stock: v.in_stock,
        })) || [],
      available: product.variants?.some((v: any) => v.is_enabled && v.in_stock) || false,
      visible: product.visible,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    // Success with cache headers
    const duration = Date.now() - startTime;
    return NextResponse.json(
      {
        ok: true,
        data: {
          products,
          pagination: {
            currentPage: query.page,
            totalPages: result.last_page,
            total: result.total,
            perPage: query.per_page,
          },
        },
        source: 'live-api',
        timestamp: new Date().toISOString(),
        requestId,
        duration,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      },
    );
  } catch (error) {
    console.error('Printify products API error:', error);

    // Check if it's a known upstream failure (Printify API issues)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
    const isUpstreamFailure =
      errorMessage.includes('fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND');

    if (isUpstreamFailure) {
      // Upstream known failure -> handled 502 (matches repo direction)
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to fetch products from Printify',
          detail: errorMessage,
          requestId,
          data: {
            products: [],
            pagination: {
              currentPage: 1,
              totalPages: 0,
              total: 0,
              perPage: 100,
            },
          },
        },
        { status: 502 },
      );
    }

    // Only truly unexpected errors fall here -> 500
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
        requestId,
        data: {
          products: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            total: 0,
            perPage: 100,
          },
        },
      },
      { status: 500 },
    );
  }
}

// Background sync function
async function syncProductsInBackground() {
  try {
    const products = await getPrintifyService().getAllProducts();
    console.warn(`Background sync completed: ${products.length} products fetched`);

    // Here you would save to your database
    // await saveProductsToDatabase(products);
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
