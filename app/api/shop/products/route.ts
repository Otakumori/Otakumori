import { NextRequest, NextResponse } from 'next/server';
import { fetchProducts, fetchProductDetails } from '@/app/utils/utils/printifyAPI';
import { supabase, handleSupabaseError } from '@/utils/supabase/client';
import { env } from '@/app/lib/env';

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
    // Check if Printify credentials are configured
    if (!env.PRINTIFY_API_KEY || !env.PRINTIFY_SHOP_ID) {
      console.warn('Printify credentials not configured, returning mock data');
      
      // Return mock data when Printify is not configured
      const mockProducts = [
        {
          id: '1',
          title: 'Anime T-Shirt',
          description: 'High-quality anime-themed t-shirt made from 100% cotton.',
          price: 29.99,
          images: ['/images/products/placeholder.svg'],
          variants: [{ id: '1', title: 'Default', price: 2999, is_enabled: true, is_default: true, sku: 'ANIME-TS-001' }],
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
          variants: [{ id: '2', title: 'Default', price: 999, is_enabled: true, is_default: true, sku: 'MANGA-KC-001' }],
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

      return NextResponse.json({ products: mockProducts }, { status: 200 });
    }

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

    // Only attempt to upsert to Supabase if we have products and Supabase is configured
    if (transformedProducts.length > 0 && env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const { error } = await supabase.from('products').upsert(transformedProducts, {
          onConflict: 'id',
          ignoreDuplicates: false,
        });

        if (error) {
          handleSupabaseError(error);
        }
      } catch (dbError) {
        console.error('Supabase upsert error:', dbError);
        // Continue execution even if database update fails
      }
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
