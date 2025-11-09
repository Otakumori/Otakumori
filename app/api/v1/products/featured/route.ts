import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { serializeProduct } from '@/lib/catalog/serialize';
import { getPrintifyService } from '@/app/lib/printify/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const parsed = val ? parseInt(val, 10) : 6;
      return Number.isNaN(parsed) ? 6 : Math.max(1, Math.min(parsed, 12));
    }),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));

    const products = await db.product.findMany({
      where: {
        active: true,
        visible: true,
        ProductVariant: {
          some: {
            isEnabled: true,
          },
        },
      },
      include: {
        ProductVariant: true,
        ProductImage: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: query.limit,
    });

    const normalized = products.map((product) => {
      const dto = serializeProduct(product);
      return {
        id: dto.id,
        title: dto.title,
        description: dto.description,
        price: dto.price ?? 0,
        image: dto.image ?? '/assets/placeholder-product.jpg',
        images: dto.images,
        tags: dto.tags,
        variants: dto.variants.map((variant) => ({
          id: variant.id,
          title: variant.title,
          price: variant.price ?? 0,
          priceCents: variant.priceCents ?? null,
          is_enabled: variant.isEnabled,
          in_stock: variant.inStock,
          printifyVariantId: variant.printifyVariantId,
          optionValues: variant.optionValues,
          previewImageUrl: variant.previewImageUrl,
        })),
        available: dto.available,
        category: dto.category ?? undefined,
        slug: dto.slug,
        integrationRef: dto.integrationRef,
      };
    });

    if (normalized.length > 0) {
      return NextResponse.json({
        ok: true,
        data: { products: normalized },
        source: 'catalog',
        timestamp: new Date().toISOString(),
      });
    }

    const printifyClient = getPrintifyService();
    const printifyResult = await printifyClient.getProducts(1, query.limit);
    const publishedProducts = (printifyResult.data || []).filter((product) => product?.variants?.some((variant) => variant.is_enabled));

    const mappedPrintify = publishedProducts.map((product) => {
      const defaultImage = product.images?.find((img) => img.is_default) ?? product.images?.[0] ?? null;
      const defaultVariant =
        product.variants?.find((variant) => variant.is_default) ?? product.variants?.[0] ?? null;
      const priceCents = defaultVariant?.price ?? null;
      const price = priceCents != null ? priceCents / 100 : 0;

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        price,
        priceCents,
        image: defaultImage?.src ?? '/assets/placeholder-product.jpg',
        images: (product.images ?? []).map((img) => img.src),
        tags: product.tags ?? [],
        variants:
          product.variants?.map((variant) => ({
            id: String(variant.id),
            title: variant.title,
            price: variant.price / 100,
            priceCents: variant.price,
            is_enabled: variant.is_enabled,
            in_stock: variant.is_available ?? variant.is_enabled,
            printifyVariantId: variant.id,
            optionValues: [],
            previewImageUrl: defaultImage?.src ?? null,
          })) ?? [],
        available: (defaultVariant?.is_enabled ?? false) && product.visible,
        category: product.tags?.[0],
        slug: undefined,
        integrationRef: product.id,
      };
    });

    return NextResponse.json({
      ok: true,
      data: { products: mappedPrintify },
      source: 'printify',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Featured products API error:', error);
    return NextResponse.json(
      {
        ok: true,
        data: { products: [] },
        source: 'fallback',
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  }
}
