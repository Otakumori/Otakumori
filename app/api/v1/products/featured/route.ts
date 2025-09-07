import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '@/env';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Fetch featured products from Printify
    const response = await fetch(
      `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Printify data to our format
    const featuredProducts = data.data
      .filter((product: any) => product.visible && product.tags?.includes('featured'))
      .slice(0, 8)
      .map((product: any) => ({
        id: product.id.toString(),
        name: product.title,
        price: parseFloat(product.variants[0]?.price || '0'),
        image: product.images[0]?.src || '/assets/images/placeholder-product.jpg',
        slug: product.handle || product.id.toString(),
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
