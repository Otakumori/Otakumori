import { env } from '@/env';
import type { Result } from './types';
import { safeAsync } from './types';

export interface PrintifyProduct {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
  images?: Array<{
    src: string;
    variant_ids: number[];
    position: string;
    is_default: boolean;
  }>;
  variants?: Array<{
    id: number;
    price: number;
    is_enabled: boolean;
    title: string;
    options: number[];
  }>;
  options?: Array<{
    name: string;
    type: string;
    values: Array<{
      id: number;
      title: string;
      colors?: string[];
    }>;
  }>;
  tags?: string[];
  is_locked?: boolean;
}

export interface PrintifyProductsResponse {
  data: PrintifyProduct[];
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
}

export async function getPrintifyProducts(): Promise<Result<PrintifyProduct[]>> {
  return safeAsync(
    async () => {
      const response = await fetch(
        `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`,
        {
          headers: {
            Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `Printify API error: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const data: PrintifyProductsResponse = await response.json();
      return data.data || [];
    },
    'PRINTIFY_FETCH_ERROR',
    'Failed to fetch products from Printify',
  );
}

export async function getPrintifyProduct(productId: string): Promise<Result<PrintifyProduct>> {
  return safeAsync(
    async () => {
      const response = await fetch(
        `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products/${productId}.json`,
        {
          headers: {
            Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(
          `Printify API error: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      return await response.json();
    },
    'PRINTIFY_FETCH_ERROR',
    `Failed to fetch product ${productId} from Printify`,
  );
}

export async function checkPrintifyHealth(): Promise<Result<boolean>> {
  return safeAsync(
    async () => {
      const response = await fetch(
        `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
          },
          cache: 'no-store',
        },
      );

      return response.ok;
    },
    'PRINTIFY_HEALTH_CHECK_ERROR',
    'Failed to check Printify service health',
  );
}
