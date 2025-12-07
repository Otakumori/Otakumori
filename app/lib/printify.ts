// DEPRECATED: This component is a duplicate. Use app\abyss\shop\api\printify.js instead.
import { log } from '@/lib/logger';
import { env } from '@/env';

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
}

export interface PrintifySyncResult {
  upserted: number;
  hidden: number;
  count: number;
  errors: string[];
}

export class PrintifyService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly shopId: string;

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
    this.baseUrl = `https://api.printify.com/v1/shops/${this.shopId}`;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Printify API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  async createOrder(orderData: PrintifyOrderData): Promise<{ id: string; status: string }> {
    try {
      log('printify_order_creation_started', {
        externalId: orderData.external_id,
        itemCount: orderData.line_items.length,
      });

      const result = await this.makeRequest<{ id: string; status: string }>('/orders.json', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      log('printify_order_created_success', {
        orderId: result.id,
        externalId: orderData.external_id,
        status: result.status,
      });

      return result;
    } catch (error) {
      log('printify_order_creation_failed', {
        externalId: orderData.external_id,
        error: String(error),
      });
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<any> {
    return this.makeRequest(`/orders/${orderId}.json`);
  }

  async getProducts(): Promise<PrintifyProduct[]> {
    try {
      const result = await this.makeRequest<{ data: PrintifyProduct[] }>('/products.json');
      return result.data;
    } catch (error) {
      log('printify_products_fetch_failed', { error: String(error) });
      throw error;
    }
  }

  async getProduct(productId: string): Promise<PrintifyProduct> {
    return this.makeRequest<PrintifyProduct>(`/products/${productId}.json`);
  }

  async syncProducts(): Promise<PrintifySyncResult> {
    const result: PrintifySyncResult = {
      upserted: 0,
      hidden: 0,
      count: 0,
      errors: [],
    };

    try {
      const products = await this.getProducts();
      result.count = products.length;

      for (const product of products) {
        try {
          const fullProduct = await this.getProduct(product.id);
          await this.upsertProduct(fullProduct);
          result.upserted++;
        } catch (error) {
          const errorMsg = `Failed to sync product ${product.id}: ${error}`;
          result.errors.push(errorMsg);
          log('printify_product_sync_error', {
            productId: product.id,
            error: String(error),
          });
        }
      }
    } catch (error) {
      log('printify_sync_failed', { error: String(error) });
      throw error;
    }

    return result;
  }

  private async upsertProduct(product: PrintifyProduct): Promise<void> {
    // This would integrate with your database
    // For now, we'll just log the operation
    log('printify_product_upsert', {
      productId: product.id,
      title: product.title,
      variantCount: product.variants.length,
    });
  }

  async getShippingMethods(): Promise<any[]> {
    try {
      const result = await this.makeRequest<{ data: any[] }>('/shipping.json');
      return result.data;
    } catch (error) {
      log('printify_shipping_fetch_failed', { error: String(error) });
      throw error;
    }
  }

  async getPrintProviders(): Promise<any[]> {
    try {
      const result = await this.makeRequest<{ data: any[] }>('/print_providers.json');
      return result.data;
    } catch (error) {
      log('printify_providers_fetch_failed', { error: String(error) });
      throw error;
    }
  }
}

// Export singleton instance
export const printifyService = new PrintifyService();
