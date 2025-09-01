export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Use our new v1 Printify API route instead of the old implementation
    const response = await fetch(`${request.nextUrl.origin}/api/v1/printify/products`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch from v1 Printify API:', response.status);
      throw new Error(`Printify API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok) {
      console.error('Printify API returned error:', data.error);
      throw new Error(data.error || 'Failed to fetch products');
    }

    // Transform products for frontend consumption
    const transformedProducts = data.data.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price || 0,
      images: product.image ? [product.image] : ['/images/products/placeholder.svg'],
      variants: product.variants || [],
      category: product.tags?.[0] || 'Other',
      tags: product.tags || [],
      metadata: {
        printify_id: product.id,
        published: true,
        created_at: product.createdAt || new Date().toISOString(),
        updated_at: product.updatedAt || new Date().toISOString(),
      },
    }));

    console.log(
      `Shop API: Transformed ${transformedProducts.length} products from v1 Printify API`,
    );

    return NextResponse.json(
      {
        products: transformedProducts,
        source: 'v1-api',
        count: transformedProducts.length,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Shop products API error:', error);

    // Return empty products instead of mock data
    return NextResponse.json(
      {
        products: [],
        source: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
