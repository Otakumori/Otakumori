#!/usr/bin/env node

/**
 * Printify Catalog Validation Script
 *
 * Validates that all product variants in the database have valid mappings
 * to Printify products and variants via the Printify API.
 *
 * Usage:
 *   node scripts/check-catalog.mjs
 *
 * Exit codes:
 *   0 - All mappings valid
 *   1 - One or more mappings failed validation
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

// Environment validation
const API_URL = process.env.PRINTIFY_API_URL;
const API_KEY = process.env.PRINTIFY_API_KEY;
const SHOP_ID = process.env.PRINTIFY_SHOP_ID;

if (!API_URL || !API_KEY || !SHOP_ID) {
  console.error('❌ Missing required environment variables:');
  if (!API_URL) console.error('  - PRINTIFY_API_URL');
  if (!API_KEY) console.error('  - PRINTIFY_API_KEY');
  if (!SHOP_ID) console.error('  - PRINTIFY_SHOP_ID');
  process.exit(1);
}

/**
 * Validate a single variant against Printify API
 */
async function validatePrintifyVariant(productId, variantId) {
  try {
    const url = `${API_URL}/shops/${SHOP_ID}/products/${productId}.json`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return { valid: false, reason: 'Product not found in Printify' };
      }
      return { valid: false, reason: `API error: ${res.status}` };
    }

    const data = await res.json();
    const variantExists = data.variants?.some((v) => v.id === variantId);

    if (!variantExists) {
      return { valid: false, reason: 'Variant not found in product' };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      reason: `Network error: ${error.message}`,
    };
  }
}

/**
 * Main validation function
 */
async function validateCatalog() {
  console.log('🔍 Validating Printify catalog mappings...\n');

  try {
    // Fetch all variants with Printify mappings
    const variants = await db.productVariant.findMany({
      where: {
        printifyVariantId: { not: null },
      },
      include: {
        Product: {
          select: {
            printifyProductId: true,
            name: true,
          },
        },
      },
    });

    console.log(`📊 Found ${variants.length} variants to validate\n`);

    if (variants.length === 0) {
      console.log('✅ No variants to validate');
      await db.$disconnect();
      process.exit(0);
    }

    let failures = 0;
    let validated = 0;
    const errors = [];

    for (const variant of variants) {
      const productId = variant.Product.printifyProductId;
      const variantId = variant.printifyVariantId;
      const skuDisplay = variant.skuCanonical || variant.id;

      if (!productId) {
        console.error(
          `❌ Missing printifyProductId for variant ${skuDisplay} (${variant.Product.name})`,
        );
        errors.push({
          sku: skuDisplay,
          product: variant.Product.name,
          reason: 'Missing printifyProductId',
        });
        failures++;
        continue;
      }

      process.stdout.write(`Validating ${skuDisplay.padEnd(30)} ... `);

      const result = await validatePrintifyVariant(productId, variantId);

      if (!result.valid) {
        console.log(`❌ ${result.reason}`);
        errors.push({
          sku: skuDisplay,
          product: variant.Product.name,
          printifyProduct: productId,
          printifyVariant: variantId,
          reason: result.reason,
        });
        failures++;
      } else {
        console.log('✅');
        validated++;
      }

      // Rate limit: 2 requests per second
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📈 Validation Summary');
    console.log('='.repeat(60));
    console.log(`✅ Valid mappings:   ${validated}`);
    console.log(`❌ Failed mappings:  ${failures}`);
    console.log(`📊 Total checked:    ${variants.length}`);
    console.log('='.repeat(60) + '\n');

    if (failures > 0) {
      console.log('❌ Failed Mappings:\n');
      errors.forEach((err, idx) => {
        console.log(`${idx + 1}. ${err.sku} (${err.product})`);
        console.log(`   Reason: ${err.reason}`);
        if (err.printifyProduct) {
          console.log(
            `   Printify: product=${err.printifyProduct}, variant=${err.printifyVariant}`,
          );
        }
        console.log('');
      });
    }

    await db.$disconnect();

    if (failures > 0) {
      console.error(`\n❌ Validation failed with ${failures} error(s)\n`);
      process.exit(1);
    } else {
      console.log('\n✅ All mappings validated successfully!\n');
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Validation crashed:', error);
    await db.$disconnect();
    process.exit(1);
  }
}

// Run validation
validateCatalog().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
