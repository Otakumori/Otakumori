import { type NextRequest, NextResponse } from 'next/server';
import { getPrintifyService } from '@/app/lib/printify/service';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 6)),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));

    // Get products from Printify
    const result = await getPrintifyService().getProducts(1, query.limit);

    // Transform products to normalized format
    const products = result.data
      .filter((product: any) => product.visible) // Only visible products
      .map((product: any) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.variants?.[0]?.price ? product.variants[0].price / 100 : 0, // Convert cents to dollars
        image: product.images?.[0]?.src || '/assets/placeholder-product.jpg',
        images: product.images?.map((img: any) => img.src) || [],
        tags: product.tags || [],
        variants:
          product.variants?.map((v: any) => ({
            id: v.id,
            title: v.title,
            price: v.price / 100, // Convert cents to dollars
            is_enabled: v.is_enabled,
            in_stock: v.in_stock,
          })) || [],
        available: product.variants?.some((v: any) => v.is_enabled && v.in_stock) || false,
        category: product.tags?.[0] || 'apparel',
        slug: product.id, // Using ID as slug for now
      }));

    return NextResponse.json({
      ok: true,
      data: { products },
      source: 'live-api',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Featured products API error:', error);

    // Fallback to empty state
    return NextResponse.json(
      {
        ok: true,
        data: { products: [] },
        source: 'fallback',
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  }
}
