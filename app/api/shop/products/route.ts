import { NextResponse } from 'next/server';
import { fetchProducts } from '@/utils/printifyAPI';
import { supabase, handleSupabaseError } from '@/utils/supabase/client';

interface PrintifyImage {
  src: string;
  variant_ids: string[];
  position: string;
  is_default: boolean;
}

interface PrintifyVariant {
  id: string;
  title: string;
  price: number;
  is_enabled: boolean;
  is_default: boolean;
  sku: string;
}

interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  images: PrintifyImage[];
  variants: PrintifyVariant[];
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  try {
    // Fetch products from Printify
    const printifyProducts: any = await fetchProducts();

    // Type guard: check if printifyProducts has a data property
    const productsArray = Array.isArray(printifyProducts)
      ? printifyProducts
      : printifyProducts && Array.isArray(printifyProducts.data)
        ? printifyProducts.data
        : [];

    // Transform and store in Supabase
    const transformedProducts = productsArray.map((product: PrintifyProduct) => ({
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.variants[0]?.price / 100 || 0,
      images: product.images.map((img: PrintifyImage) => img.src),
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

    // Upsert products to Supabase
    const { error } = await supabase.from('products').upsert(transformedProducts, {
      onConflict: 'id',
      ignoreDuplicates: false,
    });

    if (error) {
      handleSupabaseError(error);
    }

    return NextResponse.json({ products: transformedProducts }, { status: 200 });
  } catch (error) {
    console.error('Error in /api/shop/products:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: error instanceof Error && error.message.includes('Authentication') ? 401 : 500 }
    );
  }
}
