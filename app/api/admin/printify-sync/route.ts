 
 
// app/api/admin/printify-sync/route.ts  (admin-only)
import { requireAdminOrThrow } from '@/lib/adminGuard';
import { db } from '@/app/lib/db';
import { printifyService } from '@/app/lib/printify';

export const runtime = 'nodejs';

export async function POST() {
  await requireAdminOrThrow();
  const res = await syncPrintify();
  return Response.json(res);
}

async function syncPrintify() {
  try {
    const result = await printifyService.syncProducts();

    // Process the products and upsert to database
    const products = await printifyService.getProducts();

    for (const product of products) {
      const visible = product.visible && product.variants.some((v) => v.is_enabled);

      await db.product.upsert({
        where: { id: String(product.id) },
        update: {
          name: product.title,
          description: product.description ?? '',
          category: mapCategory(product),
          primaryImageUrl: product.images?.[0]?.src ?? null,
          active: visible,
          printifyProductId: String(product.id),
        },
        create: {
          id: String(product.id),
          name: product.title,
          description: product.description ?? '',
          category: mapCategory(product),
          primaryImageUrl: product.images?.[0]?.src ?? null,
          active: visible,
          printifyProductId: String(product.id),
        },
      });

      for (const variant of product.variants) {
        await db.productVariant.upsert({
          where: {
            productId_printifyVariantId: {
              productId: String(product.id),
              printifyVariantId: parseInt(variant.id),
            },
          },
          update: {
            priceCents: toCents(variant.price),
            isEnabled: variant.is_enabled,
            inStock: variant.in_stock,
          },
          create: {
            id: `${product.id}-${variant.id}`,
            productId: String(product.id),
            printifyVariantId: parseInt(variant.id),
            priceCents: toCents(variant.price),
            isEnabled: variant.is_enabled,
            inStock: variant.in_stock,
          },
        });
      }
    }

    return {
      upserted: result.upserted,
      hidden: result.hidden,
      count: result.count,
      errors: result.errors,
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
