const { env } = require('../env');

// Printify API functions
async function printify() {
  try {
    if (!env.PRINTIFY_API_KEY || !env.PRINTIFY_SHOP_ID) {
      console.warn('Printify credentials not configured, returning mock data');
      return getMockProducts();
    }

    const response = await fetch(`https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`, {
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching from Printify:', error);
    return getMockProducts();
  }
}

// Mock products for development/testing
function getMockProducts() {
  return [
    {
      id: '1',
      title: 'Anime T-Shirt',
      description: 'High-quality anime-themed t-shirt made from 100% cotton.',
      images: [{ src: '/images/products/placeholder.svg' }],
      variants: [{ id: '1', title: 'Default', price: 2999, is_enabled: true, is_default: true, sku: 'ANIME-TS-001' }],
      tags: ['anime', 't-shirt', 'cotton'],
      published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Manga Keychain',
      description: 'Cute manga character keychain, perfect for your keys or bag.',
      images: [{ src: '/images/products/placeholder.svg' }],
      variants: [{ id: '2', title: 'Default', price: 999, is_enabled: true, is_default: true, sku: 'MANGA-KC-001' }],
      tags: ['manga', 'keychain', 'cute'],
      published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

// Create product in Printify
async function createProduct(productData) {
  try {
    if (!env.PRINTIFY_API_KEY || !env.PRINTIFY_SHOP_ID) {
      throw new Error('Printify credentials not configured');
    }

    const response = await fetch(`https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Update product in Printify
async function updateProduct(productId, productData) {
  try {
    if (!env.PRINTIFY_API_KEY || !env.PRINTIFY_SHOP_ID) {
      throw new Error('Printify credentials not configured');
    }

    const response = await fetch(`https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products/${productId}.json`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Delete product from Printify
async function deleteProduct(productId) {
  try {
    if (!env.PRINTIFY_API_KEY || !env.PRINTIFY_SHOP_ID) {
      throw new Error('Printify credentials not configured');
    }

    const response = await fetch(`https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products/${productId}.json`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

module.exports = {
  printify,
  createProduct,
  updateProduct,
  deleteProduct,
};
