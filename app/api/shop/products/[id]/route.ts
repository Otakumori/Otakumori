
import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { env } from '@/env';

const PRINTIFY_API_URL = 'https://api.printify.com/v1';
const PRINTIFY_SHOP_ID = env.PRINTIFY_SHOP_ID || '';
const PRINTIFY_API_KEY = env.PRINTIFY_API_KEY || '';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Extract query params
    const url = new URL(request.url);
    const includeVariants = url.searchParams.get('includeVariants') !== 'false';
    const includeInventory = url.searchParams.get('includeInventory') === 'true';
    
    // Fetch fresh product from Printify
    const response = await fetch(
      `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products/${params.id}.json`,
      {
        headers: {
          Authorization: `Bearer ${PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
    }

    const printifyProduct = await response.json();

    // Transform the product data
    const transformedProduct: any = {
      id: printifyProduct.id,
      title: printifyProduct.title,
      description: printifyProduct.description,
      images: printifyProduct.images.map((img: any) => img.src),
      tags: printifyProduct.tags,
    };
    
    // Use includeVariants and includeInventory
    if (includeVariants) {
      transformedProduct.variants = printifyProduct.variants.map((variant: any) => ({
        id: variant.id,
        price: variant.price,
        title: variant.title,
      }));
    }
    
    if (includeInventory) {
      // TODO: Add inventory data when Printify inventory API is integrated
      transformedProduct.inventory = { available: true };
    }

    return NextResponse.json({ product: transformedProduct });
  } catch (error) {
    logger.error(
      'Error fetching product:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product' },
      { status: 500 },
    );
  }
}
