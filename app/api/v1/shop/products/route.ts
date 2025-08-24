export const dynamic = 'force-dynamic'; // tells Next this cannot be statically analyzed
export const runtime = 'nodejs'; // keep on Node runtime (not edge)
export const preferredRegion = 'iad1'; // optional: co-locate w/ your logs region
export const maxDuration = 10; // optional guard

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/env.mjs';
import { redis } from '@/lib/redis';

const ProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  price: z.number(),
  images: z.array(z.string()),
  variants: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      price: z.number(),
      is_enabled: z.boolean(),
      is_default: z.boolean(),
      sku: z.string(),
    })
  ),
  category: z.string().optional(),
  tags: z.array(z.string()),
  metadata: z.object({
    printify_id: z.string().nullable(),
    published: z.boolean(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
});

const ProductsResponseSchema = z.object({
  ok: z.boolean(),
  data: z
    .object({
      products: z.array(ProductSchema),
      total: z.number(),
      cached: z.boolean(),
    })
    .optional(),
  error: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check Redis cache first (temporarily disabled due to cache corruption)
    // const cacheKey = `shop:products:${category || 'all'}:${limit}:${offset}`;
    // const cachedData = await redis.get(cacheKey);

    // if (cachedData) {
    //   const parsed = JSON.parse(cachedData as string);
    //   return NextResponse.json({
    //     ok: true,
    //     data: {
    //       ...parsed,
    //       cached: true
    //     }
    //   });
    // }

    // Check if Printify credentials are configured
    if (!env.PRINTIFY_API_KEY || !env.PRINTIFY_SHOP_ID) {
      console.warn('Printify credentials not configured, returning mock data');

      // Return mock data when Printify is not configured
      const mockProducts = [
        {
          id: '1',
          title: 'Anime T-Shirt',
          description: 'High-quality anime-themed t-shirt made from 100% cotton.',
          price: 29.99,
          images: ['/images/products/placeholder.svg'],
          variants: [
            {
              id: '1',
              title: 'Default',
              price: 29.99,
              is_enabled: true,
              is_default: true,
              sku: 'ANIME-TS-001',
            },
          ],
          category: 'Apparel',
          tags: ['anime', 't-shirt', 'cotton'],
          metadata: {
            printify_id: null,
            published: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
        {
          id: '2',
          title: 'Manga Keychain',
          description: 'Cute manga character keychain, perfect for your keys or bag.',
          price: 9.99,
          images: ['/images/products/placeholder.svg'],
          variants: [
            {
              id: '2',
              title: 'Default',
              price: 9.99,
              is_enabled: true,
              is_default: true,
              sku: 'MANGA-KC-001',
            },
          ],
          category: 'Accessories',
          tags: ['manga', 'keychain', 'cute'],
          metadata: {
            printify_id: null,
            published: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        },
      ];

      const response = {
        ok: true,
        data: {
          products: mockProducts,
          total: mockProducts.length,
          cached: false,
        },
      };

      // Cache mock data for 5 minutes (temporarily disabled due to cache corruption)
      // await redis.setex(cacheKey, 300, JSON.stringify(response.data));

      return NextResponse.json(response);
    }

    // Fetch products from Printify
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const printifyResponse = await fetch(
      `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);

    if (!printifyResponse.ok) {
      throw new Error(
        `Printify API error: ${printifyResponse.status} ${printifyResponse.statusText}`
      );
    }

    const printifyData = await printifyResponse.json();

    // Transform Printify products to match our schema
    const products = printifyData.data.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.variants[0]?.price / 100 || 0, // Convert cents to dollars
      images: product.images.map((img: any) => img.src),
      variants: product.variants.map((variant: any) => ({
        id: variant.id.toString(),
        title: variant.title,
        price: variant.price / 100,
        is_enabled: variant.is_enabled,
        is_default: variant.is_default,
        sku: variant.sku,
      })),
      category:
        product.tags.find((tag: string) =>
          ['apparel', 'accessories', 'home-decor'].includes(tag)
        ) || 'other',
      tags: product.tags,
      metadata: {
        printify_id: product.id,
        published: product.published,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    }));

    // Filter by category if specified
    const filteredProducts = category
      ? products.filter((p: any) => p.category === category)
      : products;

    // Apply pagination
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    const response = {
      ok: true,
      data: {
        products: paginatedProducts,
        total: filteredProducts.length,
        cached: false,
      },
    };

    // Cache for 15 minutes (temporarily disabled due to cache corruption)
    // await redis.setex(cacheKey, 900, JSON.stringify(response.data));

    return NextResponse.json(response);
  } catch (error) {
    const isAbort = (error as any)?.name === 'AbortError';
    console.error('Error fetching products:', error);
    // Fallback to mock if timeout/abort
    if (isAbort) {
      const fallback = {
        ok: true,
        data: {
          products: [],
          total: 0,
          cached: false,
        },
      } as const;
      return NextResponse.json(fallback, { status: 200 });
    }
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
