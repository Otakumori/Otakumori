import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PRINTIFY_API_URL = 'https://api.printify.com/v1';
const PRINTIFY_SHOP_ID = env.PRINTIFY_SHOP_ID;
const PRINTIFY_API_KEY = env.PRINTIFY_API_KEY;

// Initialize Supabase client
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL!,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // First check if we have cached products in Supabase
    // Explicitly select columns to potentially help with schema caching issues
    const { data: cachedProducts, error: cacheError } = await supabase
      .from('products')
      .select('id, title, description, images, tags, variants, is_active, created_at, updated_at');

    if (cacheError) throw cacheError;

    // If we have cached products and they're less than 1 hour old, return them
    if (cachedProducts?.length > 0) {
      // Ensure cachedProducts[0].updated_at is treated as a string for Date constructor
      const lastUpdate = new Date(cachedProducts[0].updated_at as string);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      if (lastUpdate > oneHourAgo) {
        return NextResponse.json({ products: cachedProducts });
      }
    }

    // Fetch fresh products from Printify
    const response = await fetch(`${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products.json`, {
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform products for our use
    const products = data.data.map((product: any) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      images: product.images.map((img: any) => img.src),
      tags: product.tags,
      variants: product.variants.map((variant: any) => ({
        id: variant.id,
        price: variant.price,
        title: variant.title,
      })),
      is_active: true, // Still include is_active when creating/updating in Supabase
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    // Update Supabase cache
    if (products.length > 0) {
      const { error: updateError } = await supabase.from('products').upsert(products);
      if (updateError) throw updateError;
    }

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    // Provide a more specific error response if it's a database error
    if (error instanceof Error) {
       return NextResponse.json(
        { error: `Database Error: ${error.message}` },
        { status: 500 }
      );
    } else {
       return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }
  }
} 