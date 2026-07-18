import { createHmac, createHash } from 'node:crypto';
import { db } from '@/app/lib/db';
import { getMerchizeService, type MerchizeProduct } from '@/app/lib/merchize/service';
import { env } from '@/env/server';
import { providerProductRef } from '@/lib/catalog/provider';

const PREFLIGHT_TTL_MS = 15 * 60 * 1000;
const MAX_PREFLIGHT_PRODUCTS = 50;
const MAX_PREFLIGHT_PRODUCT_DETAILS = 25;
const MAX_PREFLIGHT_VARIANTS_PER_PRODUCT = 20;

export type MerchizeImportIssue = {
  code: string;
  message: string;
  count?: number;
  providerProductId?: string;
};

export type MerchizeImportVariantPlan = {
  provider: 'merchize';
  providerVariantId: string | null;
  printifyVariantId: null;
  sku: string | null;
  title: string | null;
  price: number | null;
  currency: string | null;
  inStock: boolean | null;
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
  variants: MerchizeImportVariantPlan[];
  warnings: string[];
  issues: string[];
};

export type MerchizeImportPreflight = {
  provider: 'merchize';
  mode: 'import_preflight';
  productCount: number;
  normalizedProductCount: number;
  wouldInsert: number;
  wouldUpdate: number;
  wouldSkip: number;
  wouldBlock: number;
  safeToImport: boolean;
  preflightFingerprint: string;
  fingerprintExpiresAt: string;
  preflightSignature: string;
  issues: MerchizeImportIssue[];
  products: MerchizeImportProductPlan[];
};

type ExistingProduct = {
  id: string;
  integrationRef: string | null;
  printifyProductId: string | null;
};

type ExistingProviderVariant = {
  providerVariantId: string | null;
  Product: {
    integrationRef: string | null;
    printifyProductId: string | null;
  } | null;
};

export type MerchizeImportPreflightCounts = {
  productCount: number;
  wouldInsert: number;
  wouldUpdate: number;
  wouldSkip: number;
  wouldBlock: number;
};

type MerchizeImportPreflightOptions = {
  now?: Date;
};

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

function stableStringify(value: unknown): string {
  if (value == null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`;

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

function preflightSigningSecret(): string | null {
  return env.AUTH_SECRET || env.CLERK_SECRET_KEY || null;
}

export function signMerchizeImportPreflight(
  preflightFingerprint: string,
  fingerprintExpiresAt: string,
): string {
  const secret = preflightSigningSecret();
  if (!secret) return '';

  return createHmac('sha256', secret)
    .update(`merchize:hidden_local_import:${preflightFingerprint}:${fingerprintExpiresAt}`)
    .digest('hex')
    .slice(0, 64);
}

export function verifyMerchizeImportPreflightSignature(input: {
  preflightFingerprint: string;
  fingerprintExpiresAt: string;
  preflightSignature: string;
}): boolean {
  const expected = signMerchizeImportPreflight(
    input.preflightFingerprint,
    input.fingerprintExpiresAt,
  );

  return Boolean(expected) && input.preflightSignature === expected;
}

function isValidSku(value: string | null | undefined): boolean {
  if (value == null || value === '') return true;
  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    normalized.length <= 120 &&
    /^[A-Za-z0-9][A-Za-z0-9._:/#@+\-\s]*$/.test(normalized)
  );
}

function hasUnsupportedOptions(product: MerchizeProduct): boolean {
  return product.variants.some((variant) => {
    if (variant.options.length > 12) return true;

    const optionNames = new Set<string>();
    for (const option of variant.options) {
      const name = option.option.trim().toLowerCase();
      const value = option.value.trim();
      if (!name || !value || optionNames.has(name)) return true;
      optionNames.add(name);
    }

    return false;
  });
}

function hasInvalidVariantPrice(product: MerchizeProduct): boolean {
  return product.variants.some(
    (variant) =>
      typeof variant.price !== 'number' || !Number.isFinite(variant.price) || variant.price <= 0,
  );
}

function productIssues(
  product: MerchizeProduct,
  duplicateProductIds: Set<string>,
  duplicateVariantIds: Set<string>,
  printifyProductConflicts: Set<string>,
  printifyVariantConflicts: Set<string>,
): string[] {
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

  if (providerProductId && printifyProductConflicts.has(providerProductId)) {
    issues.add('provider_product_id_conflicts_with_printify');
  }

  const variantIds = product.variants
    .map((variant) => variant.providerVariantId?.trim() ?? '')
    .filter(Boolean);
  if (variantIds.some((id) => duplicateVariantIds.has(id))) {
    issues.add('duplicate_merchize_variant_ids');
  }

  if (variantIds.some((id) => printifyVariantConflicts.has(id))) {
    issues.add('provider_variant_id_conflicts_with_printify');
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

  if (product.variants.length > 0 && hasInvalidVariantPrice(product)) {
    issues.add('variant_invalid_price');
  }

  if (!isValidSku(product.sku) || product.variants.some((variant) => !isValidSku(variant.sku))) {
    issues.add('invalid_sku');
  }

  if (hasUnsupportedOptions(product)) {
    issues.add('unsupported_option_combination');
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
    case 'variant_invalid_price':
      return 'A Merchize variant has a missing, zero, negative, or malformed price.';
    case 'invalid_sku':
      return 'A Merchize product or variant has an invalid SKU.';
    case 'unsupported_option_combination':
      return 'A Merchize product has unsupported or ambiguous variant options.';
    case 'provider_product_id_conflicts_with_printify':
      return 'A Merchize provider product ID conflicts with an existing Printify-owned product.';
    case 'provider_variant_id_conflicts_with_printify':
      return 'A Merchize provider variant ID conflicts with an existing Printify-owned variant.';
    case 'provider_catalog_too_large':
      return 'Merchize import preflight is bounded to the first 50 products.';
    default:
      return 'A Merchize product is not ready for import planning.';
  }
}

export function fingerprintMerchizeImportPreflight(
  preflight: Omit<
    MerchizeImportPreflight,
    'preflightFingerprint' | 'fingerprintExpiresAt' | 'preflightSignature'
  >,
): string {
  const boundedProducts = preflight.products.map((product) => ({
    provider: product.provider,
    providerProductId: product.providerProductId,
    integrationRef: product.integrationRef,
    action: product.action,
    variantCount: product.variantCount,
    imageCount: product.imageCount,
    pricedVariantCount: product.pricedVariantCount,
    variants: product.variants.map((variant) => ({
      providerVariantId: variant.providerVariantId,
      sku: variant.sku,
      title: variant.title,
      price: variant.price,
      currency: variant.currency,
      inStock: variant.inStock,
      printifyVariantId: variant.printifyVariantId,
    })),
    issues: product.issues,
  }));

  return createHash('sha256')
    .update(
      stableStringify({
        provider: preflight.provider,
        mode: preflight.mode,
        productCount: preflight.productCount,
        normalizedProductCount: preflight.normalizedProductCount,
        wouldInsert: preflight.wouldInsert,
        wouldUpdate: preflight.wouldUpdate,
        wouldSkip: preflight.wouldSkip,
        wouldBlock: preflight.wouldBlock,
        safeToImport: preflight.safeToImport,
        issues: preflight.issues,
        products: boundedProducts,
      }),
    )
    .digest('hex')
    .slice(0, 64);
}

export function preflightCounts(preflight: MerchizeImportPreflight): MerchizeImportPreflightCounts {
  return {
    productCount: preflight.productCount,
    wouldInsert: preflight.wouldInsert,
    wouldUpdate: preflight.wouldUpdate,
    wouldSkip: preflight.wouldSkip,
    wouldBlock: preflight.wouldBlock,
  };
}

export function countsMatch(
  preflight: MerchizeImportPreflight,
  expected: MerchizeImportPreflightCounts,
): boolean {
  const actual = preflightCounts(preflight);
  return (
    actual.productCount === expected.productCount &&
    actual.wouldInsert === expected.wouldInsert &&
    actual.wouldUpdate === expected.wouldUpdate &&
    actual.wouldSkip === expected.wouldSkip &&
    actual.wouldBlock === expected.wouldBlock
  );
}

export async function buildMerchizeImportPreflightForProducts(
  products: MerchizeProduct[],
  options: MerchizeImportPreflightOptions = {},
): Promise<MerchizeImportPreflight> {
  const boundedProducts = products.slice(0, MAX_PREFLIGHT_PRODUCTS);
  const providerProductIds = boundedProducts.map((product) => product.providerProductId);
  const duplicateProductIds = duplicateValues(providerProductIds);
  const duplicateVariantIds = duplicateValues(
    boundedProducts.flatMap((product) =>
      product.variants.map((variant) => variant.providerVariantId ?? '').filter(Boolean),
    ),
  );
  const integrationRefs = providerProductIds
    .filter((id) => id && !id.startsWith('merchize-'))
    .map((id) => providerProductRef('merchize', id));

  const existingProducts = integrationRefs.length
    ? await db.product.findMany({
        where: { integrationRef: { in: integrationRefs } },
        select: { id: true, integrationRef: true, printifyProductId: true },
      })
    : [];
  const existingRefs = new Set(
    (existingProducts as ExistingProduct[])
      .map((product) => product.integrationRef)
      .filter((value): value is string => Boolean(value)),
  );
  const printifyProductConflicts = new Set(
    (
      await db.product.findMany({
        where: {
          printifyProductId: { in: providerProductIds.filter(Boolean) },
        },
        select: { printifyProductId: true },
      })
    )
      .map((product) => product.printifyProductId)
      .filter((value): value is string => Boolean(value)),
  );
  const incomingVariantIds = [
    ...new Set(
      boundedProducts.flatMap((product) =>
        product.variants.map((variant) => variant.providerVariantId ?? '').filter(Boolean),
      ),
    ),
  ];
  const existingProviderVariants = incomingVariantIds.length
    ? ((await db.productVariant.findMany({
        where: { providerVariantId: { in: incomingVariantIds } },
        select: {
          providerVariantId: true,
          Product: { select: { integrationRef: true, printifyProductId: true } },
        },
      })) as ExistingProviderVariant[])
    : [];
  const printifyVariantConflicts = new Set(
    existingProviderVariants
      .filter(
        (variant) =>
          variant.Product?.printifyProductId ||
          variant.Product?.integrationRef?.startsWith('printify:'),
      )
      .map((variant) => variant.providerVariantId)
      .filter((value): value is string => Boolean(value)),
  );

  const productPlans = boundedProducts.map((product): MerchizeImportProductPlan => {
    const integrationRef = providerProductRef('merchize', product.providerProductId);
    const issues = productIssues(
      product,
      duplicateProductIds,
      duplicateVariantIds,
      printifyProductConflicts,
      printifyVariantConflicts,
    );
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
      variants: product.variants.slice(0, MAX_PREFLIGHT_VARIANTS_PER_PRODUCT).map((variant) => ({
        provider: 'merchize',
        providerVariantId: variant.providerVariantId,
        printifyVariantId: null,
        sku: variant.sku,
        title: variant.title,
        price: variant.price,
        currency: variant.currency,
        inStock: variant.inStock,
      })),
      warnings: product.warnings,
      issues,
    };
  });

  const wouldBlock = productPlans.filter((product) => product.action === 'blocked').length;
  const wouldInsert = productPlans.filter((product) => product.action === 'inserted').length;
  const wouldUpdate = productPlans.filter((product) => product.action === 'updated').length;
  const wouldSkip = productPlans.filter((product) => product.action === 'skipped').length;
  const issues = summarizeIssues(productPlans);

  if (boundedProducts.length === 0) {
    issues.push({
      code: 'empty_provider_catalog',
      message: 'Merchize returned no catalog products.',
      count: 0,
    });
  }

  if (products.length > MAX_PREFLIGHT_PRODUCTS) {
    issues.push({
      code: 'provider_catalog_too_large',
      message: merchizeIssueMessage('provider_catalog_too_large'),
      count: products.length - MAX_PREFLIGHT_PRODUCTS,
    });
  }

  const withoutFingerprint: Omit<
    MerchizeImportPreflight,
    'preflightFingerprint' | 'fingerprintExpiresAt' | 'preflightSignature'
  > = {
    provider: 'merchize',
    mode: 'import_preflight',
    productCount: boundedProducts.length,
    normalizedProductCount: boundedProducts.length,
    wouldInsert,
    wouldUpdate,
    wouldSkip,
    wouldBlock,
    safeToImport: boundedProducts.length > 0 && wouldBlock === 0 && issues.length === 0,
    issues,
    products: productPlans.slice(0, MAX_PREFLIGHT_PRODUCT_DETAILS),
  };
  const preflightFingerprint = fingerprintMerchizeImportPreflight(withoutFingerprint);
  const fingerprintExpiresAt = new Date(
    (options.now ?? new Date()).getTime() + PREFLIGHT_TTL_MS,
  ).toISOString();

  return {
    ...withoutFingerprint,
    preflightFingerprint,
    fingerprintExpiresAt,
    preflightSignature: signMerchizeImportPreflight(preflightFingerprint, fingerprintExpiresAt),
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
