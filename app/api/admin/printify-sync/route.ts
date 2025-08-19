// app/api/admin/printify-sync/route.ts  (admin-only)
import { requireAdminOrThrow } from '@/lib/adminGuard';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function POST() {
  await requireAdminOrThrow();
  const res = await syncPrintify();
  return Response.json(res);
}

async function syncPrintify() {
  const base = `https://api.printify.com/v1/shops/${process.env.PRINTIFY_SHOP_ID}`;
  const headers = {
    'Authorization': `Bearer ${process.env.PRINTIFY_API_KEY!}`,
    'Content-Type': 'application/json',
  };

  // 1) list products
  const list = await fetch(`${base}/products.json`, { headers });
  if (!list.ok) throw new Error(`Printify list error: ${list.status}`);
  const { data: products } = await list.json();

  let upserted = 0, hidden = 0;

  for (const p of products as any[]) {
    // 2) details
    const det = await fetch(`${base}/products/${p.id}.json`, { headers });
    if (!det.ok) continue;
    const full = await det.json();

    const visible = !full.visible ? false : (full.variants?.some((v: any) => v.is_enabled !== false) ?? true);
    if (!visible) hidden++;

    await prisma.product.upsert({
      where: { id: String(full.id) },
      update: {
        name: full.title,
        description: full.description ?? '',
        category: mapCategory(full),
        primaryImageUrl: full.images?.[0]?.src ?? null,
        active: visible,
        printifyProductId: String(full.id),
      },
      create: {
        id: String(full.id),
        name: full.title,
        description: full.description ?? '',
        category: mapCategory(full),
        primaryImageUrl: full.images?.[0]?.src ?? null,
        active: visible,
        printifyProductId: String(full.id),
      }
    });

    for (const v of (full.variants ?? [])) {
      await prisma.productVariant.upsert({
        where: { 
          productId_printifyVariantId: { 
            productId: String(full.id), 
            printifyVariantId: v.id 
          } 
        },
        update: {
          priceCents: toCents(v.price ?? firstPrice(full) ?? 0),
          isEnabled: v.is_enabled !== false,
          inStock: true,
        },
        create: {
          id: `${full.id}-${v.id}`,
          productId: String(full.id),
          printifyVariantId: v.id,
          priceCents: toCents(v.price ?? firstPrice(full) ?? 0),
          isEnabled: v.is_enabled !== false,
          inStock: true,
        }
      });
    }
    upserted++;
  }

  return { upserted, hidden, count: products.length };
}

function toCents(n: number) { return Math.round(Number(n) * 100); }
function firstPrice(full: any) {
  const v = (full.variants ?? []).find((x: any) => x.is_enabled !== false);
  return v?.price ? toCents(v.price) : null;
}
// Very simple mappers — refine as you like
function mapCategory(full: any): string {
  const name = (full.tags ?? []).join(' ').toLowerCase();
  if (name.includes('shirt') || name.includes('hoodie') || name.includes('tee')) return 'apparel';
  if (name.includes('hat') || name.includes('pin') || name.includes('bow')) return 'accessories';
  if (name.includes('cup') || name.includes('mug') || name.includes('pillow') || name.includes('sticker')) return 'home-decor';
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
