import type { Prisma } from '@prisma/client';
import { getMerchizeService, type MerchizeProduct, type MerchizeVariant } from '@/app/lib/merchize/service';
import { getPrintifyService } from '@/app/lib/printify/service';
import type { PrintifySyncResult } from '@/app/lib/printify/service';
import { db } from '@/lib/db';
import { syncPrintifyProducts } from '@/lib/catalog/printifySync';

type CatalogProvider = 'printify' | 'merchize';

export type ProviderCatalogSyncResult = {
  provider: CatalogProvider;
  ok: boolean;
  productCount: number;
  upserted: number;
  hidden: number;
  errors: string[];
  lastSync: string;
};

type ProviderCatalogDiagnostics = {
  provider: CatalogProvider;
  lastSyncAt: string | null;
  productCount: number;
  activeVariantCount: number;
  skippedVariantCount: number;
  lastError: string | null;
};

function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]').slice(0, 500);
}

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonValue;
}

function toCents(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

function stablePositiveInt(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index++) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) || 1;
}

function isActiveStatus(status: string | null | undefined): boolean {
  const normalized = (status ?? 'active').toLowerCase();
  return !['archived', 'deleted', 'disabled', 'inactive', 'unavailable', 'draft'].includes(normalized);
}

function merchizeIntegrationRef(productId: string): string {
  return `merchize:${productId}`;
}

function merchizeVariantOptionValues(product: MerchizeProduct, variant: MerchizeVariant) {
  return [
    {
      option: 'provider',
      value: 'merchize',
      providerProductId: product.id,
      providerVariantId: variant.id,
    },
  ];
}

async function writeSyncLog(input: {
  provider: CatalogProvider;
  status: 'success' | 'failed';
  productCount?: number;
  upserted?: number;
  hidden?: number;
  error?: string;
}) {
  await db.printifySyncLog.create({
    data: {
      syncType: `${input.provider}:catalog`,
      entityType: 'catalog',
      status: input.status,
      requestPayload: toPrismaJson({ provider: input.provider }),
      responsePayload: toPrismaJson({
        productCount: input.productCount ?? 0,
        upserted: input.upserted ?? 0,
        hidden: input.hidden ?? 0,
      }),
      errorMessage: input.error ?? null,
      finishedAt: new Date(),
    },
  }).catch(() => undefined);
}

async function syncMerchizeProduct(product: MerchizeProduct): Promise<string> {
  const defaultImage = product.images[0]?.url ?? null;
  const active = isActiveStatus(product.status);
  const variants = product.variants.length > 0
    ? product.variants
    : [
        {
          id: product.sku ?? product.id,
          title: product.title,
          sku: product.sku,
          status: product.status,
          currency: product.currency ?? 'USD',
          price: product.price,
          cost: null,
          imageUrl: defaultImage,
          raw: {},
        } satisfies MerchizeVariant,
      ];

  const upserted = await db.product.upsert({
    where: { integrationRef: merchizeIntegrationRef(product.id) },
    update: {
      name: product.title,
      description: product.description,
      primaryImageUrl: defaultImage,
      active,
      visible: active,
      category: 'merchize',
      integrationRef: merchizeIntegrationRef(product.id),
      specs: {
        provider: 'merchize',
        merchizeProductId: product.id,
        merchizeHandle: product.handle,
        merchizeSku: product.sku,
        merchizeStatus: product.status,
      },
      lastSyncedAt: new Date(),
    },
    create: {
      name: product.title,
      description: product.description,
      primaryImageUrl: defaultImage,
      active,
      visible: active,
      category: 'merchize',
      integrationRef: merchizeIntegrationRef(product.id),
      specs: {
        provider: 'merchize',
        merchizeProductId: product.id,
        merchizeHandle: product.handle,
        merchizeSku: product.sku,
        merchizeStatus: product.status,
      },
      lastSyncedAt: new Date(),
    },
  });

  await Promise.all(
    product.images.map((image, index) =>
      db.productImage.upsert({
        where: {
          productId_url: {
            productId: upserted.id,
            url: image.url,
          },
        },
        update: {
          position: index,
          isDefault: index === 0,
        },
        create: {
          productId: upserted.id,
          url: image.url,
          position: index,
          isDefault: index === 0,
          variantIds: [],
        },
      }),
    ),
  );

  const incomingVariantIds = new Set<number>();
  for (const variant of variants) {
    const syntheticVariantId = stablePositiveInt(`${product.id}:${variant.id}`);
    incomingVariantIds.add(syntheticVariantId);
    const variantActive = active && isActiveStatus(variant.status);
    const priceCents = toCents(variant.price ?? product.price);
    const costCents = toCents(variant.cost);

    await db.productVariant.upsert({
      where: {
        productId_printifyVariantId: {
          productId: upserted.id,
          printifyVariantId: syntheticVariantId,
        },
      },
      update: {
        previewImageUrl: variant.imageUrl ?? defaultImage,
        printProviderName: 'merchize',
        title: variant.title,
        sku: variant.sku ?? product.sku,
        priceCents,
        currency: (variant.currency ?? product.currency ?? 'USD').toUpperCase(),
        isEnabled: variantActive && priceCents != null,
        inStock: variantActive,
        optionValues: merchizeVariantOptionValues(product, variant),
        costCents,
        lastSyncedAt: new Date(),
      },
      create: {
        productId: upserted.id,
        previewImageUrl: variant.imageUrl ?? defaultImage,
        printifyVariantId: syntheticVariantId,
        printProviderName: 'merchize',
        title: variant.title,
        sku: variant.sku ?? product.sku,
        priceCents,
        currency: (variant.currency ?? product.currency ?? 'USD').toUpperCase(),
        isEnabled: variantActive && priceCents != null,
        inStock: variantActive,
        optionValues: merchizeVariantOptionValues(product, variant),
        costCents,
        lastSyncedAt: new Date(),
      },
    });
  }

  await db.productVariant.updateMany({
    where: {
      productId: upserted.id,
      printifyVariantId: { notIn: Array.from(incomingVariantIds) },
    },
    data: {
      isEnabled: false,
      inStock: false,
    },
  });

  return upserted.id;
}

export async function syncPrintifyCatalogFromProvider(): Promise<ProviderCatalogSyncResult> {
  try {
    const products = await getPrintifyService().getAllProducts();
    const result: PrintifySyncResult = await syncPrintifyProducts(products, { hideMissing: true });
    await writeSyncLog({
      provider: 'printify',
      status: result.errors.length > 0 ? 'failed' : 'success',
      productCount: result.count,
      upserted: result.upserted,
      hidden: result.hidden,
      error: result.errors[0] ? sanitizeError(result.errors[0]) : undefined,
    });

    return {
      provider: 'printify',
      ok: result.errors.length === 0,
      productCount: result.count,
      upserted: result.upserted,
      hidden: result.hidden,
      errors: result.errors.map((error) => sanitizeError(error)),
      lastSync: result.lastSync,
    };
  } catch (error) {
    const safeError = sanitizeError(error);
    await writeSyncLog({ provider: 'printify', status: 'failed', error: safeError });
    return {
      provider: 'printify',
      ok: false,
      productCount: 0,
      upserted: 0,
      hidden: 0,
      errors: [safeError],
      lastSync: new Date().toISOString(),
    };
  }
}

export async function syncMerchizeCatalogFromProvider(): Promise<ProviderCatalogSyncResult> {
  try {
    const products = await getMerchizeService().getAllProducts();
    const incomingRefs = new Set<string>();
    let upserted = 0;
    const errors: string[] = [];

    for (const product of products) {
      incomingRefs.add(merchizeIntegrationRef(product.id));
      try {
        await syncMerchizeProduct(product);
        upserted++;
      } catch (error) {
        errors.push(`Product ${product.id}: ${sanitizeError(error)}`);
      }
    }

    const existing = await db.product.findMany({
      where: { integrationRef: { startsWith: 'merchize:' } },
      select: { id: true, integrationRef: true },
    });
    const missingIds = existing
      .filter((product) => product.integrationRef && !incomingRefs.has(product.integrationRef))
      .map((product) => product.id);

    if (missingIds.length > 0) {
      await db.product.updateMany({
        where: { id: { in: missingIds } },
        data: { active: false, visible: false },
      });
      await db.productVariant.updateMany({
        where: { productId: { in: missingIds } },
        data: { isEnabled: false, inStock: false },
      });
    }

    await writeSyncLog({
      provider: 'merchize',
      status: errors.length > 0 ? 'failed' : 'success',
      productCount: products.length,
      upserted,
      hidden: missingIds.length,
      error: errors[0],
    });

    return {
      provider: 'merchize',
      ok: errors.length === 0,
      productCount: products.length,
      upserted,
      hidden: missingIds.length,
      errors,
      lastSync: new Date().toISOString(),
    };
  } catch (error) {
    const safeError = sanitizeError(error);
    await writeSyncLog({ provider: 'merchize', status: 'failed', error: safeError });
    return {
      provider: 'merchize',
      ok: false,
      productCount: 0,
      upserted: 0,
      hidden: 0,
      errors: [safeError],
      lastSync: new Date().toISOString(),
    };
  }
}

export async function getProviderCatalogDiagnostics(): Promise<ProviderCatalogDiagnostics[]> {
  const [printifyLastLog, merchizeLastLog, printifyProductCount, merchizeProductCount, printifyActiveVariantCount, merchizeActiveVariantCount, printifySkippedVariantCount, merchizeSkippedVariantCount] = await Promise.all([
    db.printifySyncLog.findFirst({
      where: { syncType: 'printify:catalog' },
      orderBy: { createdAt: 'desc' },
      select: { finishedAt: true, errorMessage: true },
    }),
    db.printifySyncLog.findFirst({
      where: { syncType: 'merchize:catalog' },
      orderBy: { createdAt: 'desc' },
      select: { finishedAt: true, errorMessage: true },
    }),
    db.product.count({ where: { printifyProductId: { not: null } } }),
    db.product.count({ where: { integrationRef: { startsWith: 'merchize:' } } }),
    db.productVariant.count({
      where: { isEnabled: true, inStock: true, Product: { printifyProductId: { not: null } } },
    }),
    db.productVariant.count({
      where: { isEnabled: true, inStock: true, Product: { integrationRef: { startsWith: 'merchize:' } } },
    }),
    db.productVariant.count({
      where: {
        OR: [{ isEnabled: false }, { inStock: false }],
        Product: { printifyProductId: { not: null } },
      },
    }),
    db.productVariant.count({
      where: {
        OR: [{ isEnabled: false }, { inStock: false }],
        Product: { integrationRef: { startsWith: 'merchize:' } },
      },
    }),
  ]);

  return [
    {
      provider: 'printify',
      lastSyncAt: printifyLastLog?.finishedAt?.toISOString() ?? null,
      productCount: printifyProductCount,
      activeVariantCount: printifyActiveVariantCount,
      skippedVariantCount: printifySkippedVariantCount,
      lastError: printifyLastLog?.errorMessage ? sanitizeError(printifyLastLog.errorMessage) : null,
    },
    {
      provider: 'merchize',
      lastSyncAt: merchizeLastLog?.finishedAt?.toISOString() ?? null,
      productCount: merchizeProductCount,
      activeVariantCount: merchizeActiveVariantCount,
      skippedVariantCount: merchizeSkippedVariantCount,
      lastError: merchizeLastLog?.errorMessage ? sanitizeError(merchizeLastLog.errorMessage) : null,
    },
  ];
}
