#!/usr/bin/env tsx
/**
 * Direct Printify sync script - runs sync function directly
 * Usage: npx tsx scripts/sync-printify-direct.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Import the sync function directly
async function runSync() {
  try {
    // Import the sync function from the route file
    const { getPrintifyService } = await import('@/app/lib/printify/service');
    const { db } = await import('@/lib/db');
    const { filterValidPrintifyProducts } = await import('@/app/lib/shop/printify-filters');
    const { randomUUID } = await import('crypto');

    console.log('🔄 Starting Printify sync...\n');
    
    const printifyService = getPrintifyService();
    const allProducts = await printifyService.getAllProducts();
    console.log(`📦 Retrieved ${allProducts.length} products from Printify`);

    const products = filterValidPrintifyProducts(allProducts);
    console.log(`✅ After filtering: ${products.length} valid products to sync\n`);

    let unlockedCount = 0;
    const unlockErrors: string[] = [];
    let syncedCount = 0;

    function toCents(n: number) {
      return Math.round(Number(n) * 100);
    }

    function mapCategory(product: any): string {
      const name = (product.tags ?? []).join(' ').toLowerCase();
      if (name.includes('shirt') || name.includes('hoodie') || name.includes('tee')) return 'apparel';
      if (name.includes('hat') || name.includes('pin') || name.includes('bow')) return 'accessories';
      if (name.includes('cup') || name.includes('mug') || name.includes('pillow') || name.includes('sticker'))
        return 'home-decor';
      return 'apparel';
    }

    function mapSubcategory(full: any): string {
      const t = (full.tags ?? []).join(' ').toLowerCase();
      if (t.includes('hoodie') || t.includes('tee') || t.includes('shirt')) return 'tops';
      if (t.includes('socks') || t.includes('shorts') || t.includes('pants')) return 'bottoms';
      if (t.includes('underwear') || t.includes('lingerie')) return 'unmentionables';
      if (t.includes('sneaker') || t.includes('shoe') || t.includes('kicks')) return 'kicks';
      if (t.includes('pin')) return 'pins';
      if (t.includes('hat') || t.includes('cap')) return 'hats';
      if (t.includes('bow')) return 'bows';
      if (t.includes('cup') || t.includes('mug')) return 'cups';
      if (t.includes('pillow')) return 'pillows';
      if (t.includes('sticker')) return 'stickers';
      return 'tops';
    }

    for (const product of products) {
      const printifyProduct = product as any;
      
      const visible = printifyProduct.variants?.some((v: any) => v.is_enabled || v.is_available) ?? false;
      const subcategory = mapSubcategory(printifyProduct);
      const printifyProductId = String(printifyProduct.id);

      let imageUrl: string | null = null;
      if (printifyProduct.images && printifyProduct.images.length > 0) {
        const firstImage = printifyProduct.images[0];
        imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.src || null;
      }

      const isLocked = printifyProduct.is_locked ?? false;
      const specs = {
        is_locked: isLocked,
      };
      
      const dbProduct = await db.product.upsert({
        where: { printifyProductId },
        update: {
          name: printifyProduct.title,
          description: printifyProduct.description ?? '',
          category: `${mapCategory(printifyProduct)}:${subcategory}`,
          primaryImageUrl: imageUrl,
          active: visible,
          visible: printifyProduct.visible ?? visible,
          specs,
          printifyProductId,
        },
        create: {
          id: randomUUID(),
          name: printifyProduct.title,
          description: printifyProduct.description ?? '',
          category: `${mapCategory(printifyProduct)}:${subcategory}`,
          primaryImageUrl: imageUrl,
          active: visible,
          visible: printifyProduct.visible ?? visible,
          specs,
          printifyProductId,
        },
        select: { id: true },
      });

      const dbProductId = dbProduct.id;

      for (const variant of printifyProduct.variants || []) {
        await db.productVariant.upsert({
          where: {
            productId_printifyVariantId: {
              productId: dbProductId,
              printifyVariantId: variant.id,
            },
          },
          update: {
            priceCents: toCents(variant.price),
            isEnabled: variant.is_enabled ?? variant.is_available ?? false,
            inStock: variant.is_available ?? variant.is_enabled ?? false,
          },
          create: {
            id: randomUUID(),
            productId: dbProductId,
            printifyVariantId: variant.id,
            priceCents: toCents(variant.price),
            isEnabled: variant.is_enabled ?? variant.is_available ?? false,
            inStock: variant.is_available ?? variant.is_enabled ?? false,
          },
        });
      }

      if (isLocked) {
        try {
          await printifyService.publishingSucceeded(printifyProductId);
          unlockedCount++;
          console.log(`🔓 Unlocked: ${printifyProduct.title}`);
        } catch (unlockError) {
          const errorMsg = `Failed to unlock ${printifyProductId}: ${String(unlockError)}`;
          unlockErrors.push(errorMsg);
        }
      }

      syncedCount++;
      if (syncedCount % 5 === 0) {
        console.log(`⏳ Synced ${syncedCount}/${products.length} products...`);
      }
    }

    console.log('\n✨ Sync completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Products synced: ${syncedCount}`);
    console.log(`   - Products unlocked: ${unlockedCount}`);
    if (unlockErrors.length > 0) {
      console.log(`   - Unlock errors: ${unlockErrors.length}`);
    }

    await db.$disconnect();
    return { syncedCount, unlockedCount, unlockErrors };
  } catch (error) {
    console.error('❌ Sync failed:', error);
    throw error;
  }
}

runSync()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error);
    process.exit(1);
  });

