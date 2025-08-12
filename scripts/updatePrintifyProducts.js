const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

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
  console.error('Please ensure .env.local file exists and contains all required variables');
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

    // Transform products for database
    const transformedProducts = products.data.map(product => ({
      printify_id: product.id,
      title: product.title,
      description: product.description,
      images: product.images.map(img => img.src),
      variants: product.variants,
      tags: product.tags,
      price: product.variants[0].price / 100, // Convert cents to dollars
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    console.log(`Found ${transformedProducts.length} products`);

    // Update Supabase with retry logic
    if (transformedProducts.length > 0) {
      await withRetry(async () => {
        const { error: updateError } = await supabase.from('products').upsert(transformedProducts, {
          onConflict: 'printify_id',
          ignoreDuplicates: false,
        });

        if (updateError) throw updateError;
        console.log('Successfully updated products in Supabase');
      });
    }

    console.log('Printify product update completed successfully');
    return transformedProducts;
  } catch (error) {
    console.error('Error updating Printify products:', error);
    throw error;
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  updatePrintifyProducts()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { updatePrintifyProducts };
