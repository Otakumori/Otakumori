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
        hasStore: !!store 
      });
      return NextResponse.json({ 
        products: [], 
        source: 'missing-env',
        error: 'Configuration incomplete'
      }, { status: 500 });
    }

    const res = await fetch(`https://api.printify.com/v1/shops/${store}/products.json`, {
      headers: { 
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Printify API: Request failed', { 
        status: res.status, 
        statusText: res.statusText,
        response: text.substring(0, 500)
      });
      return NextResponse.json({ 
        error: 'printify-failed', 
        detail: `HTTP ${res.status}: ${res.statusText}`,
        source: 'error'
      }, { status: 502 });
    }

    const data = await res.json();
    const products = (data?.data || data || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      description: p.description || '',
      image: p.images?.[0]?.src ?? null,
      tags: p.tags ?? [],
      variants: p.variants?.filter((v: any) => v.is_enabled && v.is_available) ?? [],
      price: p.variants?.[0]?.price ?? 0,
      currency: p.variants?.[0]?.currency || 'USD'
    }));

    const response = NextResponse.json({ 
      products, 
      source: 'live',
      count: products.length,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
    // Cache for 5 minutes, stale-while-revalidate for 24 hours
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    
    return response;
  } catch (e: any) {
    console.error('Printify API: Unexpected error', e);
    return NextResponse.json({ 
      error: 'unexpected', 
      detail: e?.message || 'Unknown error',
      source: 'error'
    }, { status: 500 });
  }
}
