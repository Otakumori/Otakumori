// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const key = env.PRINTIFY_API_KEY;
    const store = env.PRINTIFY_SHOP_ID;

    if (!key || !store) {
      console.error('Printify API: Missing environment variables', {
        hasKey: !!key,
        hasStore: !!store,
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'Configuration incomplete',
          data: [],
        },
        { status: 200 },
      );
    }

    const res = await fetch(`https://api.printify.com/v1/shops/${store}/products.json`, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error('Printify API error:', res.status, res.statusText);
      return NextResponse.json(
        {
          ok: false,
          error: `Printify API error: ${res.status}`,
          data: [],
        },
        { status: 200 },
      );
    }

    const data = await res.json();

    // Transform products to match expected format
    const products =
      data.data?.map((product: any) => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.variants?.[0]?.price || 0,
        image: product.images?.[0]?.src || '',
        tags: product.tags || [],
        variants: product.variants || [],
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      })) || [];

    console.log(`Printify API: Fetched ${products.length} products from live API`);

    return NextResponse.json({
      ok: true,
      data: products,
      source: 'live-api',
      count: products.length,
    });
  } catch (error) {
    console.error('Printify API error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch products',
        data: [],
      },
      { status: 200 },
    );
  }
}
