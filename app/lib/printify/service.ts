import { logger } from '@/app/lib/logger';

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: Array<{ src: string; alt?: string }>;
  variants: Array<{
    id: string;
    price: number;
    is_enabled: boolean;
    in_stock: boolean;
  }>;
  visible: boolean;
  created_at: string;
  updated_at: string;
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

  constructor() {
    const apiKey = process.env.PRINTIFY_API_KEY as string | undefined;
    const shopId = process.env.PRINTIFY_SHOP_ID as string | undefined;

    if (!apiKey) {
      throw new Error('PRINTIFY_API_KEY environment variable is required');
    }

    if (!shopId) {
      throw new Error('PRINTIFY_SHOP_ID environment variable is required');
    }

    this.apiKey = apiKey;
    this.shopId = shopId;
    this.baseUrl = 'https://api.printify.com/v1';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
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

      if (!response.ok) {
        const errorText = await response.text();
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
  ): Promise<{ data: PrintifyProduct[]; total: number; last_page: number }> {
    try {
      const result = await this.makeRequest<{
        data: PrintifyProduct[];
        total: number;
        last_page: number;
        current_page: number;
      }>(`/shops/${this.shopId}/products.json?page=${page}&per_page=${perPage}`);

      return {
        data: result.data || [],
        total: result.total || 0,
        last_page: result.last_page || 1,
      };
    } catch (error) {
      logger.error('printify_products_fetch_failed', undefined, { page, perPage, error: String(error) });
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

  async createOrder(orderData: PrintifyOrderData): Promise<{ id: string; status: string }> {
    try {
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
      logger.error('printify_shipping_fetch_failed', undefined, { error: String(error) });
      throw error;
    }
  }

  async getPrintProviders(): Promise<any[]> {
    try {
      const result = await this.makeRequest<{ data: any[] }>(
        `/shops/${this.shopId}/print_providers.json`,
      );
      return result.data || [];
    } catch (error) {
      logger.error('printify_providers_fetch_failed', undefined, { error: String(error) });
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; error?: string; shopId?: string }> {
    try {
      // Test with a simple endpoint that doesn't require shop ID
      const result = await this.makeRequest<{ id: string; title: string }>('/shops.json');
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
