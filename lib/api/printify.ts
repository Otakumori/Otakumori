import { z } from "zod";
import { http } from "./http";

const PRINTIFY_BASE = "https://api.printify.com/v1";

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
  const apiKey = process.env.PRINTIFY_API_KEY;
  if (!apiKey) {
    throw new Error("PRINTIFY_API_KEY environment variable is not set");
  }
  return { Authorization: `Bearer ${apiKey}` };
};

// Helper function to get shop ID
const getShopId = () => {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!shopId) {
    throw new Error("PRINTIFY_SHOP_ID environment variable is not set");
  }
  return shopId;
};

// API functions
export async function getCatalog(page = 1, limit = 50) {
  const shopId = getShopId();
  const url = `${PRINTIFY_BASE}/shops/${shopId}/products.json?page=${page}&limit=${limit}`;
  
  return http.get(url, PrintifyCatalogSchema, {
    headers: getAuthHeaders(),
    timeoutMs: 15000,
    retries: 2,
    cache: "no-store",
  });
}

export async function getProduct(productId: string) {
  const shopId = getShopId();
  const url = `${PRINTIFY_BASE}/shops/${shopId}/products/${productId}.json`;
  
  return http.get(url, PrintifyProductSchema, {
    headers: getAuthHeaders(),
    timeoutMs: 15000,
    retries: 2,
    cache: "no-store",
  });
}

export async function getShopInfo() {
  const shopId = getShopId();
  const url = `${PRINTIFY_BASE}/shops/${shopId}.json`;
  
  return http.get(url, PrintifyShopSchema, {
    headers: getAuthHeaders(),
    timeoutMs: 10000,
    retries: 1,
    cache: "no-store",
  });
}

export async function publishProduct(productId: string) {
  const shopId = getShopId();
  const url = `${PRINTIFY_BASE}/shops/${shopId}/products/${productId}/publish.json`;
  
  return http.post(url, z.object({ success: z.boolean() }), {}, {
    headers: getAuthHeaders(),
    timeoutMs: 20000,
    retries: 2,
  });
}

// Health check function
export async function checkPrintifyHealth() {
  try {
    const shopInfo = await getShopInfo();
    return {
      healthy: true,
      shopId: shopInfo.id,
      shopTitle: shopInfo.title,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}
