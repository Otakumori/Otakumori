import { getPrintifyService } from '@/app/lib/printify/service';

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

const fetchWithRetry = async (fn, retries = MAX_RETRIES) => {
  try {
    return await fn();
  } catch (error) {
    const status = error?.response?.status;
    if (retries > 0 && (status === 429 || status >= 500)) {
      await sleep(RETRY_DELAY);
      return fetchWithRetry(fn, retries - 1);
    }
    handleApiError(error);
  }
};

export const fetchProducts = async () => {
  try {
    const svc = getPrintifyService();
    const res = await fetchWithRetry(() => svc.getProducts(1, 100));
    return res?.data || [];
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

export const fetchProductDetails = async (productId) => {
  try {
    const svc = getPrintifyService();
    return await fetchWithRetry(() => svc.getProduct(productId));
  } catch (error) {
    console.error(`Failed to fetch product details for ${productId}:`, error);
    throw error;
  }
};

export const publishProduct = async (productId) => {
  try {
    const svc = getPrintifyService();
    return await fetchWithRetry(() => svc.publishProduct(productId));
  } catch (error) {
    console.error(`Failed to publish product ${productId}:`, error);
    throw error;
  }
};
