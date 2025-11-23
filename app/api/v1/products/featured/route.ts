import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { serializeProduct } from '@/lib/catalog/serialize';
import { getPrintifyService } from '@/app/lib/printify/service';
import { deduplicateProducts } from '@/app/lib/shop/catalog';
import { filterValidPrintifyProducts } from '@/app/lib/shop/printify-filters';
import {
  generateRequestId,
  createApiError,
  createApiSuccess,
  FeaturedProductsResponseSchema,
} from '@/app/lib/api-contracts';

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
      return val
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
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
      primaryImageUrl: {
        not: null,
      },
      NOT: [
        {
          primaryImageUrl: {
            contains: 'placeholder',
            mode: 'insensitive',
          },
        },
        {
          primaryImageUrl: {
            contains: 'seed:',
            mode: 'insensitive',
          },
        },
        {
          integrationRef: {
            startsWith: 'seed:',
          },
        },
        {
          name: {
            contains: '[test]',
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: '[draft]',
            mode: 'insensitive',
          },
        },
      ],
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
      visible: dto.visible ?? true,
      active: dto.active ?? true,
      isLocked: dto.isLocked ?? false,
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
  
  // First filter for visible products with enabled variants
  const publishedProducts = (printifyResult.data || []).filter((product) => {
    // Must be visible
    if (!product.visible) return false;
    // Must have at least one enabled variant
    if (!product?.variants?.some((variant) => variant.is_enabled)) return false;
    return true;
  });

  // Apply comprehensive filtering before mapping
  const validProducts = filterValidPrintifyProducts(publishedProducts);

  const mappedPrintify = validProducts.map((product) => {
    const defaultImage =
      product.images?.find((img) => img.is_default) ?? product.images?.[0] ?? null;
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
      visible: product.visible ?? true,
      active: product.visible ?? true, // In Printify, visible means published/active
      isLocked: product.is_locked ?? false, // Track Printify "Publishing" status
      category: product.tags?.[0],
      slug: undefined,
      integrationRef: product.id,
      blueprintId: product.blueprint_id ?? null,
      printifyProductId: String(product.id),
    };
  });

  // Additional filtering after mapping - products already filtered before mapping, but double-check
  const filtered = mappedPrintify.filter((product) => {
    if (!product.image || product.image.trim() === '') return false;
    if (product.image.includes('placeholder') || product.image.includes('seed:')) return false;
    if (product.integrationRef?.startsWith('seed:')) return false;
    if (product.title && (product.title.toLowerCase().includes('[test]') || product.title.toLowerCase().includes('[draft]'))) return false;
    return true;
  });

  // Apply deduplication and exclusions
  const deduplicated = deduplicateProducts(filtered, {
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
  const requestId = generateRequestId();

  try {
    const { searchParams } = new URL(request.url);

    // Validate query parameters
    const queryResult = QuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!queryResult.success) {
      return NextResponse.json(
        createApiError(
          'VALIDATION_ERROR',
          'Invalid query parameters',
          requestId,
          queryResult.error.issues,
        ),
        { status: 400 },
      );
    }

    const query = queryResult.data;
    const forcePrintify = searchParams.get('force_printify') === 'true';

    // Try database first (unless forcePrintify is true)
    const catalogResult = await fetchCatalogProducts(query.limit, forcePrintify);
    if (catalogResult) {
      // Filter out placeholder/fake products from database
      const filtered = catalogResult.data.products.filter((product) => {
        // Exclude products with placeholder images
        if (product.image?.includes('placeholder') || product.image?.includes('seed:')) {
          return false;
        }
        // Exclude products with seed: integrationRef
        if (product.integrationRef?.startsWith('seed:')) {
          return false;
        }
        // Exclude products with no image or empty image
        if (!product.image || product.image.trim() === '') {
          return false;
        }
        return true;
      });

      // Apply deduplication and exclusions to catalog products
      const deduplicated = deduplicateProducts(filtered, {
        limit: query.limit,
        excludeTitles: query.excludeTitles,
        deduplicateBy: 'both',
      });

      // Normalize products to ensure consistent structure
      const normalizedProducts = deduplicated.map((product) => ({
        id: String(product.id || ''),
        title: String(product.title || 'Untitled Product'),
        description: product.description ? String(product.description) : null,
        price: typeof product.price === 'number' ? Math.max(0, product.price) : 0,
        image: String(product.image || ''),
        available: product.available !== false,
        slug: product.slug ? String(product.slug) : String(product.id || ''),
        category: product.category ? String(product.category) : null,
        tags: Array.isArray(product.tags) ? product.tags.map(String) : [],
      }));

      const response = createApiSuccess(
        {
          products: normalizedProducts,
          pagination: undefined, // Catalog results don't include pagination
        },
        requestId,
      );

      // Validate response before returning
      const validated = FeaturedProductsResponseSchema.safeParse({
        ...response,
        source: catalogResult.source,
        timestamp: new Date().toISOString(),
      });

      if (!validated.success) {
        console.error('[API] Response validation failed:', validated.error);
        // Return safe fallback
        return NextResponse.json(
          createApiSuccess({ products: [], pagination: undefined }, requestId),
          { status: 200 },
        );
      }

      return NextResponse.json(validated.data);
    }

    // If forcePrintify is true or no database products, try Printify
    if (forcePrintify) {
      try {
        const printifyResult = await fetchPrintifyProducts(query.limit, query.excludeTitles);
        if (printifyResult && printifyResult.data.products.length > 0) {
          // Normalize Printify products - they're already filtered and deduplicated
          const normalizedProducts = printifyResult.data.products.map((product: any) => ({
            id: String(product.id || ''),
            title: String(product.title || 'Untitled Product'),
            description: product.description ? String(product.description) : null,
            price: typeof product.price === 'number' ? Math.max(0, product.price) : 0,
            image: String(product.image || ''),
            available: product.available !== false,
            slug: product.slug ? String(product.slug) : String(product.id || ''),
            category: product.category ? String(product.category) : null,
            tags: Array.isArray(product.tags) ? product.tags.map(String) : [],
          }));

          const response = createApiSuccess(
            {
              products: normalizedProducts,
              pagination: undefined, // Printify results don't include pagination
            },
            requestId,
          );

          // Validate response
          const validated = FeaturedProductsResponseSchema.safeParse({
            ...response,
            source: printifyResult.source,
            timestamp: new Date().toISOString(),
          });

          if (!validated.success) {
            console.error('[API] Printify response validation failed:', validated.error);
            return NextResponse.json(
              createApiSuccess({ products: [], pagination: undefined }, requestId),
              { status: 200 },
            );
          }

          return NextResponse.json(validated.data);
        }
      } catch (error) {
        console.warn('[API] Printify fetch failed:', error);
        // Fall through to empty response
      }
    }

    // Return empty array if no products found
    const emptyResponse = createApiSuccess({ products: [], pagination: undefined }, requestId);

    const validated = FeaturedProductsResponseSchema.safeParse({
      ...emptyResponse,
      source: 'empty',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(validated.success ? validated.data : emptyResponse);
  } catch (error) {
    console.error('[API] Featured products endpoint error:', error);
    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch featured products', requestId),
      { status: 500 },
    );
  }
}
