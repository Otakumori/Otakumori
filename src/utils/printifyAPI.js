import axios from 'axios';

const PRINTIFY_API_KEY = process.env.PRINTIFY_API_KEY;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;
const BASE_URL = "https://api.printify.com/v1";

export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/shops/${PRINTIFY_SHOP_ID}/products.json`, {
      headers: {
        Authorization: `Bearer ${PRINTIFY_API_KEY}`
      }
    });
    return response.data;
  } catch (err) {
    // Log the full error response for debugging
    if (err.response) {
      // eslint-disable-next-line no-console
      console.error('Printify API error:', err.response.status, err.response.data);
    } else {
      // eslint-disable-next-line no-console
      console.error('Printify API error:', err.message);
    }
    throw err;
  }
};
