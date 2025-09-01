 
 
import { printify } from '@/lib/printifyClient';
import { env } from '@/env.mjs';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Printify API Error:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    });
    throw new Error(
      `Printify API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`,
    );
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Printify API Request Error:', error.request);
    throw new Error('No response received from Printify API');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Printify API Setup Error:', error.message);
    throw new Error(`Failed to setup Printify API request: ${error.message}`);
  }
};

const fetchWithRetry = async (endpoint, options = {}, retries = MAX_RETRIES) => {
  try {
    const response = await printify.get(endpoint, options);
    return response.data;
  } catch (error) {
    if (retries > 0 && (error.response?.status === 429 || error.response?.status >= 500)) {
      await sleep(RETRY_DELAY);
      return fetchWithRetry(endpoint, options, retries - 1);
    }
    handleApiError(error);
  }
};

export const fetchProducts = async () => {
  try {
    return await fetchWithRetry(`/shops/${env.PRINTIFY_SHOP_ID}/products.json`, {
      method: 'GET',
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

export const fetchProductDetails = async (productId) => {
  try {
    return await fetchWithRetry(`/shops/${env.PRINTIFY_SHOP_ID}/products/${productId}.json`, {
      method: 'GET',
    });
  } catch (error) {
    console.error(`Failed to fetch product details for ${productId}:`, error);
    throw error;
  }
};

export const publishProduct = async (productId) => {
  try {
    return await fetchWithRetry(
      `/shops/${env.PRINTIFY_SHOP_ID}/products/${productId}/publish.json`,
      {
        method: 'POST',
      },
    );
  } catch (error) {
    console.error(`Failed to publish product ${productId}:`, error);
    throw error;
  }
};
