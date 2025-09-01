 
 
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../lib/prisma';

// Environment validation
function validateEnv() {
  const required = ['CRON_SECRET', 'PRINTIFY_API_KEY', 'PRINTIFY_SHOP_ID'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Logging function
function log(message, level = 'INFO', error = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(error && { error: error.message, stack: error.stack }),
  };

  console.log(`[${timestamp}] ${level}: ${message}`, error ? error : '');

  // Write to log file
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'api-cron.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

// Fetch products from Printify
async function fetchPrintifyProducts() {
  const PRINTIFY_API_URL = 'https://api.printify.com/v1';

  try {
    const response = await fetch(
      `${PRINTIFY_API_URL}/shops/${process.env.PRINTIFY_SHOP_ID}/products.json`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PRINTIFY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Printify API error: ${response.status} ${response.statusText}`);
    }

    const products = await response.json();
    return products.data || [];
  } catch (error) {
    log('Error fetching products from Printify', 'ERROR', error);
    throw error;
  }
}

// Update Abyss products in database
async function updateAbyssProducts(products) {
  try {
    let updatedCount = 0;
    let createdCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Filter for Abyss products
        if (!product.tags.some((tag) => tag.includes('abyss') || tag.includes('r18'))) {
          continue;
        }

        const productData = {
          id: product.id.toString(),
          name: product.title,
          description: product.description,
          price: product.variants[0]?.price || 0,
          image: product.images[0]?.src || null,
          tags: product.tags || [],
          isActive: true,
          updatedAt: new Date(),
        };

        // Use upsert to create or update
        const result = await prisma.abyssProduct.upsert({
          where: { id: productData.id },
          update: productData,
          create: {
            ...productData,
            createdAt: new Date(),
          },
        });

        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          createdCount++;
        } else {
          updatedCount++;
        }
      } catch (error) {
        log(`Error processing product ${product.id}`, 'ERROR', error);
        errorCount++;
      }
    }

    return { updatedCount, createdCount, errorCount };
  } catch (error) {
    log('Error updating Abyss products in database', 'ERROR', error);
    throw error;
  }
}

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Validate environment variables
    validateEnv();

    log('Starting cron job execution');

    // Fetch products from Printify
    log('Fetching products from Printify...');
    const products = await fetchPrintifyProducts();
    log(`Fetched ${products.length} products from Printify`);

    // Update Abyss products in database
    log('Updating Abyss products in database...');
    const updateResult = await updateAbyssProducts(products);

    log(
      `Database update completed: ${updateResult.createdCount} created, ${updateResult.updatedCount} updated, ${updateResult.errorCount} errors`,
    );

    // Clean up old inactive products (older than 30 days)
    log('Cleaning up old inactive products...');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const cleanupResult = await prisma.abyssProduct.deleteMany({
      where: {
        isActive: false,
        updatedAt: { lt: thirtyDaysAgo },
      },
    });
    log(`Cleaned up ${cleanupResult.count} old inactive products`);

    log('Cron job completed successfully');

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Cron job executed successfully',
        timestamp: new Date().toISOString(),
        summary: {
          productsFetched: products.length,
          productsCreated: updateResult.createdCount,
          productsUpdated: updateResult.updatedCount,
          errors: updateResult.errorCount,
          oldProductsCleaned: cleanupResult.count,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    log('Unhandled error in cron endpoint', 'ERROR', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}
