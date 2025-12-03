import { logger } from '@/app/lib/logger';
import { env } from '@/env';
import { PrintifyProducts, PrintifyError } from './schema';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 second

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  attempts = RETRY_ATTEMPTS,
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
        'User-Agent': 'Otaku-mori/1.0',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (response.status === 429) {
      // Rate limited, wait and retry
      if (attempts > 0) {
        await sleep(RETRY_DELAY * (RETRY_ATTEMPTS - attempts + 1));
        return fetchWithRetry(url, options, attempts - 1);
      }
    }

    return response;
  } catch (error) {
    if (attempts > 0) {
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, attempts - 1);
    }
    throw error;
  }
}

export async function getProducts() {
  const url = `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      const error = PrintifyError.parse({ error: 'Printify request failed', detail });
      throw new Error(JSON.stringify(error));
    }

    const json = await response.json();
    return PrintifyProducts.parse(json);
  } catch (error) {
    logger.error('Printify API error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

export async function getProductVariants(productId: string) {
  const url = `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products/${productId}/variants.json`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      const error = PrintifyError.parse({ error: 'Printify variants request failed', detail });
      throw new Error(JSON.stringify(error));
    }

    return await response.json();
  } catch (error) {
    logger.error('Printify variants API error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

// Export a service object for easier imports
export const printifyService = {
  getProducts,
  getProductVariants,
};
