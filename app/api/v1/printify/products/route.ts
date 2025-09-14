import { type NextRequest, NextResponse } from 'next/server';
import { getPrintifyService } from '@/app/lib/printify/service';
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

    const result = await getPrintifyService().getProducts(query.page, query.per_page);

    // Transform products to match expected format
    const products = result.data.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
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
      available: product.variants?.some((v) => v.is_enabled && v.in_stock) || false,
      visible: product.visible,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Printify products API error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to fetch products',
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
    console.log('Starting background Printify sync...');
    const products = await getPrintifyService().getAllProducts();
    console.log(`Background sync completed: ${products.length} products fetched`);

    // Here you would save to your database
    // await saveProductsToDatabase(products);
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}
