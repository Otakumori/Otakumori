import { NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/env';

export const runtime = 'nodejs';

const ProductSchema = z.object({
  id: z.union([z.string(), z.number()]),
  title: z.string(),
  description: z.union([z.string(), z.object({}).passthrough()]).optional(),
  images: z.array(z.union([z.string(), z.object({}).passthrough()])).optional(),
  variants: z.array(z.object({
    id: z.number(),
    price: z.union([z.number(), z.string()]),
    is_enabled: z.boolean(),
  })).optional(),
}).passthrough(); // Allow additional properties

const PrintifyResponseSchema = z.object({
  current_page: z.number().optional(),
  data: z.array(ProductSchema).optional(),
  first_page_url: z.string().optional(),
  from: z.number().nullable().optional(),
  last_page: z.number().optional(),
  last_page_url: z.string().optional(),
  next_page_url: z.string().nullable().optional(),
  path: z.string().optional(),
  per_page: z.number().optional(),
  prev_page_url: z.string().nullable().optional(),
  to: z.number().nullable().optional(),
  total: z.number().optional(),
}).passthrough(); // Allow additional properties

export async function GET() {
  try {
    // Validate environment variables
    if (!env.PRINTIFY_API_KEY || !env.PRINTIFY_SHOP_ID) {
      return NextResponse.json(
        { ok: false, error: 'Printify configuration missing' },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(
      `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`,
      {
        headers: {
          'Authorization': `Bearer ${env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const validatedData = PrintifyResponseSchema.parse(data);

    // Transform to UI-friendly format
    const products = (validatedData.data || []).map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      image: product.images?.[0] || '/assets/placeholder-product.jpg',
      price: product.variants?.[0]?.price || 0,
      available: product.variants?.some(v => v.is_enabled) || false,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        products,
        pagination: {
          currentPage: validatedData.current_page || 1,
          totalPages: validatedData.last_page || 1,
          total: validatedData.total || 0,
        },
      },
    });

  } catch (error) {
    console.error('Printify products fetch failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid product data format' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}