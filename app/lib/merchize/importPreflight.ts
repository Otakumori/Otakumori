import { db } from '@/app/lib/db';
import { getMerchizeService, type MerchizeProduct } from '@/app/lib/merchize/service';
import { providerProductRef } from '@/lib/catalog/provider';

export type MerchizeImportIssue = {
  code: string;
  message: string;
  count?: number;
  providerProductId?: string;
};

export type MerchizeImportProductPlan = {
  provider: 'merchize';
  providerProductId: string;
  integrationRef: string;
  title: string;
  action: 'inserted' | 'updated' | 'skipped' | 'blocked';
  public: false;
  purchasable: false;
  variantCount: number;
  imageCount: number;
  pricedVariantCount: number;
  warnings: string[];
  issues: string[];
};

export type MerchizeImportPreflight = {
  provider: 'merchize';
  mode: 'hidden_local_import_preflight';
  productCount: number;
  normalizedProductCount: number;
  wouldInsert: number;
  wouldUpdate: number;
  wouldSkip: number;
  wouldBlock: number;
  safeToImport: boolean;
  issues: MerchizeImportIssue[];
  products: MerchizeImportProductPlan[];
};

export type MerchizeImportApplyResult = {
  provider: 'merchize';
  mode: 'hidden_local_import';
  productCount: number;
  inserted: number;
  updated: number;
  skipped: number;
  blocked: number;
  products: MerchizeImportProductPlan[];
};

type ExistingProduct = {
  id: string;
  integrationRef: string | null;
};

function countDuplicates(values: string[]): number {
  const counts = new Map<string, number>();
  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  return [...counts.values()].filter((count) => count > 1).length;
}

function duplicateValues(values: string[]): Set<string> {
  const counts = new Map<string, number>();
  for (const value of values) {
    const normalized = value.trim();
    if (!normalized) continue;
    counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
  }
  return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([value]) => value));
}

function isSafeImageUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.includes('seller.merchize.com/login')) return false;
  if (normalized.includes('drive.google.com/drive/folders')) return false;
  if (normalized.includes('docs.google.com')) return false;
  return /^https?:\/\//i.test(value) && /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(normalized);
}

function productIssues(product: MerchizeProduct, duplicateProductIds: Set<string>): string[] {
  const issues = new Set<string>(product.importReadiness.issues);
  const providerProductId = product.providerProductId?.trim();

  if (!providerProductId || providerProductId.startsWith('merchize-')) {
    issues.add('product_missing_provider_id');
  }

  if (!product.title?.trim() || product.title.startsWith('Merchize Product ')) {
    issues.add('product_missing_title');
  }

  if (duplicateProductIds.has(providerProductId)) {
    issues.add('duplicate_merchize_product_ids');
  }

  const variantIds = product.variants
    .map((variant) => variant.providerVariantId?.trim() ?? '')
    .filter(Boolean);
  const duplicateVariantCount = countDuplicates(variantIds);
  if (duplicateVariantCount > 0) {
    issues.add('duplicate_merchize_variant_ids');
  }

  if (product.variants.length === 0) {
    issues.add('product_missing_variants');
  }

  if (product.variants.some((variant) => !variant.providerVariantId?.trim())) {
    issues.add('variants_missing_provider_ids');
  }

  if (!product.images.some((image) => isSafeImageUrl(image.url))) {
    issues.add('product_missing_images');
  }

  if (!product.variants.some((variant) => typeof variant.price === 'number' && variant.price > 0)) {
    issues.add('product_missing_price');
  }

  return [...issues];
}

function summarizeIssues(products: MerchizeImportProductPlan[]): MerchizeImportIssue[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    for (const issue of product.issues) {
      counts.set(issue, (counts.get(issue) ?? 0) + 1);
    }
  }

  return [...counts.entries()].map(([code, count]) => ({
    code,
    message: merchizeIssueMessage(code),
    count,
  }));
}

function merchizeIssueMessage(code: string): string {
  switch (code) {
    case 'product_missing_provider_id':
      return 'A Merchize product is missing a stable provider product ID.';
    case 'product_missing_title':
      return 'A Merchize product is missing a title.';
    case 'duplicate_merchize_product_ids':
      return 'Merchize returned duplicate provider product IDs.';
    case 'duplicate_merchize_variant_ids':
      return 'A Merchize product contains duplicate provider variant IDs.';
    case 'product_missing_variants':
      return 'A Merchize product has no variants.';
    case 'variants_missing_provider_ids':
      return 'A Merchize product has variants without stable provider variant IDs.';
    case 'product_missing_images':
      return 'A Merchize product has no usable product image.';
    case 'product_missing_price':
      return 'A Merchize product has no positively priced variant.';
    default:
      return 'A Merchize product is not ready for hidden local import.';
  }
}

async function buildMerchizeImportPreflightForProducts(
  products: MerchizeProduct[],
): Promise<MerchizeImportPreflight> {
  const providerProductIds = products.map((product) => product.providerProductId);
  const duplicateProductIds = duplicateValues(providerProductIds);
  const integrationRefs = providerProductIds
    .filter((id) => id && !id.startsWith('merchize-'))
    .map((id) => providerProductRef('merchize', id));

  const existingProducts = integrationRefs.length
    ? await db.product.findMany({
        where: { integrationRef: { in: integrationRefs } },
        select: { id: true, integrationRef: true },
      })
    : [];
  const existingRefs = new Set(
    (existingProducts as ExistingProduct[])
      .map((product) => product.integrationRef)
      .filter((value): value is string => Boolean(value)),
  );

  const productPlans = products.map((product): MerchizeImportProductPlan => {
    const integrationRef = providerProductRef('merchize', product.providerProductId);
    const issues = productIssues(product, duplicateProductIds);
    const blocked = issues.length > 0;
    const exists = existingRefs.has(integrationRef);

    return {
      provider: 'merchize',
      providerProductId: product.providerProductId,
      integrationRef,
      title: product.title,
      action: blocked ? 'blocked' : exists ? 'updated' : 'inserted',
      public: false,
      purchasable: false,
      variantCount: product.variantCount,
      imageCount: product.imageCount,
      pricedVariantCount: product.pricedVariantCount,
      warnings: product.warnings,
      issues,
    };
  });

  const wouldBlock = productPlans.filter((product) => product.action === 'blocked').length;
  const wouldInsert = productPlans.filter((product) => product.action === 'inserted').length;
  const wouldUpdate = productPlans.filter((product) => product.action === 'updated').length;
  const wouldSkip = productPlans.filter((product) => product.action === 'skipped').length;
  const issues = summarizeIssues(productPlans);

  if (products.length === 0) {
    issues.push({
      code: 'empty_provider_catalog',
      message: 'Merchize returned no catalog products.',
      count: 0,
    });
  }

  return {
    provider: 'merchize',
    mode: 'hidden_local_import_preflight',
    productCount: products.length,
    normalizedProductCount: products.length,
    wouldInsert,
    wouldUpdate,
    wouldSkip,
    wouldBlock,
    safeToImport: products.length > 0 && wouldBlock === 0 && issues.length === 0,
    issues,
    products: productPlans,
  };
}

export async function loadMerchizeImportPlan(): Promise<{
  preflight: MerchizeImportPreflight;
  products: MerchizeProduct[];
}> {
  const products = await getMerchizeService().getProducts({ limit: 50, page: 1 });
  return {
    preflight: await buildMerchizeImportPreflightForProducts(products),
    products,
  };
}

export async function buildMerchizeImportPreflight(): Promise<MerchizeImportPreflight> {
  return (await loadMerchizeImportPlan()).preflight;
}

function toCents(price: number | null): number | null {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  return Math.round(price * 100);
}

export async function applyMerchizeHiddenLocalImport(
  preflight: MerchizeImportPreflight,
  products: MerchizeProduct[],
): Promise<MerchizeImportApplyResult> {
  if (!preflight.safeToImport) {
    return {
      provider: 'merchize',
      mode: 'hidden_local_import',
      productCount: preflight.productCount,
      inserted: 0,
      updated: 0,
      skipped: preflight.wouldSkip,
      blocked: preflight.wouldBlock,
      products: preflight.products,
    };
  }

  const planByRef = new Map(preflight.products.map((product) => [product.integrationRef, product]));
  const results: MerchizeImportProductPlan[] = [];
  const now = new Date();

  for (const product of products) {
    const integrationRef = providerProductRef('merchize', product.providerProductId);
    const plan = planByRef.get(integrationRef);
    if (!plan || plan.action === 'blocked') {
      if (plan) results.push({ ...plan, action: 'skipped' });
      continue;
    }

    const safeImages = product.images.filter((image) => isSafeImageUrl(image.url)).slice(0, 12);
    const primaryImageUrl = safeImages[0]?.url ?? null;
    const incomingVariantIds = product.variants
      .map((variant) => variant.providerVariantId?.trim() ?? '')
      .filter(Boolean);

    await db.$transaction(async (tx) => {
      const localProduct = await tx.product.upsert({
        where: { integrationRef },
        create: {
          name: product.title,
          description: product.description,
          primaryImageUrl,
          printifyProductId: null,
          integrationRef,
          active: false,
          visible: false,
          category: 'Merchize',
          categorySlug: 'merchize',
          tags: ['merchize'],
          specs: {
            provider: 'merchize',
            providerProductId: product.providerProductId,
            status: product.status,
            sku: product.sku,
            importMode: 'hidden_local_import',
            public: false,
            purchasable: false,
          },
          lastSyncedAt: now,
        },
        update: {
          name: product.title,
          description: product.description,
          primaryImageUrl,
          printifyProductId: null,
          active: false,
          visible: false,
          category: 'Merchize',
          categorySlug: 'merchize',
          tags: ['merchize'],
          specs: {
            provider: 'merchize',
            providerProductId: product.providerProductId,
            status: product.status,
            sku: product.sku,
            importMode: 'hidden_local_import',
            public: false,
            purchasable: false,
          },
          lastSyncedAt: now,
        },
      });

      for (const variant of product.variants) {
        const providerVariantId = variant.providerVariantId?.trim();
        if (!providerVariantId) continue;

        await tx.productVariant.upsert({
          where: {
            productId_providerVariantId: {
              productId: localProduct.id,
              providerVariantId,
            },
          },
          create: {
            productId: localProduct.id,
            providerVariantId,
            printifyVariantId: null,
            printProviderName: 'merchize',
            title: variant.title,
            sku: variant.sku,
            priceCents: toCents(variant.price),
            currency: variant.currency ?? product.currency ?? 'USD',
            isEnabled: false,
            inStock: false,
            isDefaultVariant: false,
            optionValues: variant.options,
            previewImageUrl: primaryImageUrl,
            lastSyncedAt: now,
          },
          update: {
            printifyVariantId: null,
            printProviderName: 'merchize',
            title: variant.title,
            sku: variant.sku,
            priceCents: toCents(variant.price),
            currency: variant.currency ?? product.currency ?? 'USD',
            isEnabled: false,
            inStock: false,
            optionValues: variant.options,
            previewImageUrl: primaryImageUrl,
            lastSyncedAt: now,
          },
        });
      }

      if (incomingVariantIds.length > 0) {
        await tx.productVariant.updateMany({
          where: {
            productId: localProduct.id,
            providerVariantId: { notIn: incomingVariantIds },
          },
          data: {
            isEnabled: false,
            inStock: false,
            lastSyncedAt: now,
          },
        });
      }

      for (const [index, image] of safeImages.entries()) {
        await tx.productImage.upsert({
          where: {
            productId_url: {
              productId: localProduct.id,
              url: image.url,
            },
          },
          create: {
            productId: localProduct.id,
            url: image.url,
            position: index,
            variantIds: [],
            isDefault: index === 0,
          },
          update: {
            position: index,
            variantIds: [],
            isDefault: index === 0,
          },
        });
      }
    });

    results.push(plan);
  }

  return {
    provider: 'merchize',
    mode: 'hidden_local_import',
    productCount: preflight.productCount,
    inserted: results.filter((product) => product.action === 'inserted').length,
    updated: results.filter((product) => product.action === 'updated').length,
    skipped: results.filter((product) => product.action === 'skipped').length,
    blocked: preflight.wouldBlock,
    products: results,
  };
}
