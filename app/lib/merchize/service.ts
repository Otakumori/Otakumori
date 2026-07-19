type JsonRecord = Record<string, unknown>;

import { env } from '@/env.mjs';

export interface MerchizeProductImage {
  url: string;
  alt?: string | null;
}

export interface MerchizeProductVariant {
  provider: 'merchize';
  providerVariantId: string | null;
  providerVariantIdSource?: 'provider_id' | 'sku_fallback' | 'missing';
  sku: string | null;
  title: string | null;
  options: Array<{ option: string; value: string }>;
  price: number | null;
  currency: string | null;
  inStock: boolean | null;
  availability: string | null;
  printifyVariantId: null;
}

export interface MerchizeProduct {
  provider: 'merchize';
  providerProductId: string;
  providerProductIdSource?: 'provider_id' | 'sku_fallback' | 'generated';
  id: string;
  title: string;
  description: string | null;
  sku: string | null;
  handle: string | null;
  status: string | null;
  currency: string | null;
  price: number | null;
  priceRange: { min: number | null; max: number | null; currency: string | null };
  images: MerchizeProductImage[];
  variants: MerchizeProductVariant[];
  variantCount: number;
  pricedVariantCount: number;
  imageCount: number;
  warnings: string[];
  importReadiness: {
    ready: boolean;
    issues: string[];
  };
}

export type MerchizeCatalogScope = 'fulfillment_blank_catalog' | 'seller_products' | 'unknown';
export type MerchizeCatalogCompleteness = 'complete' | 'incomplete' | 'unknown';

export interface MerchizeCatalogPagination {
  total: number | null;
  limit: number | null;
  page: number | null;
  loadedCount: number;
  completeness: MerchizeCatalogCompleteness;
}

export interface MerchizeProductCollection {
  products: MerchizeProduct[];
  rawProductCount: number;
  payloadShapeKeys: string[];
  catalogScope: MerchizeCatalogScope;
  pagination: MerchizeCatalogPagination;
}

export interface MerchizeConnectionResult {
  success: boolean;
  endpoint: string;
  status?: number;
  productCount?: number;
  error?: string;
  sampleKeys?: string[];
}

export interface MerchizePreflightIssue {
  code: string;
  message: string;
  count?: number;
}

export interface MerchizeCatalogPreflight {
  connection: MerchizeConnectionResult;
  catalogScope: MerchizeCatalogScope;
  completeness: MerchizeCatalogCompleteness;
  pagination: MerchizeCatalogPagination;
  productCount: number;
  normalizedProductCount: number;
  variantCount: number;
  pricedVariantCount: number;
  imageCount: number;
  productsMissingImages: number;
  productsMissingPrice: number;
  duplicateProductIdCount: number;
  duplicateSkuCount: number;
  payloadShapeKeys: string[];
  safeToNormalize: boolean;
  safeToImport: boolean;
  issues: MerchizePreflightIssue[];
  products: Array<{
    provider: 'merchize';
    providerProductId: string;
    id: string;
    title: string;
    sku: string | null;
    status: string | null;
    price: number | null;
    priceRange: { min: number | null; max: number | null; currency: string | null };
    images: MerchizeProductImage[];
    variants: MerchizeProductVariant[];
    imageCount: number;
    variantCount: number;
    pricedVariantCount: number;
    warnings: string[];
    importReadiness: {
      ready: boolean;
      issues: string[];
    };
  }>;
}

class MerchizeServiceError extends Error {
  constructor(
    message: string,
    readonly category: 'configuration' | 'provider' | 'network' | 'payload',
    readonly status?: number,
  ) {
    super(message);
    this.name = 'MerchizeServiceError';
  }
}

function getBaseUrl(): string {
  const baseUrl = env.MERCHIZE_API_URL || env.MERCHIZE_STORE_API_URL;

  if (!baseUrl) {
    throw new MerchizeServiceError('Merchize server API URL is not configured', 'configuration');
  }

  return baseUrl.replace(/\/+$/, '');
}

function getAccessToken(): string {
  const token = env.MERCHIZE_ACCESS_TOKEN || env.MERCHIZE_API_TOKEN;

  if (!token) {
    throw new MerchizeServiceError('Merchize server API token is not configured', 'configuration');
  }

  return token.trim();
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function sanitizeError(error: unknown): { message: string; category: string; status?: number } {
  if (error instanceof MerchizeServiceError) {
    return {
      message: error.message,
      category: error.category,
      status: error.status,
    };
  }

  if (error instanceof TypeError) {
    return {
      message: 'Merchize provider request failed',
      category: 'network',
    };
  }

  return {
    message: 'Merchize provider request failed',
    category: 'provider',
  };
}

function coerceString(value: unknown): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return null;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function coerceNonNegativeInteger(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0 ? value : null;
  }

  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    return Number.isSafeInteger(parsed) ? parsed : null;
  }

  return null;
}

function coerceBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1 ? true : value === 0 ? false : null;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', 'y', '1', 'in_stock', 'available', 'active'].includes(normalized)) {
      return true;
    }
    if (['false', 'no', 'n', '0', 'out_of_stock', 'unavailable', 'inactive'].includes(normalized)) {
      return false;
    }
  }
  return null;
}

function countDuplicates(values: string[]): number {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.values()].filter((count) => count > 1).length;
}

function extractImageUrls(raw: JsonRecord): MerchizeProductImage[] {
  const candidates = [
    raw.images,
    raw.image,
    raw.thumbnail,
    raw.preview,
    raw.photo,
    raw.mockup_and_templates_link,
  ];
  const urls: MerchizeProductImage[] = [];

  for (const candidate of candidates) {
    if (typeof candidate === 'string') {
      urls.push({ url: candidate });
      continue;
    }

    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (typeof item === 'string') {
          urls.push({ url: item });
          continue;
        }

        if (item && typeof item === 'object') {
          const record = item as JsonRecord;
          const url =
            coerceString(record.url) ||
            coerceString(record.src) ||
            coerceString(record.image) ||
            coerceString(record.thumbnail);

          if (url) {
            urls.push({
              url,
              alt: coerceString(record.alt),
            });
          }
        }
      }
    }

    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      const record = candidate as JsonRecord;
      const url =
        coerceString(record.url) ||
        coerceString(record.src) ||
        coerceString(record.image) ||
        coerceString(record.thumbnail);

      if (url) {
        urls.push({
          url,
          alt: coerceString(record.alt),
        });
      }
    }
  }

  return urls.filter(
    (image, index, arr) => arr.findIndex((item) => item.url === image.url) === index,
  );
}

function extractVariants(raw: JsonRecord): JsonRecord[] {
  const variants = raw.variants;
  if (!Array.isArray(variants)) return [];
  return variants.filter(
    (variant): variant is JsonRecord =>
      Boolean(variant) && typeof variant === 'object' && !Array.isArray(variant),
  );
}

function extractDefaultPrice(raw: JsonRecord): number | null {
  const directPrice =
    coerceNumber(raw.price) ||
    coerceNumber(raw.retailPrice) ||
    coerceNumber(raw.retail_price) ||
    coerceNumber(raw.salePrice) ||
    coerceNumber(raw.sale_price);

  if (directPrice != null) {
    return directPrice;
  }

  const variants = extractVariants(raw);
  for (const variant of variants) {
    const tiers = Array.isArray(variant.tiers) ? variant.tiers : [];
    for (const tier of tiers) {
      if (!tier || typeof tier !== 'object' || Array.isArray(tier)) continue;
      const tierRecord = tier as JsonRecord;
      const tierPrice = coerceNumber(tierRecord.price);
      if (tierPrice != null) {
        return tierPrice;
      }
    }
  }

  return null;
}

function extractVariantPrice(variant: JsonRecord): number | null {
  const directPrice =
    coerceNumber(variant.price) ||
    coerceNumber(variant.retailPrice) ||
    coerceNumber(variant.retail_price) ||
    coerceNumber(variant.salePrice) ||
    coerceNumber(variant.sale_price);

  if (directPrice != null) {
    return directPrice;
  }

  const tiers = Array.isArray(variant.tiers) ? variant.tiers : [];
  for (const tier of tiers) {
    if (!tier || typeof tier !== 'object' || Array.isArray(tier)) continue;
    const tierPrice = coerceNumber((tier as JsonRecord).price);
    if (tierPrice != null) {
      return tierPrice;
    }
  }

  return null;
}

function hasVariantPrice(variant: JsonRecord): boolean {
  return extractVariantPrice(variant) != null;
}

function extractOptions(variant: JsonRecord): Array<{ option: string; value: string }> {
  const options = variant.options;
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    return [];
  }

  return Object.entries(options as JsonRecord)
    .map(([option, value]) => {
      const optionValue = coerceString(value);
      return optionValue ? { option, value: optionValue } : null;
    })
    .filter((option): option is { option: string; value: string } => Boolean(option));
}

function normalizeVariant(raw: JsonRecord): MerchizeProductVariant {
  const providerVariantIdFromProvider =
    coerceString(raw._id) ||
    coerceString(raw.id) ||
    coerceString(raw.variantId) ||
    coerceString(raw.variant_id);
  const sku = coerceString(raw.sku);
  const providerVariantId = providerVariantIdFromProvider || sku || null;
  const availability =
    coerceString(raw.availability) ||
    coerceString(raw.stock_status) ||
    coerceString(raw.status) ||
    null;

  return {
    provider: 'merchize',
    providerVariantId,
    providerVariantIdSource: providerVariantIdFromProvider
      ? 'provider_id'
      : sku
        ? 'sku_fallback'
        : 'missing',
    sku,
    title:
      coerceString(raw.title) ||
      coerceString(raw.name) ||
      coerceString(raw.option_title) ||
      coerceString(raw.variant_title),
    options: extractOptions(raw),
    price: extractVariantPrice(raw),
    currency: coerceString(raw.currency) || 'USD',
    inStock:
      coerceBoolean(raw.inStock) ??
      coerceBoolean(raw.in_stock) ??
      coerceBoolean(raw.available) ??
      coerceBoolean(raw.is_available) ??
      coerceBoolean(availability),
    availability,
    printifyVariantId: null,
  };
}

function priceRangeFrom(productPrice: number | null, variants: MerchizeProductVariant[]) {
  const variantPrices = variants
    .map((variant) => variant.price)
    .filter((price): price is number => typeof price === 'number' && Number.isFinite(price));
  const prices =
    variantPrices.length > 0 ? variantPrices : productPrice != null ? [productPrice] : [];

  if (prices.length === 0) {
    return { min: null, max: null, currency: variants[0]?.currency ?? 'USD' };
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    currency: variants[0]?.currency ?? 'USD',
  };
}

function normalizeProduct(rawValue: unknown, index: number): MerchizeProduct | null {
  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    return null;
  }

  const raw = rawValue as JsonRecord;
  const providerProductIdFromProvider =
    coerceString(raw._id) ||
    coerceString(raw.id) ||
    coerceString(raw.productId) ||
    coerceString(raw.product_id);
  const productSku = coerceString(raw.sku);
  const providerProductId = providerProductIdFromProvider || productSku;
  const id = providerProductId || `merchize-${index + 1}`;

  const providerTitle =
    coerceString(raw.title) ||
    coerceString(raw.name) ||
    coerceString(raw.productName) ||
    coerceString(raw.product_name);
  const title = providerTitle || `Merchize Product ${index + 1}`;

  const fulfillmentLocation =
    raw.fulfillment_location &&
    typeof raw.fulfillment_location === 'object' &&
    !Array.isArray(raw.fulfillment_location)
      ? (raw.fulfillment_location as JsonRecord)
      : null;

  const descriptionParts = [
    coerceString(raw.description),
    coerceString(raw.body),
    coerceString(raw.summary),
    fulfillmentLocation
      ? `Fulfillment: ${coerceString(fulfillmentLocation.name) || coerceString(fulfillmentLocation.code) || 'Unknown'}`
      : null,
    Array.isArray(raw.printing_methods)
      ? `Printing: ${raw.printing_methods
          .map((value) => coerceString(value))
          .filter(Boolean)
          .join(', ')}`
      : null,
  ].filter(Boolean) as string[];
  const variants = extractVariants(raw);
  const normalizedVariants = variants.map(normalizeVariant);
  const images = extractImageUrls(raw);
  const price = extractDefaultPrice(raw);
  const warnings = [
    !providerProductId ? 'product_missing_provider_id' : null,
    !providerTitle ? 'product_missing_title' : null,
    normalizedVariants.some((variant) => !variant.providerVariantId)
      ? 'variant_missing_provider_id'
      : null,
    normalizedVariants.length === 0 ? 'product_missing_variants' : null,
    images.length === 0 ? 'product_missing_images' : null,
    price == null && !normalizedVariants.some((variant) => variant.price != null)
      ? 'product_missing_price'
      : null,
  ].filter(Boolean) as string[];

  return {
    provider: 'merchize',
    providerProductId: id,
    providerProductIdSource: providerProductIdFromProvider
      ? 'provider_id'
      : productSku
        ? 'sku_fallback'
        : 'generated',
    id,
    title,
    description: descriptionParts.length > 0 ? descriptionParts.join(' · ') : null,
    sku: productSku,
    handle: coerceString(raw.handle) || coerceString(raw.slug) || coerceString(raw.permalink),
    status: coerceString(raw.status) || coerceString(raw.state) || 'active',
    currency: 'USD',
    price,
    priceRange: priceRangeFrom(price, normalizedVariants),
    images,
    variants: normalizedVariants,
    variantCount: normalizedVariants.length,
    pricedVariantCount: variants.filter(hasVariantPrice).length,
    imageCount: images.length,
    warnings,
    importReadiness: {
      ready: warnings.length === 0,
      issues: warnings,
    },
  };
}

function extractCatalogProducts(payload: unknown): unknown[] {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return [];
  }

  const record = payload as JsonRecord;
  const data = record.data;

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const nested = data as JsonRecord;
    if (Array.isArray(nested.products)) {
      return nested.products;
    }
  }

  if (Array.isArray(record.products)) {
    return record.products;
  }

  return [];
}

function extractPayloadKeys(payload: unknown): string[] | undefined {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return undefined;
  }

  return Object.keys(payload as JsonRecord).slice(0, 12);
}

function extractPaginationRecord(payload: unknown): JsonRecord | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }

  const record = payload as JsonRecord;
  if (record.data && typeof record.data === 'object' && !Array.isArray(record.data)) {
    return record.data as JsonRecord;
  }

  return record;
}

function extractCatalogPagination(
  payload: unknown,
  loadedCount: number,
): MerchizeCatalogPagination {
  const record = extractPaginationRecord(payload);
  const total = record ? coerceNonNegativeInteger(record.total) : null;
  const limit = record ? coerceNonNegativeInteger(record.limit) : null;
  const page = record ? coerceNonNegativeInteger(record.page) : null;

  if (total == null || limit == null || page == null) {
    return { total, limit, page, loadedCount, completeness: 'unknown' };
  }

  if (limit <= 0 || page <= 0 || loadedCount > limit || loadedCount > total) {
    return { total, limit, page, loadedCount, completeness: 'unknown' };
  }

  const loadedThroughCurrentPage = page * limit;
  const expectedCurrentPageCount = Math.max(0, Math.min(limit, total - (page - 1) * limit));
  if (loadedCount !== expectedCurrentPageCount) {
    return { total, limit, page, loadedCount, completeness: 'unknown' };
  }

  return {
    total,
    limit,
    page,
    loadedCount,
    completeness: loadedThroughCurrentPage >= total ? 'complete' : 'incomplete',
  };
}

export class MerchizeService {
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly userAgent = 'Otaku-mori/1.0.0 (Merchize bridge)';

  constructor() {
    this.baseUrl = getBaseUrl();
    this.accessToken = getAccessToken();
  }

  private buildUrl(
    path = '/product/catalog',
    query?: Record<string, string | number | undefined>,
  ): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${normalizedPath}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value == null || value === '') continue;
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }

  private async request(
    path = '/product/catalog',
    query?: Record<string, string | number | undefined>,
  ): Promise<{ response: Response; body: unknown }> {
    let response: Response;
    try {
      response = await fetch(this.buildUrl(path, query), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': this.userAgent,
        },
        cache: 'no-store',
      });
    } catch (error) {
      throw new MerchizeServiceError(
        'Merchize provider request failed',
        error instanceof TypeError ? 'network' : 'provider',
      );
    }

    const body = await parseResponseBody(response);

    if (!response.ok) {
      throw new MerchizeServiceError(
        `Merchize provider returned HTTP ${response.status}`,
        'provider',
        response.status,
      );
    }

    return { response, body };
  }

  async testConnection(): Promise<MerchizeConnectionResult> {
    try {
      const { response, body } = await this.request('/product/catalog', { limit: 1, page: 1 });
      const products = extractCatalogProducts(body);

      return {
        success: true,
        endpoint: '/product/catalog',
        status: response.status,
        productCount: products.length,
        sampleKeys: extractPayloadKeys(body),
      };
    } catch (error) {
      const sanitized = sanitizeError(error);
      return {
        success: false,
        endpoint: '/product/catalog',
        status: sanitized.status,
        error: sanitized.message,
      };
    }
  }

  async getProducts(options?: {
    limit?: number;
    page?: number;
    search?: string;
  }): Promise<MerchizeProduct[]> {
    return (await this.getProductCollection(options)).products;
  }

  async getProductCollection(options?: {
    limit?: number;
    page?: number;
    search?: string;
  }): Promise<MerchizeProductCollection> {
    const { body } = await this.request('/product/catalog', {
      limit: options?.limit ?? 50,
      page: options?.page ?? 1,
      search: options?.search,
    });
    const collection = extractCatalogProducts(body);
    const products = collection
      .map((item, index) => normalizeProduct(item, index))
      .filter((item): item is MerchizeProduct => Boolean(item));

    return {
      products,
      rawProductCount: collection.length,
      payloadShapeKeys: extractPayloadKeys(body) ?? [],
      catalogScope: 'fulfillment_blank_catalog',
      pagination: extractCatalogPagination(body, collection.length),
    };
  }

  async preflightCatalog(options?: {
    limit?: number;
    page?: number;
  }): Promise<MerchizeCatalogPreflight> {
    const query = {
      limit: options?.limit ?? 50,
      page: options?.page ?? 1,
    };
    const { response, body } = await this.request('/product/catalog', query);
    const collection = extractCatalogProducts(body);
    const pagination = extractCatalogPagination(body, collection.length);
    const products = collection
      .map((item, index) => normalizeProduct(item, index))
      .filter((item): item is MerchizeProduct => Boolean(item));
    const issues: MerchizePreflightIssue[] = [];
    const productIds = products.map((product) => product.id).filter(Boolean);
    const skus = products.map((product) => product.sku ?? '').filter(Boolean);
    const duplicateProductIdCount = countDuplicates(productIds);
    const duplicateSkuCount = countDuplicates(skus);
    const missingVariantIdCount = products.reduce(
      (total, product) =>
        total + product.variants.filter((variant) => !variant.providerVariantId).length,
      0,
    );
    const productsMissingImages = products.filter((product) => product.imageCount === 0).length;
    const productsMissingPrice = products.filter(
      (product) => product.priceRange.min == null,
    ).length;
    const variantCount = products.reduce((total, product) => total + product.variantCount, 0);
    const pricedVariantCount = products.reduce(
      (total, product) => total + product.pricedVariantCount,
      0,
    );
    const imageCount = products.reduce((total, product) => total + product.imageCount, 0);

    if (collection.length === 0) {
      issues.push({
        code: 'empty_provider_catalog',
        message: 'Merchize returned no catalog products.',
      });
    }

    if (products.length !== collection.length) {
      issues.push({
        code: 'unnormalized_products',
        message: 'Some Merchize product payloads could not be normalized.',
        count: collection.length - products.length,
      });
    }

    if (duplicateProductIdCount > 0) {
      issues.push({
        code: 'duplicate_merchize_product_ids',
        message: 'Merchize returned duplicate product identities.',
        count: duplicateProductIdCount,
      });
    }

    if (duplicateSkuCount > 0) {
      issues.push({
        code: 'duplicate_merchize_skus',
        message: 'Merchize returned duplicate SKU values.',
        count: duplicateSkuCount,
      });
    }

    if (missingVariantIdCount > 0) {
      issues.push({
        code: 'variants_missing_provider_ids',
        message: 'Some Merchize variants do not expose stable provider variant identities.',
        count: missingVariantIdCount,
      });
    }

    if (productsMissingImages > 0) {
      issues.push({
        code: 'products_missing_images',
        message: 'Some Merchize products do not have usable images.',
        count: productsMissingImages,
      });
    }

    if (productsMissingPrice > 0) {
      issues.push({
        code: 'products_missing_price',
        message: 'Some Merchize products do not have a usable price.',
        count: productsMissingPrice,
      });
    }

    issues.push({
      code: 'unsupported_provider_catalog_scope',
      message:
        'The connected Merchize endpoint is the fulfillment blank catalog, not a verified seller-created product source.',
      count: products.length,
    });

    if (pagination.completeness !== 'complete') {
      issues.push({
        code: 'provider_catalog_completeness_unverified',
        message: 'Merchize pagination metadata does not prove a complete seller-product catalog.',
        count: products.length,
      });
    }

    const safeToNormalize =
      products.length > 0 &&
      !issues.some((issue) =>
        [
          'empty_provider_catalog',
          'unnormalized_products',
          'duplicate_merchize_product_ids',
          'duplicate_merchize_skus',
          'variants_missing_provider_ids',
          'products_missing_images',
          'products_missing_price',
        ].includes(issue.code),
      );

    return {
      connection: {
        success: true,
        endpoint: '/product/catalog',
        status: response.status,
        productCount: products.length,
        sampleKeys: extractPayloadKeys(body),
      },
      catalogScope: 'fulfillment_blank_catalog',
      completeness: pagination.completeness,
      pagination,
      productCount: collection.length,
      normalizedProductCount: products.length,
      variantCount,
      pricedVariantCount,
      imageCount,
      productsMissingImages,
      productsMissingPrice,
      duplicateProductIdCount,
      duplicateSkuCount,
      payloadShapeKeys: extractPayloadKeys(body) ?? [],
      safeToNormalize,
      safeToImport: false,
      issues,
      products: products.slice(0, 24).map((product) => ({
        provider: product.provider,
        providerProductId: product.providerProductId,
        id: product.id,
        title: product.title,
        sku: product.sku,
        status: product.status,
        price: product.price,
        priceRange: product.priceRange,
        images: product.images.slice(0, 4),
        variants: product.variants.slice(0, 8),
        imageCount: product.imageCount,
        variantCount: product.variantCount,
        pricedVariantCount: product.pricedVariantCount,
        warnings: product.warnings,
        importReadiness: product.importReadiness,
      })),
    };
  }
}

let singleton: MerchizeService | null = null;

export function getMerchizeService(): MerchizeService {
  if (!singleton) {
    singleton = new MerchizeService();
  }

  return singleton;
}
