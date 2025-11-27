#!/usr/bin/env node
/**
 * Delete placeholder products from the database
 * These are test/seed products that shouldn't be in production
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLACEHOLDER_PRODUCT_IDS = [
  'prod_cherry_hoodie',
  'prod_abyss_tee',
  'prod_rune_pin',
  'prod_soapstone_mug',
  'prod_petal_hoodie',
  'prod_memory_tee',
  'prod_rhythm_sticker',
  'prod_otakumori_poster',
];

async function deletePlaceholderProducts() {
  console.log('🗑️  Deleting placeholder products from database...\n');

  for (const productId of PLACEHOLDER_PRODUCT_IDS) {
    try {
      // Delete variants first (foreign key constraint)
      const deletedVariants = await prisma.productVariant.deleteMany({
        where: { productId },
      });

      // Delete the product
      const deleted = await prisma.product.delete({
        where: { id: productId },
      });

      console.log(`✅ Deleted: ${deleted.name} (${deletedVariants.count} variants)`);
    } catch (error) {
      if (error.code === 'P2025') {
        console.log(`⚠️  Not found: ${productId} (may already be deleted)`);
      } else {
        console.error(`❌ Error deleting ${productId}:`, error.message);
      }
    }
  }

  console.log('\n✨ Placeholder products deletion complete!');
}

deletePlaceholderProducts()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
