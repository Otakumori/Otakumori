import { type NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { db } from '@/app/lib/db';
import { getPrintifyService, type PrintifyProduct } from '@/app/lib/printify/service';
import { serializeProduct, type CatalogProduct } from '@/lib/catalog/serialize';
import { normalizeCategorySlug, createProductSlug } from '@/lib/catalog/mapPrintify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type OptionValue = {
  option?: string;
  value?: string;
  colors?: string[];
};

function buildOptionValueMap(product: PrintifyProduct): Map<number, OptionValue> {
  const map = new Map<number, OptionValue>();

  for (const option of product.options ?? []) {
    const optionName = option.name;
    for (const value of option.values ?? []) {
      if (value?.id == null) continue;
      map.set(value.id, {
        option: optionName,
        value: value?.title,
        colors: value?.colors,
      });
    }
  }

  return map;
}

function resolveVariantOptionValues(
  product: PrintifyProduct,
  variantOptions: number[] | undefined,
): OptionValue[] {
  if (!variantOptions || variantOptions.length === 0) {
    return [];
  }

  const optionValueMap = buildOptionValueMap(product);
  return variantOptions
    .map((optionId) => optionValueMap.get(optionId))
    .filter((value): value is OptionValue => Boolean(value));
}

function resolveVariantPreviewImage(product: PrintifyProduct, variantId: number): string | null {
  const match = product.images?.find((image) => image.variant_ids?.includes(variantId));
  if (match?.src) {
    return match.src;
  }

  const defaultImage = product.images?.find((image) => image.is_default);
  if (defaultImage?.src) {
    return defaultImage.src;
  }

  return product.images?.[0]?.src ?? null;
}

function mapPrintifyProductToCatalog(product: PrintifyProduct): CatalogProduct {
  const images = (product.images ?? [])
    .map((image) => image?.src)
    .filter((src): src is string => Boolean(src));

  const variants = product.variants ?? [];
  const prices = variants
    .map((variant) => (typeof variant.price === 'number' ? Math.round(variant.price) : null))
    .filter((price): price is number => price != null && price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;
  const categorySlug = normalizeCategorySlug(product);

  return {
    id: String(product.id),
    title: product.title,
    slug: createProductSlug(product.title ?? 'product', String(product.id)),
    description: product.description ?? '',
    image: images[0] ?? null,
    images,
    tags: product.tags ?? [],
    category: product.tags?.[0] ?? null,
    categorySlug,
    price: minPrice != null ? minPrice / 100 : null,
    priceCents: minPrice,
    priceRange: {
      min: minPrice,
      max: maxPrice ?? minPrice,
    },
    available: variants.some(
      (variant) =>
        (variant.is_enabled ?? true) && (variant.is_available ?? variant.is_enabled ?? true),
    ),
    variants: variants.map((variant) => {
      const priceCents =
        typeof variant.price === 'number' && !Number.isNaN(variant.price)
          ? Math.round(variant.price)
          : null;
      return {
        id: String(variant.id),
        title: variant.title ?? null,
        sku: variant.sku ?? null,
        price: priceCents != null ? priceCents / 100 : null,
        priceCents,
        inStock: variant.is_available ?? variant.is_enabled ?? true,
        isEnabled: variant.is_enabled ?? true,
        printifyVariantId: variant.id,
        optionValues: resolveVariantOptionValues(product, variant.options),
        previewImageUrl: resolveVariantPreviewImage(product, variant.id),
      };
    }),
    integrationRef: String(product.id),
    printifyProductId: String(product.id),
    blueprintId: product.blueprint_id ?? null,
    printProviderId: product.print_provider_id ?? null,
    lastSyncedAt: null,
  };
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    let product = null;

    try {
      product = await db.product.findFirst({
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
    } catch (prismaError) {
      if (
        prismaError instanceof Prisma.PrismaClientKnownRequestError &&
        prismaError.code === 'P2022'
      ) {
        console.warn(
          '[products/:id] Prisma schema mismatch detected, falling back to Printify',
          prismaError.message,
        );
      } else {
        throw prismaError;
      }
    }

    if (!product) {
      try {
        const printifyService = getPrintifyService();
        const printifyProduct = await printifyService.getProduct(id);
        const dto = mapPrintifyProductToCatalog(printifyProduct);

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
            visible: printifyProduct.visible ?? true,
            slug: dto.slug,
            tags: dto.tags,
            integrationRef: dto.integrationRef,
            source: 'printify',
          },
        });
      } catch (printifyError) {
        if (
          printifyError instanceof Error &&
          /Printify API error\s*\(404\)/.test(printifyError.message)
        ) {
          return NextResponse.json({ ok: false, error: 'Product not found' }, { status: 404 });
        }
        throw printifyError;
      }
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
