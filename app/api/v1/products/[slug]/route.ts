import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;

    // Get all products from Printify and find the one with matching ID
    const baseUrl = 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/printify/products`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.error || 'Failed to fetch products');
    }

    // Find the product with matching ID
    const product = data.data.products.find((p: any) => p.id === slug);

    if (!product) {
      return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 });
    }

    // Transform to our format
    const productData = {
      id: product.id,
      title: product.title,
      description: product.description,
      images: product.image ? [{ src: product.image }] : [],
      price: product.price || 0,
      category: product.tags || undefined,
      variants: product.variants || [],
      available: product.available !== false,
      visible: product.visible !== false,
    };

    return NextResponse.json({ ok: true, data: productData });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch product' }, { status: 500 });
  }
}
