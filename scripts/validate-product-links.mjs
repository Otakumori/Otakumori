#!/usr/bin/env node

/**
 * Standalone script to validate all Printify product links
 * Usage: node scripts/validate-product-links.mjs
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function validateLink(url) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`⏰ Timeout: ${url}`);
    }
    return false;
  }
}

async function validateAllProductLinks() {
  console.log('🔗 Starting product link validation...\n');

  try {
    // Get all products with Printify links
    const products = await db.product.findMany({
      where: {
        OR: [{ printifyProductId: { not: null } }, { externalUrl: { not: null } }],
      },
      select: {
        id: true,
        name: true,
        externalUrl: true,
        printifyProductId: true,
        active: true,
      },
    });

    console.log(`📊 Found ${products.length} products to validate\n`);

    let validCount = 0;
    let invalidCount = 0;
    let updatedCount = 0;
    const invalidProducts = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = `[${i + 1}/${products.length}]`;

      // Generate URL if missing
      let url = product.externalUrl;
      if (!url && product.printifyProductId) {
        url = `https://printify.com/app/products/${product.printifyProductId}`;
      }

      if (!url) {
        console.log(`${progress} ⏭️  No URL for: ${product.name}`);
        continue;
      }

      console.log(`${progress} 🔍 Checking: ${product.name.substring(0, 50)}...`);

      const isValid = await validateLink(url);

      if (isValid) {
        validCount++;
        console.log(`${progress} ✅ Valid: ${url}`);
      } else {
        invalidCount++;
        invalidProducts.push({ id: product.id, name: product.name, url });
        console.log(`${progress} ❌ Invalid: ${url}`);
      }

      // Update product if validation status changed
      const shouldBeActive = isValid;
      if (product.active !== shouldBeActive) {
        await db.product.update({
          where: { id: product.id },
          data: {
            active: shouldBeActive,
            externalUrl: url, // Update URL if it was generated
          },
        });
        updatedCount++;
        console.log(`${progress} 🔄 Updated active status: ${shouldBeActive}`);
      } else if (!product.externalUrl && url) {
        // Just update the URL if it was missing
        await db.product.update({
          where: { id: product.id },
          data: { externalUrl: url },
        });
        console.log(`${progress} 🔗 Added external URL`);
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log('\n📈 Validation Summary:');
    console.log(`✅ Valid links: ${validCount}`);
    console.log(`❌ Invalid links: ${invalidCount}`);
    console.log(`🔄 Products updated: ${updatedCount}`);
    console.log(`📊 Total checked: ${validCount + invalidCount}`);

    if (invalidProducts.length > 0) {
      console.log('\n❌ Invalid Products:');
      invalidProducts.forEach(({ name, url }) => {
        console.log(`  • ${name}: ${url}`);
      });
    }

    return {
      total: validCount + invalidCount,
      valid: validCount,
      invalid: invalidCount,
      updated: updatedCount,
      invalidProducts,
    };
  } catch (error) {
    console.error('❌ Validation failed:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateAllProductLinks()
    .then((result) => {
      console.log('\n✨ Link validation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Link validation failed:', error);
      process.exit(1);
    });
}

export { validateAllProductLinks };
