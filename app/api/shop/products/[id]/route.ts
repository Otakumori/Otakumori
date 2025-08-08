import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';
import { env } from '@/env';

const PRINTIFY_API_URL = 'https://api.printify.com/v1';
const PRINTIFY_SHOP_ID = env.PRINTIFY_SHOP_ID || '';
const PRINTIFY_API_KEY = env.PRINTIFY_API_KEY || '';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Check cache first
    const { data: cachedProduct, error: cacheError } = await supabase
      .from('product_cache')
      .select('*')
      .eq('id', params.id)
      .single();

    if (cachedProduct && !cacheError) {
      const cacheAge = Date.now() - new Date(cachedProduct.updated_at).getTime();
      // Return cached product if it's less than 1 hour old
      if (cacheAge < 3600000) {
        return NextResponse.json({ product: cachedProduct.data });
      }
    }

    // Fetch fresh product from Printify
    const response = await fetch(
      `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products/${params.id}.json`,
      {
        headers: {
          Authorization: `Bearer ${PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
    }

    const printifyProduct = await response.json();

    // Transform the product data
    const transformedProduct = {
      id: printifyProduct.id,
      title: printifyProduct.title,
      description: printifyProduct.description,
      images: printifyProduct.images.map((img: any) => img.src),
      variants: printifyProduct.variants.map((variant: any) => ({
        id: variant.id,
        price: variant.price,
        title: variant.title,
      })),
      tags: printifyProduct.tags,
    };

    // Update cache
    await supabase.from('product_cache').upsert({
      id: params.id,
      data: transformedProduct,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ product: transformedProduct });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
