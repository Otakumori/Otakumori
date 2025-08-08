import { env } from '@/env';

const BASE_URL = 'https://api.printify.com/v1';

// Helper function for API calls with retry logic
const fetchWithRetry = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

export const printify = async () => {
  try {
    const apiKey = env.PRINTIFY_API_KEY;
    const shopId = env.PRINTIFY_SHOP_ID;

    if (!apiKey || !shopId) {
      console.warn('Printify credentials not configured, returning mock data');
      return { data: [] };
    }

    const products = await fetchWithRetry(
      `${BASE_URL}/shops/${shopId}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    return products;
  } catch (error) {
    console.error('Printify API error:', error);
    return { data: [] };
  }
};

export const printifyAPI = {
  getProducts: async () => {
    return await printify();
  },

  getProduct: async (productId) => {
    try {
      const apiKey = env.PRINTIFY_API_KEY;
      const shopId = env.PRINTIFY_SHOP_ID;

      if (!apiKey || !shopId) {
        throw new Error('Printify credentials not configured');
      }

      return await fetchWithRetry(
        `${BASE_URL}/shops/${shopId}/products/${productId}.json`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  publishProduct: async (productId) => {
    try {
      const apiKey = env.PRINTIFY_API_KEY;
      const shopId = env.PRINTIFY_SHOP_ID;

      if (!apiKey || !shopId) {
        throw new Error('Printify credentials not configured');
      }

      return await fetchWithRetry(
        `${BASE_URL}/shops/${shopId}/products/${productId}/publish.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
    } catch (error) {
      console.error('Error publishing product:', error);
      throw error;
    }
  },
};

export const fetchProducts = async () => {
  return await printify();
};
