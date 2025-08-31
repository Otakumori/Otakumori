/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: Request) {
  const { userId } = auth();
  // optional filters
  const url = new URL(req.url);
  const kind = url.searchParams.get('kind'); // "cosmetic" | "overlay" | "text" | "cursor"
  const tag = url.searchParams.get('tag') ?? undefined;

  const where: any = {};
  if (tag) where.eventTag = tag;
  const rows = await prisma.petalShopItem.findMany({
    where,
    orderBy: [{ visibleFrom: 'asc' }, { name: 'asc' }],
    take: 80,
  });

  let inventory: any[] = [],
    balances = { petals: 0, runes: 0 };
  if (userId) {
    const u = await prisma.user.findUnique({ where: { clerkId: userId } });
    balances = { petals: u?.petalBalance ?? 0, runes: u?.runes ?? 0 };
    const inv = await prisma.inventoryItem.findMany({ where: { userId: u?.id } });
    inventory = inv.map((x) => ({
      sku: x.sku,
      kind: x.kind,
      name: x.sku,
      previewUrl: previewFromSku(x.sku),
    }));
  }

  const items = rows
    .filter((r) => {
      if (!kind || kind === 'all') return true;
      if (kind === 'overlay') return r.kind === 'OVERLAY';
      if (kind === 'text') return r.sku.startsWith('textstyle.');
      if (kind === 'cursor') return r.sku.startsWith('cursor.');
      return r.kind === 'COSMETIC';
    })
    .map((r) => ({
      ...r,
      previewUrl: previewFromSku(r.sku),
      owned: !!inventory.find((i) => i.sku === r.sku),
    }));

  return NextResponse.json({ ok: true, items, inventory, balances });
}

function previewFromSku(sku: string) {
  // very light mapping by prefix
  if (sku.startsWith('frame.')) return '/assets/cosmetics/frames/frame_sakura_v1.png';
  if (sku.startsWith('cursor.')) return '/assets/cosmetics/cursors/cursor_katana_v1.png';
  if (sku.startsWith('overlay.')) return '/assets/overlays/overlay_sakura_tint1.png';
  if (sku.startsWith('textstyle.')) return '/assets/textstyles/sample_multicolor.png';
  return '/assets/ui/trade/blur_panel.png';
}
