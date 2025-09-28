// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';
import { DatabaseAccess } from '@/app/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  try {
    let products;

    if (q.trim()) {
      products = await DatabaseAccess.searchProducts(q);
    } else {
      products = await DatabaseAccess.getActiveProducts();
    }

    // Transform products to match expected format
    const transformedProducts = products.map((product: any) => ({
      id: product.id,
      slug: product.id, // Using ID as slug for now
      title: product.name,
      description: product.description || '',
      price: product.ProductVariant[0]?.priceCents ? product.ProductVariant[0].priceCents / 100 : 0,
      images: product.primaryImageUrl ? [product.primaryImageUrl] : [],
      tags: [product.category || 'apparel'],
      stock: product.ProductVariant.filter((v: any) => v.inStock).length,
      category: product.category || 'apparel',
      variants: product.ProductVariant.map((variant: any) => ({
        id: variant.id,
        price: variant.priceCents ? variant.priceCents / 100 : 0,
        inStock: variant.inStock,
        enabled: variant.isEnabled,
      })),
    }));

    // Optional short TTL cache key - disabled for now due to Redis config issues
    // TODO: Re-enable Redis caching once environment variables are fixed
    // if (redis) {
    //   const cacheKey = `products:${q || 'all'}`;
    //   await redis.setex(cacheKey, 30, JSON.stringify(transformedProducts));
    // }

    return NextResponse.json({ ok: true, items: transformedProducts });
  } catch (e) {
    log('products_error', { message: String(e) });

    // Fallback to seeded products if database fails
    const fallbackProducts = getSeededProducts();
    return NextResponse.json({ ok: true, items: fallbackProducts });
  }
}

// Fallback seeded products
function getSeededProducts() {
  return [
    {
      id: '1',
      slug: 'oni-tee',
      title: 'Oni Tee',
      description: 'Gothic Y2K anime drip',
      price: 29.0,
      images: [],
      tags: ['anime', 'oni'],
      stock: 12,
      category: 'apparel',
      variants: [{ id: '1-1', price: 29.0, inStock: true, enabled: true }],
    },
    {
      id: '2',
      slug: 'souls-hoodie',
      title: 'Souls Hoodie',
      description: 'Dark Souls inspired comfort',
      price: 45.0,
      images: [],
      tags: ['gaming', 'dark-souls'],
      stock: 8,
      category: 'apparel',
      variants: [{ id: '2-1', price: 45.0, inStock: true, enabled: true }],
    },
    {
      id: '3',
      slug: 'anime-pin-set',
      title: 'Anime Pin Set',
      description: 'Collectible enamel pins',
      price: 15.0,
      images: [],
      tags: ['anime', 'collectibles'],
      stock: 25,
      category: 'accessories',
      variants: [{ id: '3-1', price: 15.0, inStock: true, enabled: true }],
    },
  ];
}
