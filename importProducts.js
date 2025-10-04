// importProducts.js - Prisma Implementation

require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

// Initialize Prisma client
const prisma = new PrismaClient();

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
      console.error('No products parsed. Please check the CSV file headers and content.');
      process.exit(1);
    }

    try {
      // Insert/Upsert products into Prisma database
      console.log('Importing products to database...');

      let successCount = 0;
      let errorCount = 0;

      for (const product of products) {
        try {
          // Transform CSV data to match Prisma schema
          const productData = {
            id: product.id || `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: product.name || product.title || 'Unnamed Product',
            description: product.description || null,
            price: product.price || 0,
            image: product.image || product.imageUrl || null,
            tags: product.tags ? product.tags.split(',').map((tag) => tag.trim()) : [],
            isActive: product.isActive !== 'false', // Default to true unless explicitly false
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Use upsert to create or update products
          const result = await prisma.abyssProduct.upsert({
            where: { id: productData.id },
            update: {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              image: productData.image,
              tags: productData.tags,
              isActive: productData.isActive,
              updatedAt: new Date(),
            },
            create: productData,
          });

          console.log(` Imported/Updated: ${result.name} (ID: ${result.id})`);
          successCount++;
        } catch (error) {
          console.error(` Error importing product ${product.name || 'Unknown'}:`, error.message);
          errorCount++;
        }
      }

      console.log('\n=== Import Summary ===');
      console.log(` Successfully imported/updated: ${successCount} products`);
      console.log(` Errors: ${errorCount} products`);
      console.log(` Total processed: ${products.length} products`);

      if (errorCount > 0) {
        console.log('\n  Some products failed to import. Check the error messages above.');
      } else {
        console.log('\n All products imported successfully!');
      }
    } catch (error) {
      console.error(' Database error during import:', error);
    } finally {
      // Close Prisma connection
      await prisma.$disconnect();
      process.exit(errorCount > 0 ? 1 : 0);
    }
  });

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n  Import interrupted by user');
  await prisma.$disconnect();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\n  Import terminated');
  await prisma.$disconnect();
  process.exit(1);
});
