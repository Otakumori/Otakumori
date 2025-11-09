import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { serializeProduct } from '@/lib/catalog/serialize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const product = await db.product.findFirst({
      where: {
        OR: [
          { id },
          { printifyProductId: id },
          { integrationRef: id },
        ],
        active: true,
      },
      include: {
        ProductVariant: true,
        ProductImage: true,
      },
    });

    if (!product) {
      return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 });
    }

    const dto = serializeProduct(product);

    return NextResponse.json({
      ok: true,
      data: {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        images: dto.images.map((src) => ({ src })),
        price: dto.price ?? 0,
        priceCents: dto.priceCents ?? null,
        category: dto.categorySlug ?? dto.category ?? undefined,
        variants: dto.variants,
        available: dto.available,
        visible: product.visible,
        slug: dto.slug,
        tags: dto.tags,
        integrationRef: dto.integrationRef,
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch product' }, { status: 500 });
  }
}
