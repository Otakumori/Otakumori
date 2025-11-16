import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { serializeProduct } from '@/lib/catalog/serialize';
import { getPrintifyService } from '@/app/lib/printify/service';
import { deduplicateProducts } from '@/app/lib/shop/catalog';

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
  excludeTitles: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return [];
      return val.split(',').map((t) => t.trim()).filter(Boolean);
    }),
});

async function fetchCatalogProducts(limit: number, forcePrintify = false) {
  // If forcePrintify is true, skip database fetch and let it fall through to Printify
  if (forcePrintify) {
    return null;
  }

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
    take: limit,
  });

  if (products.length === 0) {
    return null;
  }

  const normalized = products.map((product) => {
    const dto = serializeProduct(product);
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      price: dto.price ?? 0,
      image: dto.image ?? '',
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
      blueprintId: dto.blueprintId ?? null,
      printifyProductId: dto.printifyProductId ?? null,
    };
  });

  return {
    ok: true,
    data: { products: normalized },
    source: 'catalog' as const,
  };
}

async function fetchPrintifyProducts(limit: number, excludeTitles: string[] = []) {
  const printifyClient = getPrintifyService();
  // Fetch more products than needed to account for deduplication and exclusions
  const fetchLimit = Math.max(limit * 3, 50);
  const printifyResult = await printifyClient.getProducts(1, fetchLimit);
  const publishedProducts = (printifyResult.data || []).filter((product) =>
    product?.variants?.some((variant) => variant.is_enabled),
  );

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
      image: defaultImage?.src ?? '',
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
      blueprintId: product.blueprint_id ?? null,
      printifyProductId: String(product.id),
    };
  });

  // Apply deduplication and exclusions
  const deduplicated = deduplicateProducts(mappedPrintify, {
    limit,
    excludeTitles,
    deduplicateBy: 'both', // Deduplicates by blueprintId, printifyProductId, and id
  });

  return {
    ok: true,
    data: { products: deduplicated },
    source: 'printify' as const,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse(Object.fromEntries(searchParams));
    const forcePrintify = searchParams.get('force_printify') === 'true';

    // Try database first (unless forcePrintify is true)
    const catalogResult = await fetchCatalogProducts(query.limit, forcePrintify);
    if (catalogResult) {
      // Apply deduplication and exclusions to catalog products
      const deduplicated = deduplicateProducts(catalogResult.data.products, {
        limit: query.limit,
        excludeTitles: query.excludeTitles,
        deduplicateBy: 'both',
      });

      return NextResponse.json({
        ok: true,
        data: { products: deduplicated },
        source: catalogResult.source,
        timestamp: new Date().toISOString(),
      });
    }

    // If forcePrintify is true or no database products, try Printify
    if (forcePrintify) {
      try {
        const printifyResult = await fetchPrintifyProducts(query.limit, query.excludeTitles);
        if (printifyResult && printifyResult.data.products.length > 0) {
          return NextResponse.json({
            ok: true,
            data: { products: printifyResult.data.products },
            source: printifyResult.source,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (printifyError) {
        // Fall through to empty response
      }
    }

    // Return empty array if no products found
    return NextResponse.json({
      ok: true,
      data: { products: [] },
      source: 'empty',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
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
