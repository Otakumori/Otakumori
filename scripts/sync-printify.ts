#!/usr/bin/env tsx
/**
 * Script to sync Printify products to database
 * Usage: npx tsx scripts/sync-printify.ts
 * 
 * Make sure .env file is loaded or environment variables are set
 */

// Load environment variables from .env.local or .env
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load .env.local first, then .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { getPrintifyService } from '@/app/lib/printify/service';
import { db } from '@/lib/db';
import { filterValidPrintifyProducts } from '@/app/lib/shop/printify-filters';
import { randomUUID } from 'crypto';

function toCents(n: number) {
    return Math.round(Number(n) * 100);
}

function mapCategory(product: any): string {
    const name = (product.tags ?? []).join(' ').toLowerCase();
    if (name.includes('shirt') || name.includes('hoodie') || name.includes('tee')) return 'apparel';
    if (name.includes('hat') || name.includes('pin') || name.includes('bow')) return 'accessories';
    if (
        name.includes('cup') ||
        name.includes('mug') ||
        name.includes('pillow') ||
        name.includes('sticker')
    )
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

async function syncPrintify() {
    try {
        console.log('🔄 Starting Printify sync...');
        const printifyService = getPrintifyService();

        // Get products from Printify
        const allProducts = await printifyService.getProducts();
        console.log(`📦 Retrieved ${Array.isArray(allProducts) ? allProducts.length : 0} products from Printify`);

        // Filter out invalid/placeholder products before syncing
        const products = Array.isArray(allProducts) ? filterValidPrintifyProducts(allProducts) : [];
        console.log(`✅ After filtering: ${products.length} valid products to sync`);

        let unlockedCount = 0;
        const unlockErrors: string[] = [];
        let syncedCount = 0;

        for (const product of products) {
            const printifyProduct = product as any;

            const visible = printifyProduct.variants?.some((v: any) => v.is_enabled || v.is_available) ?? false;
            const subcategory = mapSubcategory(printifyProduct);
            const printifyProductId = String(printifyProduct.id);

            // Get image URL
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
                select: {
                    id: true,
                },
            });

            const dbProductId = dbProduct.id;

            // Sync variants
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

            // If product was locked (Publishing status), unlock it after successful sync
            if (isLocked) {
                try {
                    await printifyService.publishingSucceeded(printifyProductId);
                    unlockedCount++;
                    console.log(`🔓 Unlocked product ${printifyProductId} (${printifyProduct.title})`);
                } catch (unlockError) {
                    const errorMsg = `Failed to unlock product ${printifyProductId}: ${String(unlockError)}`;
                    console.error(`❌ ${errorMsg}`);
                    unlockErrors.push(errorMsg);
                }
            }

            syncedCount++;
            if (syncedCount % 10 === 0) {
                console.log(`⏳ Synced ${syncedCount}/${products.length} products...`);
            }
        }

        console.log('\n✨ Sync completed!');
        console.log(`📊 Summary:`);
        console.log(`   - Products synced: ${syncedCount}`);
        console.log(`   - Products unlocked: ${unlockedCount}`);
        if (unlockErrors.length > 0) {
            console.log(`   - Unlock errors: ${unlockErrors.length}`);
            unlockErrors.forEach((err) => console.log(`     - ${err}`));
        }

        return {
            upserted: syncedCount,
            hidden: 0,
            count: products.length,
            unlocked: unlockedCount,
            unlockErrors,
            errors: [],
        };
    } catch (error) {
        console.error('❌ Printify sync failed:', error);
        throw error;
    } finally {
        await db.$disconnect();
    }
}

// Run the sync
syncPrintify()
    .then((result) => {
        console.log('\n✅ Sync finished successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Sync failed:', error);
        process.exit(1);
    });

