// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
// app/api/admin/printify-sync/route.ts  (admin-only)
import { requireAdminOrThrow } from '@/lib/adminGuard';
import { db } from '@/lib/db';
import { printifyService } from '@/app/lib/printify/client';
import { randomUUID } from 'crypto';
import { filterValidPrintifyProducts } from '@/app/lib/shop/printify-filters';

export const runtime = 'nodejs';

export async function POST() {
  await requireAdminOrThrow();
  const res = await syncPrintify();
  return Response.json(res);
}

async function syncPrintify() {
  try {
    // Get products from Printify (returns array directly from client)
    const allProducts = await printifyService.getProducts();
    console.warn(`Sync retrieved ${Array.isArray(allProducts) ? allProducts.length : 0} products from Printify`);

    // Filter out invalid/placeholder products before syncing
    const products = Array.isArray(allProducts) ? filterValidPrintifyProducts(allProducts) : [];
    console.warn(`After filtering: ${products.length} valid products to sync`);

    for (const product of products) {
      // Type assertion - we know these are PrintifyProduct after filtering
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

      // Use printifyProductId as unique identifier for upsert, generate separate DB ID
      // This prevents duplicates when syncing the same Printify product multiple times
      const isLocked = printifyProduct.is_locked ?? false;
      const specs = {
        is_locked: isLocked, // Track Printify "Publishing" status
      };
      
      const dbProduct = await db.product.upsert({
        where: { printifyProductId },
        update: {
          name: printifyProduct.title,
          description: printifyProduct.description ?? '',
          category: `${mapCategory(printifyProduct)}:${subcategory}`, // Combine category and subcategory
          primaryImageUrl: imageUrl,
          active: visible,
          visible: printifyProduct.visible ?? visible,
          specs,
          printifyProductId,
        },
        create: {
          id: randomUUID(), // Generate unique DB ID
          name: printifyProduct.title,
          description: printifyProduct.description ?? '',
          category: `${mapCategory(printifyProduct)}:${subcategory}`, // Combine category and subcategory
          primaryImageUrl: imageUrl,
          active: visible,
          visible: printifyProduct.visible ?? visible,
          specs,
          printifyProductId,
        },
        select: {
          id: true, // Return the DB ID for variant creation
        },
      });

      // Use the DB product ID (not Printify ID) for variants
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
            id: randomUUID(), // Generate unique variant ID
            productId: dbProductId, // Use DB product ID, not Printify ID
            printifyVariantId: variant.id,
            priceCents: toCents(variant.price),
            isEnabled: variant.is_enabled ?? variant.is_available ?? false,
            inStock: variant.is_available ?? variant.is_enabled ?? false,
          },
        });
      }
    }

    return {
      upserted: 0, // result.upserted,
      hidden: 0, // result.hidden,
      count: products.length, // result.count,
      errors: [], // result.errors,
    };
  } catch (error) {
    console.error('Printify sync failed:', error);
    throw error;
  }
}

function toCents(n: number) {
  return Math.round(Number(n) * 100);
}

// Very simple mappers — refine as you like
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
