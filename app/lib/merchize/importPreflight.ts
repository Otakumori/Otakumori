import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { db } from '@/app/lib/db';
import { getMerchizeService, type MerchizeProduct } from '@/app/lib/merchize/service';
import { env } from '@/env/server';
import { providerProductRef } from '@/lib/catalog/provider';

export const MERCHIZE_HIDDEN_IMPORT_MANIFEST_VERSION = 'merchize-hidden-local-import-v1';
export const MERCHIZE_HIDDEN_IMPORT_PROVIDER = 'merchize';
export const MERCHIZE_HIDDEN_IMPORT_MODE = 'hidden_local_import';

const PREFLIGHT_TTL_MS = 15 * 60 * 1000;
const MAX_PROVIDER_PRODUCTS = 50;
const MAX_PUBLIC_PRODUCT_DETAILS = 25;
const MAX_PUBLIC_VARIANTS_PER_PRODUCT = 20;
const MAX_VARIANTS_PER_PRODUCT = 100;
const MAX_IMAGES_PER_PRODUCT = 40;
const MAX_OPTIONS_PER_VARIANT = 12;
const MAX_PRODUCT_OPTIONS = 120;
const MAX_TITLE_LENGTH = 240;
const MAX_DESCRIPTION_LENGTH = 4000;
const MAX_SKU_LENGTH = 120;
const MAX_HANDLE_LENGTH = 200;
const MAX_STATUS_LENGTH = 80;
const MAX_CURRENCY_LENGTH = 8;
const MAX_PROVIDER_ID_LENGTH = 200;
const MAX_OPTION_FIELD_LENGTH = 80;
const MAX_IMAGE_URL_LENGTH = 2000;

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
  priceCents: number | null;
  currency: string | null;
  inStock: boolean | null;
  enabled: false;
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
  manifestVersion: typeof MERCHIZE_HIDDEN_IMPORT_MANIFEST_VERSION;
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

export type MerchizeImportPreflightCounts = {
  productCount: number;
  wouldInsert: number;
  wouldUpdate: number;
  wouldSkip: number;
  wouldBlock: number;
};

export type CanonicalMerchizeOption = {
  option: string;
  value: string;
};

export type CanonicalMerchizeImage = {
  url: string;
  position: number;
  isDefault: boolean;
};

export type CanonicalMerchizeVariant = {
  provider: 'merchize';
  providerVariantId: string;
  title: string | null;
  sku: string | null;
  optionValues: CanonicalMerchizeOption[];
  price: number;
  priceCents: number;
  currency: string;
  inStock: boolean;
  enabled: false;
  printProviderName: 'merchize';
  printifyVariantId: null;
  isDefaultVariant: boolean;
  previewImageUrl: string | null;
};

export type CanonicalMerchizeProduct = {
  provider: 'merchize';
  providerProductId: string;
  integrationRef: string;
  action: 'inserted' | 'updated' | 'skipped' | 'blocked';
  title: string;
  description: string | null;
  sku: string | null;
  handle: string | null;
  status: string | null;
  currency: string;
  images: CanonicalMerchizeImage[];
  imageUrls: string[];
  incomingImageUrlSet: string[];
  primaryImageUrl: string | null;
  options: CanonicalMerchizeOption[];
  specs: {
    provider: 'merchize';
    providerProductId: string;
    status: string | null;
    handle: string | null;
    importMode: 'hidden_local_import';
  };
  variants: CanonicalMerchizeVariant[];
  incomingProviderVariantIdSet: string[];
  staleVariantOwnership: {
    productIdMatchesImportedProduct: true;
    providerVariantIdNotInIncomingSet: true;
    printProviderNameMerchize: true;
    printifyVariantIdNull: true;
  };
  variantCount: number;
  imageCount: number;
  pricedVariantCount: number;
  issues: string[];
  warnings: string[];
};

export type MerchizeHiddenImportManifest = {
  version: typeof MERCHIZE_HIDDEN_IMPORT_MANIFEST_VERSION;
  provider: 'merchize';
  mode: 'hidden_local_import';
  productCount: number;
  normalizedProductCount: number;
  wouldInsert: number;
  wouldUpdate: number;
  wouldSkip: number;
  wouldBlock: number;
  safeToImport: boolean;
  issues: MerchizeImportIssue[];
  products: CanonicalMerchizeProduct[];
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

type MerchizeImportPreflightOptions = {
  now?: Date;
};

type ImageValidationResult = {
  images: CanonicalMerchizeImage[];
  unsafeCount: number;
  duplicateCount: number;
};

export class MerchizeImportPreflightSigningError extends Error {
  constructor(message = 'Merchize import preflight signing secret is not configured.') {
    super(message);
    this.name = 'MerchizeImportPreflightSigningError';
  }
}

function coerceText(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

function coerceRequiredText(value: string | null | undefined): string {
  return coerceText(value) ?? '';
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

function stableStringify(value: unknown): string {
  if (value == null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`;

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(',')}}`;
}

function preflightSigningSecret(): string {
  const secret = env.AUTH_SECRET || env.CLERK_SECRET_KEY;
  if (!secret?.trim()) {
    throw new MerchizeImportPreflightSigningError();
  }
  return secret;
}

function hmacPayload(input: {
  manifestVersion: string;
  provider: string;
  mode: string;
  preflightFingerprint: string;
  fingerprintExpiresAt: string;
}): string {
  return stableStringify(input);
}

function isHexSha256(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}

export function signMerchizeImportPreflight(input: {
  manifestVersion: string;
  provider: string;
  mode: string;
  preflightFingerprint: string;
  fingerprintExpiresAt: string;
}): string {
  return createHmac('sha256', preflightSigningSecret())
    .update(
      hmacPayload({
        manifestVersion: input.manifestVersion,
        provider: input.provider,
        mode: input.mode,
        preflightFingerprint: input.preflightFingerprint,
        fingerprintExpiresAt: input.fingerprintExpiresAt,
      }),
    )
    .digest('hex');
}

export function verifyMerchizeImportPreflightSignature(input: {
  manifestVersion: string;
  provider: string;
  mode: string;
  preflightFingerprint: string;
  fingerprintExpiresAt: string;
  preflightSignature: string;
}): boolean {
  if (!isHexSha256(input.preflightFingerprint) || !isHexSha256(input.preflightSignature)) {
    return false;
  }

  let expected: string;
  try {
    expected = signMerchizeImportPreflight(input);
  } catch {
    return false;
  }

  const expectedBuffer = Buffer.from(expected, 'hex');
  const actualBuffer = Buffer.from(input.preflightSignature, 'hex');
  if (expectedBuffer.length !== actualBuffer.length || expectedBuffer.length !== 32) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}

function priceToCents(price: number | null): number | null {
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  return Math.round(price * 100);
}

function isValidSku(value: string | null | undefined): boolean {
  if (value == null || value === '') return true;
  const normalized = value.trim();
  return (
    normalized.length > 0 &&
    normalized.length <= MAX_SKU_LENGTH &&
    /^[A-Za-z0-9][A-Za-z0-9._:/#@+\-\s]*$/.test(normalized)
  );
}

function canonicalizeOptions(options: Array<{ option: string; value: string }>): {
  options: CanonicalMerchizeOption[];
  invalid: boolean;
  tooMany: boolean;
  fieldLengthExceeded: boolean;
} {
  if (options.length > MAX_OPTIONS_PER_VARIANT) {
    return { options: [], invalid: true, tooMany: true, fieldLengthExceeded: false };
  }

  const seen = new Set<string>();
  const normalized: CanonicalMerchizeOption[] = [];
  for (const option of options) {
    const name = coerceRequiredText(option.option);
    const value = coerceRequiredText(option.value);
    const fieldLengthExceeded =
      hasInvalidLength(name, MAX_OPTION_FIELD_LENGTH) ||
      hasInvalidLength(value, MAX_OPTION_FIELD_LENGTH);
    const key = name.toLowerCase();
    if (!name || !value || fieldLengthExceeded || seen.has(key)) {
      return { options: [], invalid: true, tooMany: false, fieldLengthExceeded };
    }
    seen.add(key);
    normalized.push({ option: name, value });
  }

  return {
    options: normalized.sort((a, b) => {
      const optionCompare = a.option.localeCompare(b.option);
      return optionCompare === 0 ? a.value.localeCompare(b.value) : optionCompare;
    }),
    invalid: false,
    tooMany: false,
    fieldLengthExceeded: false,
  };
}

export function canonicalizeMerchizeImageUrls(
  images: Array<{ url: string | null | undefined }>,
): ImageValidationResult {
  const seen = new Set<string>();
  const urls: string[] = [];
  let unsafeCount = 0;
  let duplicateCount = 0;

  for (const image of images) {
    const raw = image.url?.trim();
    if (!raw) continue;

    if (raw.length > MAX_IMAGE_URL_LENGTH) {
      unsafeCount += 1;
      continue;
    }

    let parsed: URL;
    try {
      parsed = new URL(raw);
    } catch {
      unsafeCount += 1;
      continue;
    }

    if (
      parsed.protocol !== 'https:' ||
      !parsed.hostname ||
      parsed.username ||
      parsed.password ||
      parsed.toString().length > MAX_IMAGE_URL_LENGTH
    ) {
      unsafeCount += 1;
      continue;
    }

    const canonical = parsed.toString();
    if (seen.has(canonical)) {
      duplicateCount += 1;
      continue;
    }
    seen.add(canonical);
    urls.push(canonical);
  }

  return {
    images: urls.map((url, position) => ({ url, position, isDefault: position === 0 })),
    unsafeCount,
    duplicateCount,
  };
}

function hasInvalidLength(value: string | null | undefined, maxLength: number): boolean {
  const normalized = coerceText(value);
  return Boolean(normalized && normalized.length > maxLength);
}

function variantIdentitySource(variant: Record<string, unknown>): string | null {
  const source = variant.providerVariantIdSource;
  return typeof source === 'string' ? source : null;
}

function productIdentitySource(product: Record<string, unknown>): string | null {
  const source = product.providerProductIdSource;
  return typeof source === 'string' ? source : null;
}

function merchizeIssueMessage(code: string): string {
  switch (code) {
    case 'product_missing_provider_id':
      return 'A Merchize product is missing a stable provider product ID.';
    case 'product_provider_id_not_stable':
      return 'A Merchize product identity is synthesized or SKU-derived and cannot be imported.';
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
    case 'variant_id_not_stable':
      return 'A Merchize variant identity is SKU-derived and cannot be imported.';
    case 'product_missing_images':
      return 'A Merchize product has no usable product image.';
    case 'product_unsafe_image_url':
      return 'A Merchize product contains an unsafe or unsupported image URL.';
    case 'product_missing_price':
      return 'A Merchize product has no positively priced variant.';
    case 'variant_invalid_price':
      return 'A Merchize variant has a missing, zero, negative, or malformed price.';
    case 'invalid_sku':
      return 'A Merchize product or variant has an invalid SKU.';
    case 'unsupported_option_combination':
      return 'A Merchize product has unsupported or ambiguous variant options.';
    case 'product_too_many_options':
      return 'A Merchize product has more option values than the hidden import limit.';
    case 'provider_product_id_conflicts_with_printify':
      return 'A Merchize provider product ID conflicts with an existing Printify-owned product.';
    case 'provider_product_ownership_conflict':
      return 'An existing product with this Merchize integration reference has conflicting provider ownership.';
    case 'provider_variant_id_conflicts_with_printify':
      return 'A Merchize provider variant ID conflicts with an existing Printify-owned variant.';
    case 'provider_catalog_too_large':
      return 'Merchize import requires a complete catalog of 50 products or fewer.';
    case 'product_too_many_variants':
      return 'A Merchize product has more variants than the hidden import limit.';
    case 'product_too_many_images':
      return 'A Merchize product has more images than the hidden import limit.';
    case 'field_length_exceeded':
      return 'A Merchize product contains a field longer than the hidden import limit.';
    default:
      return 'A Merchize product is not ready for import planning.';
  }
}

function summarizeIssues(products: CanonicalMerchizeProduct[]): MerchizeImportIssue[] {
  const counts = new Map<string, number>();
  for (const product of products) {
    for (const issue of product.issues) {
      counts.set(issue, (counts.get(issue) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, count]) => ({
      code,
      message: merchizeIssueMessage(code),
      count,
    }));
}

function addIssue(issues: Set<string>, condition: boolean, code: string) {
  if (condition) issues.add(code);
}

function buildCanonicalVariant(
  variant: MerchizeProduct['variants'][number],
  primaryImageUrl: string | null,
  index: number,
  duplicateVariantIds: Set<string>,
  printifyVariantConflicts: Set<string>,
): { variant: CanonicalMerchizeVariant | null; issues: string[] } {
  const issues = new Set<string>();
  const providerVariantId = coerceText(variant.providerVariantId);
  const sku = coerceText(variant.sku);
  const title = coerceText(variant.title);
  const currency = coerceText(variant.currency) ?? 'USD';
  const priceCents = priceToCents(variant.price);
  const optionResult = canonicalizeOptions(variant.options);
  const source = variantIdentitySource(variant as unknown as Record<string, unknown>);
  const fieldLengthExceeded =
    hasInvalidLength(providerVariantId, MAX_PROVIDER_ID_LENGTH) ||
    hasInvalidLength(sku, MAX_SKU_LENGTH) ||
    hasInvalidLength(title, MAX_TITLE_LENGTH) ||
    hasInvalidLength(currency, MAX_CURRENCY_LENGTH) ||
    optionResult.fieldLengthExceeded;

  addIssue(issues, !providerVariantId, 'variants_missing_provider_ids');
  addIssue(issues, fieldLengthExceeded, 'field_length_exceeded');
  addIssue(issues, source === 'sku_fallback' || source === 'missing', 'variant_id_not_stable');
  addIssue(
    issues,
    Boolean(providerVariantId && duplicateVariantIds.has(providerVariantId)),
    'duplicate_merchize_variant_ids',
  );
  addIssue(
    issues,
    Boolean(providerVariantId && printifyVariantConflicts.has(providerVariantId)),
    'provider_variant_id_conflicts_with_printify',
  );
  addIssue(issues, priceCents == null, 'variant_invalid_price');
  addIssue(issues, !isValidSku(sku), 'invalid_sku');
  addIssue(issues, optionResult.invalid, 'unsupported_option_combination');

  if (!providerVariantId || fieldLengthExceeded || priceCents == null || optionResult.invalid) {
    return { variant: null, issues: [...issues] };
  }

  return {
    variant: {
      provider: 'merchize',
      providerVariantId,
      title,
      sku,
      optionValues: optionResult.options,
      price: variant.price as number,
      priceCents,
      currency,
      inStock: variant.inStock === true,
      enabled: false,
      printProviderName: 'merchize',
      printifyVariantId: null,
      isDefaultVariant: index === 0,
      previewImageUrl: primaryImageUrl,
    },
    issues: [...issues],
  };
}

function canonicalProductOptions(variants: CanonicalMerchizeVariant[]): {
  options: CanonicalMerchizeOption[];
  tooMany: boolean;
} {
  const seen = new Set<string>();
  const options: CanonicalMerchizeOption[] = [];

  for (const variant of variants) {
    for (const option of variant.optionValues) {
      const key = `${option.option.toLowerCase()}:${option.value.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      options.push(option);
    }
  }

  const sorted = options.sort((a, b) => {
    const optionCompare = a.option.localeCompare(b.option);
    return optionCompare === 0 ? a.value.localeCompare(b.value) : optionCompare;
  });

  return {
    options: sorted.length > MAX_PRODUCT_OPTIONS ? [] : sorted,
    tooMany: sorted.length > MAX_PRODUCT_OPTIONS,
  };
}

function canonicalizeProduct(input: {
  product: MerchizeProduct;
  duplicateProductIds: Set<string>;
  printifyProductConflicts: Set<string>;
  printifyVariantConflicts: Set<string>;
  existingProductsByRef: Map<string, ExistingProduct>;
}): CanonicalMerchizeProduct {
  const {
    product,
    duplicateProductIds,
    printifyProductConflicts,
    printifyVariantConflicts,
    existingProductsByRef,
  } = input;
  const issues = new Set<string>(product.importReadiness.issues);
  const providerProductId = coerceRequiredText(product.providerProductId);
  const providerProductIdTooLong = hasInvalidLength(providerProductId, MAX_PROVIDER_ID_LENGTH);
  const integrationRef =
    providerProductId && !providerProductIdTooLong && !providerProductId.startsWith('merchize-')
      ? providerProductRef('merchize', providerProductId)
      : '';
  const imageResult = canonicalizeMerchizeImageUrls(product.images);
  const primaryImageUrl = imageResult.images[0]?.url ?? null;
  const duplicateVariantIds = duplicateValues(
    product.variants.map((variant) => variant.providerVariantId ?? '').filter(Boolean),
  );
  const title = coerceRequiredText(product.title);
  const description = coerceText(product.description);
  const sku = coerceText(product.sku);
  const handle = coerceText(product.handle);
  const status = coerceText(product.status);
  const currency = coerceText(product.currency) ?? coerceText(product.priceRange.currency) ?? 'USD';
  const productSource = productIdentitySource(product as unknown as Record<string, unknown>);
  const existingProduct = integrationRef ? existingProductsByRef.get(integrationRef) : null;
  const existingProductOwnershipConflict = Boolean(existingProduct?.printifyProductId);

  addIssue(
    issues,
    !providerProductId || providerProductId.startsWith('merchize-'),
    'product_missing_provider_id',
  );
  addIssue(
    issues,
    productSource === 'sku_fallback' || productSource === 'generated',
    'product_provider_id_not_stable',
  );
  addIssue(
    issues,
    !title || product.title.startsWith('Merchize Product '),
    'product_missing_title',
  );
  addIssue(issues, duplicateProductIds.has(providerProductId), 'duplicate_merchize_product_ids');
  addIssue(
    issues,
    printifyProductConflicts.has(providerProductId),
    'provider_product_id_conflicts_with_printify',
  );
  addIssue(issues, existingProductOwnershipConflict, 'provider_product_ownership_conflict');
  addIssue(issues, product.variants.length === 0, 'product_missing_variants');
  addIssue(issues, product.variants.length > MAX_VARIANTS_PER_PRODUCT, 'product_too_many_variants');
  addIssue(issues, product.images.length > MAX_IMAGES_PER_PRODUCT, 'product_too_many_images');
  addIssue(issues, imageResult.images.length === 0, 'product_missing_images');
  addIssue(issues, imageResult.unsafeCount > 0, 'product_unsafe_image_url');
  addIssue(issues, !isValidSku(sku), 'invalid_sku');
  addIssue(
    issues,
    hasInvalidLength(product.providerProductId, MAX_PROVIDER_ID_LENGTH) ||
      hasInvalidLength(product.title, MAX_TITLE_LENGTH) ||
      hasInvalidLength(product.description, MAX_DESCRIPTION_LENGTH) ||
      hasInvalidLength(product.sku, MAX_SKU_LENGTH) ||
      hasInvalidLength(product.handle, MAX_HANDLE_LENGTH) ||
      hasInvalidLength(product.status, MAX_STATUS_LENGTH) ||
      hasInvalidLength(product.currency, MAX_CURRENCY_LENGTH) ||
      hasInvalidLength(product.priceRange.currency, MAX_CURRENCY_LENGTH),
    'field_length_exceeded',
  );

  const variants: CanonicalMerchizeVariant[] = [];
  for (const [index, variant] of product.variants.entries()) {
    const result = buildCanonicalVariant(
      variant,
      primaryImageUrl,
      index,
      duplicateVariantIds,
      printifyVariantConflicts,
    );
    result.issues.forEach((issue) => issues.add(issue));
    if (result.variant) variants.push(result.variant);
  }

  addIssue(issues, variants.length === 0, 'product_missing_variants');
  addIssue(
    issues,
    variants.every((variant) => variant.priceCents <= 0),
    'product_missing_price',
  );
  const productOptionResult = canonicalProductOptions(variants);
  addIssue(issues, productOptionResult.tooMany, 'product_too_many_options');

  const blocked = issues.size > 0;
  const exists = Boolean(existingProduct && !existingProductOwnershipConflict);
  const action: CanonicalMerchizeProduct['action'] = blocked
    ? 'blocked'
    : exists
      ? 'updated'
      : 'inserted';

  return {
    provider: 'merchize',
    providerProductId,
    integrationRef,
    action,
    title,
    description,
    sku,
    handle,
    status,
    currency,
    images: imageResult.images,
    imageUrls: imageResult.images.map((image) => image.url),
    incomingImageUrlSet: imageResult.images.map((image) => image.url),
    primaryImageUrl,
    options: productOptionResult.options,
    specs: {
      provider: 'merchize',
      providerProductId,
      status,
      handle,
      importMode: 'hidden_local_import',
    },
    variants,
    incomingProviderVariantIdSet: variants.map((variant) => variant.providerVariantId).sort(),
    staleVariantOwnership: {
      productIdMatchesImportedProduct: true,
      providerVariantIdNotInIncomingSet: true,
      printProviderNameMerchize: true,
      printifyVariantIdNull: true,
    },
    variantCount: variants.length,
    imageCount: imageResult.images.length,
    pricedVariantCount: variants.filter((variant) => variant.priceCents > 0).length,
    issues: [...issues].sort(),
    warnings: [
      ...new Set([
        ...product.warnings,
        ...(imageResult.duplicateCount > 0 ? ['duplicate_images_removed'] : []),
      ]),
    ].sort(),
  };
}

export function fingerprintMerchizeImportManifest(manifest: MerchizeHiddenImportManifest): string {
  return createHash('sha256').update(stableStringify(manifest)).digest('hex');
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

function publicProductPlan(product: CanonicalMerchizeProduct): MerchizeImportProductPlan {
  return {
    provider: 'merchize',
    providerProductId: product.providerProductId,
    integrationRef: product.integrationRef,
    title: product.title,
    action: product.action,
    public: false,
    purchasable: false,
    variantCount: product.variantCount,
    imageCount: product.imageCount,
    pricedVariantCount: product.pricedVariantCount,
    variants: product.variants.slice(0, MAX_PUBLIC_VARIANTS_PER_PRODUCT).map((variant) => ({
      provider: 'merchize',
      providerVariantId: variant.providerVariantId,
      printifyVariantId: null,
      sku: variant.sku,
      title: variant.title,
      price: variant.price,
      priceCents: variant.priceCents,
      currency: variant.currency,
      inStock: variant.inStock,
      enabled: false,
    })),
    warnings: product.warnings,
    issues: product.issues,
  };
}

function preflightFromManifest(
  manifest: MerchizeHiddenImportManifest,
  options: MerchizeImportPreflightOptions,
): MerchizeImportPreflight {
  const preflightFingerprint = fingerprintMerchizeImportManifest(manifest);
  const fingerprintExpiresAt = new Date(
    (options.now ?? new Date()).getTime() + PREFLIGHT_TTL_MS,
  ).toISOString();
  const preflightSignature = signMerchizeImportPreflight({
    manifestVersion: manifest.version,
    provider: manifest.provider,
    mode: manifest.mode,
    preflightFingerprint,
    fingerprintExpiresAt,
  });

  return {
    provider: 'merchize',
    mode: 'import_preflight',
    manifestVersion: manifest.version,
    productCount: manifest.productCount,
    normalizedProductCount: manifest.normalizedProductCount,
    wouldInsert: manifest.wouldInsert,
    wouldUpdate: manifest.wouldUpdate,
    wouldSkip: manifest.wouldSkip,
    wouldBlock: manifest.wouldBlock,
    safeToImport: manifest.safeToImport,
    preflightFingerprint,
    fingerprintExpiresAt,
    preflightSignature,
    issues: manifest.issues,
    products: manifest.products.slice(0, MAX_PUBLIC_PRODUCT_DETAILS).map(publicProductPlan),
  };
}

export async function buildMerchizeHiddenImportManifestForProducts(
  products: MerchizeProduct[],
): Promise<MerchizeHiddenImportManifest> {
  const candidateProducts = products.slice(0, MAX_PROVIDER_PRODUCTS);
  const providerProductIds = candidateProducts.map((product) =>
    coerceRequiredText(product.providerProductId),
  );
  const duplicateProductIds = duplicateValues(providerProductIds);
  const lookupProviderProductIds = providerProductIds.filter(
    (id) => id && id.length <= MAX_PROVIDER_ID_LENGTH && !id.startsWith('merchize-'),
  );
  const integrationRefs = lookupProviderProductIds.map((id) => providerProductRef('merchize', id));

  const existingProducts = integrationRefs.length
    ? await db.product.findMany({
        where: { integrationRef: { in: integrationRefs } },
        select: { id: true, integrationRef: true, printifyProductId: true },
      })
    : [];
  const existingProductsByRef = new Map(
    (existingProducts as ExistingProduct[])
      .filter((product) => Boolean(product.integrationRef))
      .map((product) => [product.integrationRef as string, product]),
  );
  const printifyProductConflicts = new Set(
    (
      await db.product.findMany({
        where: {
          printifyProductId: { in: lookupProviderProductIds },
        },
        select: { printifyProductId: true },
      })
    )
      .map((product) => product.printifyProductId)
      .filter((value): value is string => Boolean(value)),
  );
  const incomingVariantIds = [
    ...new Set(
      candidateProducts.flatMap((product) =>
        product.variants
          .map((variant) => coerceText(variant.providerVariantId) ?? '')
          .filter((id) => id && id.length <= MAX_PROVIDER_ID_LENGTH),
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

  const manifestProducts = candidateProducts.map((product) =>
    canonicalizeProduct({
      product,
      duplicateProductIds,
      printifyProductConflicts,
      printifyVariantConflicts,
      existingProductsByRef,
    }),
  );
  let issues = summarizeIssues(manifestProducts);

  if (products.length === 0) {
    issues.push({
      code: 'empty_provider_catalog',
      message: 'Merchize returned no catalog products.',
      count: 0,
    });
  }

  if (products.length > MAX_PROVIDER_PRODUCTS) {
    issues.push({
      code: 'provider_catalog_too_large',
      message: merchizeIssueMessage('provider_catalog_too_large'),
      count: products.length,
    });
  }

  issues = issues.sort((a, b) => a.code.localeCompare(b.code));
  const catalogTooLarge = products.length > MAX_PROVIDER_PRODUCTS;
  const wouldBlock = catalogTooLarge
    ? products.length
    : manifestProducts.filter((product) => product.action === 'blocked').length;
  const wouldInsert = catalogTooLarge
    ? 0
    : manifestProducts.filter((product) => product.action === 'inserted').length;
  const wouldUpdate = catalogTooLarge
    ? 0
    : manifestProducts.filter((product) => product.action === 'updated').length;
  const wouldSkip = catalogTooLarge
    ? 0
    : manifestProducts.filter((product) => product.action === 'skipped').length;

  return {
    version: MERCHIZE_HIDDEN_IMPORT_MANIFEST_VERSION,
    provider: 'merchize',
    mode: 'hidden_local_import',
    productCount: products.length,
    normalizedProductCount: products.length,
    wouldInsert,
    wouldUpdate,
    wouldSkip,
    wouldBlock,
    safeToImport:
      products.length > 0 && !catalogTooLarge && wouldBlock === 0 && issues.length === 0,
    issues,
    products: manifestProducts,
  };
}

export async function buildMerchizeImportPreflightForProducts(
  products: MerchizeProduct[],
  options: MerchizeImportPreflightOptions = {},
): Promise<MerchizeImportPreflight> {
  const manifest = await buildMerchizeHiddenImportManifestForProducts(products);
  return preflightFromManifest(manifest, options);
}

export async function loadMerchizeImportPlan(): Promise<{
  preflight: MerchizeImportPreflight;
  manifest: MerchizeHiddenImportManifest;
}> {
  const products = await getMerchizeService().getProducts({
    limit: MAX_PROVIDER_PRODUCTS + 1,
    page: 1,
  });
  const manifest = await buildMerchizeHiddenImportManifestForProducts(products);
  return {
    preflight: preflightFromManifest(manifest, {}),
    manifest,
  };
}

export async function buildMerchizeImportPreflight(): Promise<MerchizeImportPreflight> {
  return (await loadMerchizeImportPlan()).preflight;
}
