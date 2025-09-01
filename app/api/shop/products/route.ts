 
 
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { type NextRequest, NextResponse } from 'next/server';
import { getCatalog, checkPrintifyHealth } from '@/lib/api/printify';

export async function GET(request: NextRequest) {
  try {
    // Check Printify API health first
    const health = await checkPrintifyHealth();

    if (!health.healthy) {
      console.warn('Printify API unhealthy, returning mock data:', health.error);

      // Return mock data when Printify is not working
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
              price: 2999,
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
              price: 999,
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

      return NextResponse.json(
        {
          products: mockProducts,
          source: 'mock',
          health: health,
        },
        { status: 200 },
      );
    }

    // Fetch products from Printify
    const catalog = await getCatalog(1, 50);

    // Transform products for frontend consumption
    const transformedProducts = catalog.data.map((product) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.variants[0]?.price / 100 || 0,
      images: product.images.map((img) => img.src),
      variants: product.variants,
      category: product.tags[0] || 'Other',
      tags: product.tags,
      metadata: {
        printify_id: product.id,
        published: product.published,
        created_at: product.created_at,
        updated_at: product.updated_at,
      },
    }));

    return NextResponse.json(
      {
        products: transformedProducts,
        source: 'printify',
        health: health,
        total: catalog.total || transformedProducts.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error in /api/shop/products:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        source: 'error',
      },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 },
    );
  }
}
