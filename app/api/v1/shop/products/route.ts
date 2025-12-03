
import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Debug: Check environment variables
    // '⌕ Environment check:'
    // 'Shop ID:', env.PRINTIFY_SHOP_ID
    // 'API Key exists:', !!env.PRINTIFY_API_KEY
    // 'API Key length:', env.PRINTIFY_API_KEY?.length

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Simple Printify API call
    const url = `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`;
    // ' Calling URL:', url

    const printifyResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // ' Response status:', printifyResponse.status
    // ' Response headers:', Object.fromEntries(printifyResponse.headers.entries());

    if (!printifyResponse.ok) {
      const errorText = await printifyResponse.text();
      logger.error('Printify API error:', undefined, { status: printifyResponse.status, text: errorText }, undefined);
      return NextResponse.json(
        { ok: false, error: `Printify API error: ${printifyResponse.status}` },
        { status: 500 },
      );
    }

    const printifyData = await printifyResponse.json();
    // ' Success! Products found:', printifyData.data?.length || 0

    // Transform products
    const products = printifyData.data.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.variants[0]?.price / 100 || 0,
      images: product.images.map((img: any) => img.src),
      category: product.tags[0] || 'other',
      tags: product.tags,
    }));

    // Filter and paginate
    const filteredProducts = category
      ? products.filter((p: any) => p.category === category)
      : products;

    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return NextResponse.json({
      ok: true,
      data: {
        products: paginatedProducts,
        total: filteredProducts.length,
      },
    });
  } catch (error) {
    logger.error(' Error fetching products:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
