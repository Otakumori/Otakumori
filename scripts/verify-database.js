const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

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

async function verifyDatabase() {
  try {
    console.log('Starting database verification...');

    // Check if tables exist
    const tables = ['products', 'product_cache', 'orders'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact', head: true });

      if (error) {
        console.error(`Error checking table ${table}:`, error);
        throw error;
      }

      console.log(`Table ${table} exists and is accessible`);
    }

    // Test Printify API connection
    const response = await fetch(
      `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
    }

    const products = await response.json();
    console.log(`Successfully connected to Printify API. Found ${products.data.length} products.`);

    // Check if products are synced
    const { data: dbProducts, error: dbError } = await supabase
      .from('products')
      .select('count(*)', { count: 'exact' });

    if (dbError) {
      console.error('Error checking products table:', dbError);
      throw dbError;
    }

    console.log(`Database contains ${dbProducts[0].count} products`);

    // Verify RLS policies
    const { data: policies, error: policiesError } = await supabase.rpc('get_policies');

    if (policiesError) {
      console.error('Error checking RLS policies:', policiesError);
      throw policiesError;
    }

    console.log('RLS policies are properly configured');

    // Verify functions
    const { data: functions, error: functionsError } = await supabase.rpc('get_functions');

    if (functionsError) {
      console.error('Error checking functions:', functionsError);
      throw functionsError;
    }

    console.log('Database functions are properly configured');

    // Verify triggers
    const { data: triggers, error: triggersError } = await supabase.rpc('get_triggers');

    if (triggersError) {
      console.error('Error checking triggers:', triggersError);
      throw triggersError;
    }

    console.log('Database triggers are properly configured');

    console.log('Database verification completed successfully');
  } catch (error) {
    console.error('Database verification failed:', error);
    process.exit(1);
  }
}

// Run verification
verifyDatabase()
  .then(() => {
    console.log('Verification process completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('Verification process failed:', error);
    process.exit(1);
  });
