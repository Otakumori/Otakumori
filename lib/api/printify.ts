// DEPRECATED: This component is a duplicate. Use app\abyss\shop\api\printify.js instead.
import { z } from 'zod';
import { http } from './http';
import { env } from '@/env';

const PRINTIFY_BASE = 'https://api.printify.com/v1';

// Zod schemas for Printify API responses
export const PrintifyImageSchema = z.object({
  src: z.string(),
  variant_ids: z.array(z.string()),
  position: z.string(),
  is_default: z.boolean(),
});

export const PrintifyVariantSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  is_enabled: z.boolean(),
  is_default: z.boolean(),
  sku: z.string(),
});

export const PrintifyProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  images: z.array(PrintifyImageSchema),
  variants: z.array(PrintifyVariantSchema),
  tags: z.array(z.string()),
  published: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const PrintifyCatalogSchema = z.object({
  data: z.array(PrintifyProductSchema),
  total: z.number().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export const PrintifyShopSchema = z.object({
  id: z.string(),
  title: z.string(),
  sales_channel: z.string(),
});

// Helper function to get auth headers
const getAuthHeaders = () => {
  const apiKey = env.PRINTIFY_API_KEY;
  if (!apiKey) {
    console.error('PRINTIFY_API_KEY environment variable is not set');
    throw new Error('PRINTIFY_API_KEY environment variable is not set');
  }
  return { Authorization: `Bearer ${apiKey}` };
};

// Helper function to get shop ID
const getShopId = () => {
  const shopId = env.PRINTIFY_SHOP_ID;
  if (!shopId) {
    console.error('PRINTIFY_SHOP_ID environment variable is not set');
    throw new Error('PRINTIFY_SHOP_ID environment variable is not set');
  }
  return shopId;
};

// API functions
export async function getCatalog(page = 1, limit = 50) {
  try {
    const shopId = getShopId();
    const url = `${PRINTIFY_BASE}/shops/${shopId}/products.json?page=${page}&limit=${limit}`;

    // Fetching Printify catalog
    // Shop ID logged
    // API Key presence logged

    const result = await http.get(url, PrintifyCatalogSchema, {
      headers: getAuthHeaders(),
      timeoutMs: 15000,
      retries: 2,
      cache: 'no-store',
    });

    // Printify catalog fetched successfully
    return result;
  } catch (error) {
    console.error('Error fetching Printify catalog:', error);
    throw error;
  }
}

export async function getProduct(productId: string) {
  try {
    const shopId = getShopId();
    const url = `${PRINTIFY_BASE}/shops/${shopId}/products/${productId}.json`;

    return await http.get(url, PrintifyProductSchema, {
      headers: getAuthHeaders(),
      timeoutMs: 15000,
      retries: 2,
      cache: 'no-store',
    });
  } catch (error) {
    console.error(`Error fetching Printify product ${productId}:`, error);
    throw error;
  }
}

export async function getShopInfo() {
  try {
    const shopId = getShopId();
    const url = `${PRINTIFY_BASE}/shops/${shopId}.json`;

    return await http.get(url, PrintifyShopSchema, {
      headers: getAuthHeaders(),
      timeoutMs: 10000,
      retries: 1,
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Error fetching Printify shop info:', error);
    throw error;
  }
}

export async function publishProduct(productId: string) {
  try {
    const shopId = getShopId();
    const url = `${PRINTIFY_BASE}/shops/${shopId}/products/${productId}/publish.json`;

    return await http.post(
      url,
      z.object({ success: z.boolean() }),
      {},
      {
        headers: getAuthHeaders(),
        timeoutMs: 20000,
        retries: 2,
      },
    );
  } catch (error) {
    console.error(`Error publishing Printify product ${productId}:`, error);
    throw error;
  }
}

// Health check function with detailed diagnostics
export async function checkPrintifyHealth() {
  try {
    // Starting Printify health check...
    console.log('Environment check logged', {
      NODE_ENV: env.NODE_ENV,
      VERCEL_ENV: env.NEXT_PUBLIC_VERCEL_ENVIRONMENT,
      hasApiKey: !!env.PRINTIFY_API_KEY,
      hasShopId: !!env.PRINTIFY_SHOP_ID,
      apiKeyLength: env.PRINTIFY_API_KEY?.length || 0,
      shopId: env.PRINTIFY_SHOP_ID || 'Not set',
    });

    // Test basic connectivity first
    const testResponse = await fetch('https://api.printify.com/v1/health', {
      method: 'GET',
      cache: 'no-store',
    });

    // Printify API connectivity test

    if (!testResponse.ok) {
      return {
        healthy: false,
        error: `API connectivity failed: ${testResponse.status} ${testResponse.statusText}`,
        timestamp: new Date().toISOString(),
      };
    }

    // Test shop info
    const shopInfo = await getShopInfo();
    // Shop info retrieved successfully

    return {
      healthy: true,
      shopId: shopInfo.id,
      shopTitle: shopInfo.title,
      timestamp: new Date().toISOString(),
      connectivity: 'OK',
      shopAccess: 'OK',
    };
  } catch (error) {
    console.error('Printify health check failed:', error);
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      connectivity: 'Failed',
      shopAccess: 'Failed',
    };
  }
}
