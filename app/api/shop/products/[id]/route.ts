/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

const PRINTIFY_API_URL = 'https://api.printify.com/v1';
const PRINTIFY_SHOP_ID = env.PRINTIFY_SHOP_ID || '';
const PRINTIFY_API_KEY = env.PRINTIFY_API_KEY || '';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
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

    return NextResponse.json({ product: transformedProduct });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product' },
      { status: 500 },
    );
  }
}
