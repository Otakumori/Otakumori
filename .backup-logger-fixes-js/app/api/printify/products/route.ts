import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';
export const revalidate = 60;

// Type definitions for Printify API response
interface PrintifyVariant {
  id: number;
  price: number;
  is_enabled: boolean;
  is_available: boolean;
}

interface PrintifyProduct {
  id: string;
  title: string;
  description?: string;
  tags?: string[];
  variants?: PrintifyVariant[];
  images?: Array<{ src: string }>;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

interface PrintifyApiResponse {
  data: PrintifyProduct[];
  total?: number;
  last_page?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1') || 1;
  const perPage = Number(searchParams.get('per_page') || '100') || 100;

  try {
    // Server-only fetch with proper Printify API configuration
    const res = await fetch(
      `${env.PRINTIFY_API_URL}shops/${env.PRINTIFY_SHOP_ID}/products.json?page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Otaku-mori/1.0.0 (Node.js)',
        },
        cache: 'no-store',
      },
    );

    // Enhanced error handling for Printify API responses
    if (!res.ok) {
      const errorText = await res.text();
      logger.error(`Printify API error: ${res.status} - ${errorText}`);

      // Don't expose sensitive details but log them for debugging
      return NextResponse.json(
        {
          ok: false,
          error: `Printify API error (${res.status}): ${res.status === 401 ? 'Authentication failed' : 'Request failed'}`,
        },
        { status: res.status === 401 ? 502 : res.status },
      );
    }

    const result: PrintifyApiResponse = await res.json();

    // Normalize response to match UI's expected fields: id, title, image, price, available
    const products = (result.data || []).map((product: PrintifyProduct) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.variants?.[0]?.price ? product.variants[0].price / 100 : 0,
      image: product.images?.[0]?.src || '/assets/images/placeholder-product.jpg',
      tags: product.tags || [],
      variants:
        product.variants?.map((v: PrintifyVariant) => ({
          id: v.id,
          price: v.price / 100,
          is_enabled: v.is_enabled,
          in_stock: v.is_available,
        })) || [],
      available:
        product.variants?.some((v: PrintifyVariant) => v.is_enabled && v.is_available) || false,
      visible: product.visible,
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages: result.last_page || 1,
          total: result.total || 0,
          perPage,
        },
      },
    });
  } catch (err: any) {
    logger.error('Printify fetch failed:', err.message);
    return NextResponse.json(
      { ok: false, error: err?.message || 'Printify fetch failed' },
      { status: 502 },
    );
  }
}
