import { env } from '@/env.mjs';

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  safety_information?: string;
  tags: string[];
  options: Array<{
    name: string;
    type: string;
    values: Array<{
      id: number;
      title: string;
      colors?: string[];
    }>;
  }>;
  variants: Array<{
    id: number;
    price: number;
    title: string;
    sku?: string;
    grams: number;
    is_enabled: boolean;
    is_default: boolean;
    is_available: boolean;
    is_printify_express_eligible: boolean;
    options: number[];
  }>;
  images: Array<{
    src: string;
    variant_ids: number[];
    position: string;
    is_default: boolean;
  }>;
  visible: boolean;
  blueprint_id: number;
  print_provider_id: number;
  user_id: number;
  shop_id: number;
  created_at: string;
  updated_at: string;
  is_locked: boolean;
  is_printify_express_eligible: boolean;
  is_economy_shipping_eligible: boolean;
  is_printify_express_enabled?: boolean;
  is_economy_shipping_enabled: boolean;
  sales_channel_properties?: any;
  views?: Array<{
    id: number;
    label: string;
    position: string;
    files: Array<{
      src: string;
      variant_ids: number[];
    }>;
  }>;
}

export interface PrintifyOrderItem {
  printify_product_id: string;
  printify_variant_id: string;
  quantity: number;
}

export interface PrintifyShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  country: string;
  region: string;
  city: string;
  zip: string;
  address1: string;
  address2?: string;
}

export interface PrintifyOrderData {
  external_id: string;
  label: string;
  line_items: PrintifyOrderItem[];
  shipping_method: number;
  send_shipping_notification: boolean;
  address_to: PrintifyShippingAddress;
}

export interface PrintifySyncResult {
  upserted: number;
  hidden: number;
  count: number;
  errors: string[];
  lastSync: string;
}

export class PrintifyService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly shopId: string;
  private readonly userAgent: string;
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly rateLimit = 600; // 600 requests per minute
  private readonly catalogRateLimit = 100; // 100 requests per minute for catalog

  constructor() {
    const apiKey = env.PRINTIFY_API_KEY;
    const shopId = env.PRINTIFY_SHOP_ID;

    if (!apiKey) {
      throw new Error('PRINTIFY_API_KEY environment variable is required');
    }

    if (!shopId) {
      throw new Error('PRINTIFY_SHOP_ID environment variable is required');
    }

    this.apiKey = apiKey;
    this.shopId = shopId;
    this.baseUrl = 'https://api.printify.com/v1';
    this.userAgent = 'Otaku-mori/1.0.0 (Node.js)';
  }

  private async checkRateLimit(isCatalogEndpoint = false): Promise<void> {
    const now = Date.now();
    const timeDiff = now - this.lastResetTime;

    // Reset counter every minute
    if (timeDiff >= 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    const limit = isCatalogEndpoint ? this.catalogRateLimit : this.rateLimit;

    if (this.requestCount >= limit) {
      const waitTime = 60000 - timeDiff;
      const { logger } = await import('@/app/lib/logger');
      logger.warn('printify_rate_limit_exceeded', undefined, {
        requestCount: this.requestCount,
        limit,
        waitTime,
        isCatalogEndpoint,
      });
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.lastResetTime = Date.now();
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    isCatalogEndpoint = false,
  ): Promise<T> {
    // Check rate limit before making request
    await this.checkRateLimit(isCatalogEndpoint);

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json;charset=utf-8',
      'User-Agent': this.userAgent,
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      this.requestCount++;

      if (!response.ok) {
        const errorText = await response.text();

        // Handle rate limiting specifically
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

          const { logger } = await import('@/app/lib/logger');
          logger.warn('printify_rate_limit_429', undefined, {
            endpoint,
            retryAfter: waitTime,
            isCatalogEndpoint,
          });

          await new Promise((resolve) => setTimeout(resolve, waitTime));
          return this.makeRequest<T>(endpoint, options, isCatalogEndpoint);
        }

        throw new Error(`Printify API error (${response.status}): ${errorText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async getProducts(
    page = 1,
    perPage = 100,
  ): Promise<{
    data: PrintifyProduct[];
    total: number;
    last_page: number;
    current_page: number;
    per_page: number;
    from: number;
    to: number;
    first_page_url?: string;
    prev_page_url?: string;
    next_page_url?: string;
    last_page_url?: string;
  }> {
    try {
      // Ensure perPage doesn't exceed the maximum allowed by Printify API
      const limit = Math.min(perPage, 50);

      const result = await this.makeRequest<{
        data: PrintifyProduct[];
        total: number;
        last_page: number;
        current_page: number;
        per_page: number;
        from: number;
        to: number;
        first_page_url?: string;
        prev_page_url?: string;
        next_page_url?: string;
        last_page_url?: string;
      }>(`/shops/${this.shopId}/products.json?page=${page}&limit=${limit}`);

      return {
        data: result.data || [],
        total: result.total || 0,
        last_page: result.last_page || 1,
        current_page: result.current_page || page,
        per_page: result.per_page || limit,
        from: result.from || 0,
        to: result.to || 0,
        first_page_url: result.first_page_url,
        prev_page_url: result.prev_page_url,
        next_page_url: result.next_page_url,
        last_page_url: result.last_page_url,
      };
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_products_fetch_failed', undefined, {
        page,
        perPage,
        error: String(error),
      });
      throw error;
    }
  }

  async getAllProducts(): Promise<PrintifyProduct[]> {
    const allProducts: PrintifyProduct[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const result = await this.getProducts(page, 100);
        allProducts.push(...result.data);

        hasMore = page < result.last_page;
        page++;

        // Add a small delay to avoid rate limiting
        if (hasMore) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        const { logger } = await import('@/app/lib/logger');
        logger.error('printify_pagination_error', undefined, {
          error: String(error),
          page,
          totalFetched: allProducts.length,
        });
        break;
      }
    }

    return allProducts;
  }

  async getProduct(productId: string): Promise<PrintifyProduct> {
    return this.makeRequest<PrintifyProduct>(`/shops/${this.shopId}/products/${productId}.json`);
  }

  async publishProduct(productId: string): Promise<{ status: string } | any> {
    return this.makeRequest(`/shops/${this.shopId}/products/${productId}/publish.json`, {
      method: 'POST',
    });
  }

  async createOrder(orderData: PrintifyOrderData): Promise<{ id: string; status: string }> {
    try {
      const { logger } = await import('@/app/lib/logger');
      logger.info('printify_order_creation_started', undefined, {
        externalId: orderData.external_id,
        itemCount: orderData.line_items.length,
      });

      const result = await this.makeRequest<{ id: string; status: string }>(
        `/shops/${this.shopId}/orders.json`,
        {
          method: 'POST',
          body: JSON.stringify(orderData),
        },
      );

      logger.info('printify_order_created_success', undefined, {
        orderId: result.id,
        externalId: orderData.external_id,
        status: result.status,
      });

      return result;
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_order_creation_failed', undefined, {
        externalId: orderData.external_id,
        error: String(error),
      });
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<any> {
    return this.makeRequest(`/shops/${this.shopId}/orders/${orderId}.json`);
  }

  async getShippingMethods(): Promise<any[]> {
    try {
      const result = await this.makeRequest<{ data: any[] }>(`/shops/${this.shopId}/shipping.json`);
      return result.data || [];
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_shipping_fetch_failed', undefined, { error: String(error) });
      throw error;
    }
  }

  async getPrintProviders(): Promise<any[]> {
    try {
      const result = await this.makeRequest<{ data: any[] }>(
        `/catalog/print_providers.json`,
        {},
        true, // This is a catalog endpoint
      );
      return result.data || [];
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_providers_fetch_failed', undefined, { error: String(error) });
      throw error;
    }
  }

  async getBlueprints(): Promise<any[]> {
    try {
      const result = await this.makeRequest<{ data: any[] }>(
        `/catalog/blueprints.json`,
        {},
        true, // This is a catalog endpoint
      );
      return result.data || [];
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_blueprints_fetch_failed', undefined, { error: String(error) });
      throw error;
    }
  }

  async getBlueprint(blueprintId: number): Promise<any> {
    try {
      return await this.makeRequest<any>(
        `/catalog/blueprints/${blueprintId}.json`,
        {},
        true, // This is a catalog endpoint
      );
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_blueprint_fetch_failed', undefined, {
        blueprintId,
        error: String(error),
      });
      throw error;
    }
  }

  async getBlueprintVariants(
    blueprintId: number,
    printProviderId: number,
    showOutOfStock = false,
  ): Promise<any[]> {
    try {
      const result = await this.makeRequest<{ data: any[] }>(
        `/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json?show-out-of-stock=${showOutOfStock ? 1 : 0}`,
        {},
        true, // This is a catalog endpoint
      );
      return result.data || [];
    } catch (error) {
      const { logger } = await import('@/app/lib/logger');
      logger.error('printify_blueprint_variants_fetch_failed', undefined, {
        blueprintId,
        printProviderId,
        showOutOfStock,
        error: String(error),
      });
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string; shopId?: string }> {
    try {
      // Test with a simple endpoint that doesn't require shop ID
      const _result = await this.makeRequest<{ id: string; title: string }>('/shops.json');
      return {
        success: true,
        shopId: this.shopId,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }
}

let _singleton: PrintifyService | null = null;
export function getPrintifyService(): PrintifyService {
  if (!_singleton) _singleton = new PrintifyService();
  return _singleton;
}
