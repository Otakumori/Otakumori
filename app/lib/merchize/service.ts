type JsonRecord = Record<string, unknown>;

export interface MerchizeProductImage {
  url: string;
  alt?: string | null;
}

export interface MerchizeProduct {
  id: string;
  title: string;
  description: string | null;
  sku: string | null;
  handle: string | null;
  status: string | null;
  currency: string | null;
  price: number | null;
  images: MerchizeProductImage[];
  raw: JsonRecord;
}

export interface MerchizeConnectionResult {
  success: boolean;
  endpoint: string;
  status?: number;
  productCount?: number;
  error?: string;
  sampleKeys?: string[];
}

function getBaseUrl(): string {
  const baseUrl =
    process.env.MERCHIZE_API_URL ||
    process.env.MERCHIZE_STORE_API_URL ||
    process.env.NEXT_PUBLIC_MERCHIZE_API_URL;

  if (!baseUrl) {
    throw new Error('Missing MERCHIZE_API_URL or MERCHIZE_STORE_API_URL');
  }

  return baseUrl.replace(/\/+$/, '');
}

function getAccessToken(): string {
  const token = process.env.MERCHIZE_ACCESS_TOKEN || process.env.MERCHIZE_API_TOKEN;

  if (!token) {
    throw new Error('Missing MERCHIZE_ACCESS_TOKEN or MERCHIZE_API_TOKEN');
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

  return urls.filter((image, index, arr) => arr.findIndex((item) => item.url === image.url) === index);
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

  const variants = Array.isArray(raw.variants) ? raw.variants : [];
  for (const variant of variants) {
    if (!variant || typeof variant !== 'object' || Array.isArray(variant)) continue;
    const record = variant as JsonRecord;
    const tiers = Array.isArray(record.tiers) ? record.tiers : [];
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

function normalizeProduct(rawValue: unknown, index: number): MerchizeProduct | null {
  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    return null;
  }

  const raw = rawValue as JsonRecord;
  const id =
    coerceString(raw._id) ||
    coerceString(raw.id) ||
    coerceString(raw.productId) ||
    coerceString(raw.product_id) ||
    coerceString(raw.sku) ||
    `merchize-${index + 1}`;

  const title =
    coerceString(raw.title) ||
    coerceString(raw.name) ||
    coerceString(raw.productName) ||
    coerceString(raw.product_name) ||
    `Merchize Product ${index + 1}`;

  const fulfillmentLocation =
    raw.fulfillment_location && typeof raw.fulfillment_location === 'object' && !Array.isArray(raw.fulfillment_location)
      ? raw.fulfillment_location as JsonRecord
      : null;

  const descriptionParts = [
    coerceString(raw.description),
    coerceString(raw.body),
    coerceString(raw.summary),
    fulfillmentLocation ? `Fulfillment: ${coerceString(fulfillmentLocation.name) || coerceString(fulfillmentLocation.code) || 'Unknown'}` : null,
    Array.isArray(raw.printing_methods) ? `Printing: ${raw.printing_methods.map((value) => coerceString(value)).filter(Boolean).join(', ')}` : null,
  ].filter(Boolean) as string[];

  return {
    id,
    title,
    description: descriptionParts.length > 0 ? descriptionParts.join(' · ') : null,
    sku: coerceString(raw.sku),
    handle:
      coerceString(raw.handle) ||
      coerceString(raw.slug) ||
      coerceString(raw.permalink),
    status:
      coerceString(raw.status) ||
      coerceString(raw.state) ||
      'active',
    currency: 'USD',
    price: extractDefaultPrice(raw),
    images: extractImageUrls(raw),
    raw,
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

export class MerchizeService {
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly userAgent = 'Otaku-mori/1.0.0 (Merchize bridge)';

  constructor() {
    this.baseUrl = getBaseUrl();
    this.accessToken = getAccessToken();
  }

  private buildUrl(path = '/product/catalog', query?: Record<string, string | number | undefined>): string {
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

  private async request(path = '/product/catalog', query?: Record<string, string | number | undefined>): Promise<{ response: Response; body: unknown }> {
    const response = await fetch(this.buildUrl(path, query), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': this.userAgent,
      },
      cache: 'no-store',
    });

    const body = await parseResponseBody(response);

    if (!response.ok) {
      const detail = typeof body === 'string' ? body : JSON.stringify(body);
      throw new Error(`Merchize API error (${response.status}): ${detail}`);
    }

    return { response, body };
  }

  async testConnection(): Promise<MerchizeConnectionResult> {
    try {
      const { response, body } = await this.request('/product/catalog', { limit: 1, page: 1 });
      const products = extractCatalogProducts(body);

      return {
        success: true,
        endpoint: this.buildUrl('/product/catalog', { limit: 1, page: 1 }),
        status: response.status,
        productCount: products.length,
        sampleKeys: extractPayloadKeys(body),
      };
    } catch (error) {
      return {
        success: false,
        endpoint: this.buildUrl('/product/catalog', { limit: 1, page: 1 }),
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async getProducts(options?: { limit?: number; page?: number; search?: string }): Promise<MerchizeProduct[]> {
    const { body } = await this.request('/product/catalog', {
      limit: options?.limit ?? 50,
      page: options?.page ?? 1,
      search: options?.search,
    });
    const collection = extractCatalogProducts(body);

    return collection
      .map((item, index) => normalizeProduct(item, index))
      .filter((item): item is MerchizeProduct => Boolean(item));
  }
}

let singleton: MerchizeService | null = null;

export function getMerchizeService(): MerchizeService {
  if (!singleton) {
    singleton = new MerchizeService();
  }

  return singleton;
}
