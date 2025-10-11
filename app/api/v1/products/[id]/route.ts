import { type NextRequest, NextResponse } from 'next/server';
import { getPrintifyService } from '@/app/lib/printify/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Product ID is required' }, { status: 400 });
    }

    // Fetch from Printify
    const result = await getPrintifyService().getProducts(1, 100);

    if (!result || !result.data) {
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch products from Printify' },
        { status: 502 },
      );
    }

    // Find the specific product
    const product = result.data.find((p: any) => String(p.id) === String(id));

    if (!product) {
      return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 });
    }

    // Transform the product data
    const transformedProduct = {
      id: product.id,
      title: product.title,
      description: stripHtml(product.description || ''),
      price: calculatePrice(product),
      images: product.images?.map((img: any) => img.src || img) || [],
      image_url: product.images?.[0]?.src || product.images?.[0] || null,
      variants:
        product.variants?.map((v: any) => ({
          id: v.id,
          printifyVariantId: v.id,
          title: v.title || 'Default',
          priceCents: Math.round((v.price || product.price || 0) * 100),
          isEnabled: v.is_enabled !== false,
          sku: v.sku || String(v.id),
        })) || [],
      tags: product.tags || [],
      available: product.is_locked === false,
      inStock: product.is_locked === false,
    };

    return NextResponse.json(
      { ok: true, data: transformedProduct },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}

// Helper to strip HTML tags from descriptions
function stripHtml(html: string): string {
  if (!html) return '';
  // Remove HTML tags but preserve the text content
  return html
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .trim();
}

// Helper to calculate product price
function calculatePrice(product: any): number {
  // Try to get price from variants first, then product price
  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0];
    if (firstVariant.price) return firstVariant.price;
  }
  return product.price || 0;
}
