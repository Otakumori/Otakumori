import { createClient } from '@supabase/supabase-js';

const PRINTIFY_API_URL = 'https://api.printify.com/v1';
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function getAbyssProducts() {
  try {
    // First check if we have cached products in Supabase
    const { data: cachedProducts, error: cacheError } = await supabase
      .from('abyss_products')
      .select('*')
      .eq('is_active', true);

    if (cacheError) throw cacheError;

    // If we have cached products and they're less than 1 hour old, return them
    if (cachedProducts?.length > 0) {
      const lastUpdate = new Date(cachedProducts[0].updated_at);
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      if (lastUpdate > oneHourAgo) {
        return cachedProducts;
      }
    }

    // Fetch fresh products from Printify
    const response = await fetch(
      `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products.json`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Failed to fetch products from Printify');

    const products = await response.json();
    
    // Filter and transform products for Abyss section
    const abyssProducts = products.data
      .filter(product => product.tags.includes('abyss') || product.tags.includes('r18'))
      .map(product => ({
        id: product.id,
        name: product.title,
        description: product.description,
        price: product.variants[0].price,
        image: product.images[0].src,
        tags: product.tags,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

    // Update Supabase cache
    if (abyssProducts.length > 0) {
      const { error: updateError } = await supabase
        .from('abyss_products')
        .upsert(abyssProducts);

      if (updateError) throw updateError;
    }

    return abyssProducts;
  } catch (error) {
    console.error('Error fetching Abyss products:', error);
    throw error;
  }
}

export async function getProductDetails(productId) {
  try {
    const response = await fetch(
      `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/products/${productId}.json`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error('Failed to fetch product details');

    const product = await response.json();
    return product;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
}

export async function createOrder(productId, variantId, quantity, shippingAddress) {
  try {
    const response = await fetch(
      `${PRINTIFY_API_URL}/shops/${PRINTIFY_SHOP_ID}/orders.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          external_id: `abyss-${Date.now()}`,
          line_items: [{
            blueprint_id: productId,
            variant_id: variantId,
            quantity: quantity
          }],
          shipping_method: 1,
          shipping_address: shippingAddress
        })
      }
    );

    if (!response.ok) throw new Error('Failed to create order');

    const order = await response.json();
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
} 