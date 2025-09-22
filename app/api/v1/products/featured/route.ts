import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use our v1 Printify API instead of calling Printify directly
    const baseUrl = 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/printify/products`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch products');
    }

    // Transform v1 API data to our format
    const featuredProducts = data.data.products
      .filter((product: any) => product.visible !== false) // Include all visible products
      .slice(0, 8)
      .map((product: any) => ({
        id: product.id.toString(),
        name: product.title,
        price: product.price || 0, // Already in dollars from v1 API
        image: product.image || '/assets/images/placeholder-product.jpg',
        slug: product.id.toString(),
      }));

    return NextResponse.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);

    // Fallback to demo data if API fails
    const demoProducts = [
      {
        id: 'demo-1',
        name: 'Cherry Blossom Hoodie',
        price: 45.99,
        image: '/assets/images/placeholder-product.jpg',
        slug: 'cherry-blossom-hoodie',
      },
      {
        id: 'demo-2',
        name: 'Abyss T-Shirt',
        price: 24.99,
        image: '/assets/images/placeholder-product.jpg',
        slug: 'abyss-t-shirt',
      },
    ];

    return NextResponse.json(demoProducts);
  }
}
