const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Constants
const PRINTIFY_API_URL = 'https://api.printify.com/v1';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Validate environment variables
const requiredEnvVars = {
  PRINTIFY_SHOP_ID: process.env.PRINTIFY_SHOP_ID,
  PRINTIFY_API_KEY: process.env.PRINTIFY_API_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

// Check for missing environment variables
const missingEnvVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Utility function for delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Retry wrapper function
async function withRetry(fn, retries = MAX_RETRIES) {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts remaining`);
      await delay(RETRY_DELAY);
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

async function fetchPrintifyProducts() {
  const response = await fetch(
    `${PRINTIFY_API_URL}/shops/${process.env.PRINTIFY_SHOP_ID}/products.json`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function updatePrintifyProducts() {
  try {
    console.log('Starting Printify product update...');

    // Fetch products with retry logic
    const products = await withRetry(fetchPrintifyProducts);

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
        updated_at: new Date().toISOString(),
      }));

    console.log(`Found ${abyssProducts.length} Abyss products`);

    // Update Supabase cache with retry logic
    if (abyssProducts.length > 0) {
      await withRetry(async () => {
        const { error: updateError } = await supabase.from('abyss_products').upsert(abyssProducts);

        if (updateError) throw updateError;
        console.log('Successfully updated products in Supabase');
      });
    }

    return abyssProducts;
  } catch (error) {
    console.error('Error updating Printify products:', error);
    throw error;
  }
}

// Run the update
updatePrintifyProducts()
  .then(() => {
    console.log('Product update completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Product update failed:', error);
    process.exit(1);
  });
