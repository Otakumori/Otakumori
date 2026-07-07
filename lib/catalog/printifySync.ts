import { Prisma } from '@prisma/client';
import { db } from '@/app/lib/db';
import type { PrintifyProduct } from '@/app/lib/printify/service';
import { type PrintifySyncResult } from '@/app/lib/printify/service';
import { integrationRef, normalizeCategorySlug } from '@/lib/catalog/mapPrintify';
import { env } from '@/env/server';
import { logger } from '@/app/lib/logger';

type SyncOptions = {
  hideMissing?: boolean;
  requestId?: string;
};

/**
 * Staleness threshold for product sync (2 hours in milliseconds)
 * Products older than this threshold are considered stale
 */
export const SYNC_STALENESS_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

type OptionValue = {
  option: string;
  value: string;
  colors?: string[];
};

function buildOptionValueMap(product: PrintifyProduct) {
  const map = new Map<number, OptionValue>();

  for (const option of product.options ?? []) {
    for (const optionValue of option.values ?? []) {
      map.set(optionValue.id, {
        option: option.name,
        value: optionValue.title,
        colors: optionValue.colors,
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

type PrismaClientOrTransaction = Prisma.TransactionClient | typeof db;

function selectedVariants(product: PrintifyProduct) {
  return (product.variants ?? []).filter((variant) => variant.is_enabled !== false);
}

function normalizeImageUrl(src: string) {
  return src.trim();
}

function selectedImages(product: PrintifyProduct) {
  const selectedVariantIds = new Set(selectedVariants(product).map((variant) => variant.id));
  const usableImages = (product.images ?? []).filter((image) => image?.src?.trim());
  const selectedOrDefaultImages = usableImages.filter((image) => {
    if (image.is_default) return true;

    const imageVariantIds = image.variant_ids ?? [];
    if (imageVariantIds.length === 0) return true;

    return imageVariantIds.some((variantId) => selectedVariantIds.has(variantId));
  });
  const sourceImages =
    selectedOrDefaultImages.length > 0 ? selectedOrDefaultImages : usableImages.slice(0, 1);
  const byUrl = new Map<string, (typeof usableImages)[number]>();

  for (const image of sourceImages) {
    const url = normalizeImageUrl(image.src);
    if (!url || byUrl.has(url)) continue;
    byUrl.set(url, { ...image, src: url });
  }

  return Array.from(byUrl.values());
}

function sanitizedFailureCategory(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return `prisma_${error.code}`;
  }

  if (error instanceof Error) {
    return error.name || 'error';
  }

  return 'unknown';
}

function boundedTitle(title: string | undefined) {
  return (title ?? 'untitled').slice(0, 120);
}

async function syncProductRecord(
  tx: PrismaClientOrTransaction,
  product: PrintifyProduct,
): Promise<string> {
  const categorySlug = normalizeCategorySlug(product);
  const productIntegrationRef = integrationRef(env.PRINTIFY_SHOP_ID, String(product.id));
  const images = selectedImages(product);
  const defaultImage = images.find((img) => img.is_default) ?? images[0] ?? null;
  const primaryImageUrl = defaultImage?.src ?? null;
  const existingProduct = await tx.product.findUnique({
    where: { printifyProductId: String(product.id) },
    select: { active: true, visible: true },
  });
  const providerVisible = product.visible ?? true;
  const nextActive = existingProduct?.active === false ? false : providerVisible;
  const nextVisible =
    existingProduct?.active === false || existingProduct?.visible === false
      ? false
      : providerVisible;
  const specs = {
    safetyInformation: product.safety_information ?? null,
    salesChannelProperties: product.sales_channel_properties ?? null,
    views: product.views ?? null,
    is_locked: product.is_locked ?? false, // Track Printify "Publishing" status
  };

  const upserted = await tx.product.upsert({
    where: { printifyProductId: String(product.id) },
    update: {
      name: product.title,
      description: product.description ?? null,
      primaryImageUrl,
      category: product.tags?.[0] ?? null,
      categorySlug,
      active: nextActive,
      visible: nextVisible,
      blueprintId: product.blueprint_id ?? null,
      printProviderId: product.print_provider_id ?? null,
      tags: product.tags ?? [],
      options: product.options ?? [],
      specs,
      integrationRef: productIntegrationRef,
      lastSyncedAt: new Date(),
    },
    create: {
      name: product.title,
      description: product.description ?? null,
      primaryImageUrl,
      category: product.tags?.[0] ?? null,
      categorySlug,
      active: providerVisible,
      visible: providerVisible,
      blueprintId: product.blueprint_id ?? null,
      printProviderId: product.print_provider_id ?? null,
      tags: product.tags ?? [],
      options: product.options ?? [],
      specs,
      integrationRef: productIntegrationRef,
      printifyProductId: String(product.id),
      lastSyncedAt: new Date(),
    },
  });

  const incomingImages = new Set<string>();
  for (const [index, image] of images.entries()) {
    incomingImages.add(image.src);
    await tx.productImage.upsert({
      where: {
        productId_url: {
          productId: upserted.id,
          url: image.src,
        },
      },
      update: {
        position: index,
        variantIds: image.variant_ids ?? [],
        isDefault: image.is_default ?? false,
      },
      create: {
        productId: upserted.id,
        url: image.src,
        position: index,
        variantIds: image.variant_ids ?? [],
        isDefault: image.is_default ?? false,
      },
    });
  }

  if (incomingImages.size > 0) {
    await tx.productImage.deleteMany({
      where: {
        productId: upserted.id,
        url: { notIn: Array.from(incomingImages) },
      },
    });
  }

  const variants = selectedVariants(product);
  const incomingVariantIds = new Set<number>(variants.map((variant) => variant.id));

  if (variants.length > 0) {
    for (const variant of variants) {
      const optionValues = resolveVariantOptionValues(product, variant.options);
      const variantCostValue = (variant as { cost?: number }).cost;
      const variantCost = typeof variantCostValue === 'number' ? variantCostValue : null;
      const previewImageUrl = resolveVariantPreviewImage(product, variant.id);
      const printProviderName = upserted.printProviderId ? String(upserted.printProviderId) : null;
      const variantData = {
        productId: upserted.id,
        previewImageUrl,
        printifyVariantId: variant.id,
        printProviderName,
        title: variant.title ?? null,
        sku: variant.sku ?? null,
        grams: variant.grams ?? null,
        isEnabled: true,
        inStock: variant.is_available !== false,
        priceCents: variant.price ?? null,
        currency: 'USD',
        isDefaultVariant: variant.is_default ?? false,
        optionValues,
        costCents: variantCost,
        lastSyncedAt: new Date(),
      };

      await tx.productVariant.upsert({
        where: {
          productId_printifyVariantId: {
            productId: upserted.id,
            printifyVariantId: variant.id,
          },
        },
        update: {
          previewImageUrl,
          printProviderName,
          title: variant.title ?? null,
          sku: variant.sku ?? null,
          grams: variant.grams ?? null,
          priceCents: variant.price ?? null,
          isEnabled: true,
          inStock: variant.is_available !== false,
          currency: 'USD',
          isDefaultVariant: variant.is_default ?? false,
          optionValues,
          costCents: variantCost,
          lastSyncedAt: new Date(),
        },
        create: variantData,
      });
    }
  }

  if (incomingVariantIds.size > 0) {
    await tx.productVariant.updateMany({
      where: {
        productId: upserted.id,
        printifyVariantId: { notIn: Array.from(incomingVariantIds) },
      },
      data: {
        isEnabled: false,
        inStock: false,
      },
    });
  }

  return upserted.id;
}

export async function syncPrintifyProducts(
  products: PrintifyProduct[],
  options: SyncOptions = {},
): Promise<PrintifySyncResult> {
  const stats: PrintifySyncResult = {
    upserted: 0,
    hidden: 0,
    count: products.length,
    errors: [],
    lastSync: new Date().toISOString(),
  };

  const incomingIds = new Set<string>();

  for (const product of products) {
    try {
      await db.$transaction(async (tx) => {
        await syncProductRecord(tx, product);
      });
      incomingIds.add(String(product.id));
      stats.upserted += 1;
    } catch (error) {
      const selected = selectedVariants(product);
      const images = selectedImages(product);
      const category = sanitizedFailureCategory(error);

      logger.error('printify_catalog_sync_product_failed', {
        requestId: options.requestId,
        route: 'lib/catalog/printifySync',
        extra: {
          printifyProductId: String(product.id || 'unknown'),
          title: boundedTitle(product.title),
          rawVariantCount: product.variants?.length ?? 0,
          selectedVariantCount: selected.length,
          rawImageCount: product.images?.length ?? 0,
          selectedImageCount: images.length,
          failureCategory: category,
          prismaCode:
            error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
        },
      });

      stats.errors.push(`Product ${product.id}: ${category}`);
    }
  }

  if (options.hideMissing) {
    const existingProducts = await db.product.findMany({
      where: {
        printifyProductId: { not: null },
      },
      select: {
        id: true,
        printifyProductId: true,
      },
    });

    const toHide = existingProducts
      .filter(
        (record) => record.printifyProductId && !incomingIds.has(String(record.printifyProductId)),
      )
      .map((record) => record.id);

    if (toHide.length > 0) {
      await db.product.updateMany({
        where: { id: { in: toHide } },
        data: { active: false, visible: false },
      });
      stats.hidden = toHide.length;
    }
  }

  return stats;
}

/**
 * Check if sync is stale (older than threshold)
 * @param thresholdHours - Number of hours before sync is considered stale (default: 2)
 * @returns true if sync is stale or no sync has occurred
 */
export async function isSyncStale(thresholdHours = 2): Promise<boolean> {
  const threshold = new Date();
  threshold.setHours(threshold.getHours() - thresholdHours);

  const mostRecentSync = await db.product.findFirst({
    where: {
      lastSyncedAt: { not: null },
    },
    orderBy: {
      lastSyncedAt: 'desc',
    },
    select: {
      lastSyncedAt: true,
    },
  });

  if (!mostRecentSync?.lastSyncedAt) {
    return true; // No sync has occurred
  }

  return mostRecentSync.lastSyncedAt < threshold;
}

/**
 * Get the last sync time
 * @returns ISO string of last sync time, or null if no sync has occurred
 */
export async function getLastSyncTime(): Promise<string | null> {
  const mostRecentSync = await db.product.findFirst({
    where: {
      lastSyncedAt: { not: null },
    },
    orderBy: {
      lastSyncedAt: 'desc',
    },
    select: {
      lastSyncedAt: true,
    },
  });

  return mostRecentSync?.lastSyncedAt?.toISOString() ?? null;
}

/**
 * Get sync statistics
 * @returns Object with sync stats
 */
export async function getSyncStats() {
  const [totalProducts, syncedProducts, staleProducts] = await Promise.all([
    db.product.count(),
    db.product.count({
      where: {
        lastSyncedAt: { not: null },
      },
    }),
    db.product.count({
      where: {
        lastSyncedAt: {
          lt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
      },
    }),
  ]);

  const lastSyncTime = await getLastSyncTime();
  const isStale = await isSyncStale(2);

  return {
    totalProducts,
    syncedProducts,
    staleProducts,
    lastSyncTime,
    isStale,
  };
}

export async function syncSinglePrintifyProduct(product: PrintifyProduct) {
  await syncProductRecord(db, product);
}

/**
 * Get the last sync time for a specific product
 * @param productId - Product ID (internal or Printify ID)
 * @returns Last sync timestamp or null if product not found or never synced
 */
export async function getProductLastSyncTime(productId: string): Promise<Date | null> {
  const product = await db.product.findFirst({
    where: {
      OR: [{ id: productId }, { printifyProductId: productId }],
    },
    select: {
      lastSyncedAt: true,
    },
  });

  return product?.lastSyncedAt ?? null;
}

/**
 * Get the most recent sync time across all products
 * @returns Last sync timestamp or null if no products have been synced
 */
export async function getGlobalLastSyncTime(): Promise<Date | null> {
  const product = await db.product.findFirst({
    where: {
      lastSyncedAt: { not: null },
    },
    orderBy: {
      lastSyncedAt: 'desc',
    },
    select: {
      lastSyncedAt: true,
    },
  });

  return product?.lastSyncedAt ?? null;
}

/**
 * Check if a product's sync is stale
 * @param productId - Product ID (internal or Printify ID)
 * @param thresholdMs - Optional custom threshold in milliseconds (defaults to SYNC_STALENESS_THRESHOLD_MS)
 * @returns true if product is stale or not found, false if fresh
 */
export async function isProductSyncStale(
  productId: string,
  thresholdMs: number = SYNC_STALENESS_THRESHOLD_MS,
): Promise<boolean> {
  const lastSync = await getProductLastSyncTime(productId);

  if (!lastSync) {
    // Product not found or never synced - consider it stale
    return true;
  }

  const now = new Date();
  const ageMs = now.getTime() - lastSync.getTime();

  return ageMs > thresholdMs;
}

/**
 * Check if the global product catalog sync is stale
 * @param thresholdMs - Optional custom threshold in milliseconds (defaults to SYNC_STALENESS_THRESHOLD_MS)
 * @returns true if catalog is stale or no products exist, false if fresh
 */
export async function isCatalogSyncStale(
  thresholdMs: number = SYNC_STALENESS_THRESHOLD_MS,
): Promise<boolean> {
  const lastSync = await getGlobalLastSyncTime();

  if (!lastSync) {
    // No products synced - consider catalog stale
    return true;
  }

  const now = new Date();
  const ageMs = now.getTime() - lastSync.getTime();

  return ageMs > thresholdMs;
}

/**
 * Get staleness information for a product
 * @param productId - Product ID (internal or Printify ID)
 * @param thresholdMs - Optional custom threshold in milliseconds (defaults to SYNC_STALENESS_THRESHOLD_MS)
 * @returns Object with staleness status and metadata
 */
export async function getProductSyncStatus(
  productId: string,
  thresholdMs: number = SYNC_STALENESS_THRESHOLD_MS,
): Promise<{
  isStale: boolean;
  lastSyncedAt: Date | null;
  ageMs: number | null;
  thresholdMs: number;
}> {
  const lastSync = await getProductLastSyncTime(productId);

  if (!lastSync) {
    return {
      isStale: true,
      lastSyncedAt: null,
      ageMs: null,
      thresholdMs,
    };
  }

  const now = new Date();
  const ageMs = now.getTime() - lastSync.getTime();

  return {
    isStale: ageMs > thresholdMs,
    lastSyncedAt: lastSync,
    ageMs,
    thresholdMs,
  };
}
