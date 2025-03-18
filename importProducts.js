// importProducts.js

require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Array to hold CSV data
const products = [];

// Check if the CSV file exists
const csvFilePath = 'products.csv';
if (!fs.existsSync(csvFilePath)) {
  console.error(`CSV file not found at ${csvFilePath}`);
  process.exit(1);
}

console.log(`Reading CSV file from ${csvFilePath}...`);

// Read and parse the CSV file
fs.createReadStream(csvFilePath)
  .pipe(csv())
  .on('data', (data) => {
    // Debug: log each row as it comes in (optional, comment out if too verbose)
    console.log('Row:', data);

    // Ensure price is a number
    if (data.price) {
      data.price = parseFloat(data.price);
    }
    products.push(data);
  })
  .on('error', (err) => {
    console.error('Error reading CSV file:', err);
  })
  .on('end', async () => {
    console.log(`Parsed ${products.length} products from CSV.`);

    if (products.length === 0) {
      console.error("No products parsed. Please check the CSV file headers and content.");
      process.exit(1);
    }

    // Insert/Upsert products into Supabase
    const { data, error } = await supabase.from('products').upsert(products);

    if (error) {
      console.error('Error upserting products:', error);
    } else {
      console.log('Products imported successfully!', data);
    }
    process.exit();
  });
