import { NextResponse } from 'next/server';
import { requireUserId } from '@/app/lib/auth';

const COST = 50; // petals per pull
const TABLE: ReadonlyArray<{ key: string; weight: number }> = [
  { key: 'banner_sakura', weight: 30 },
  { key: 'frame_violet', weight: 30 },
  { key: 'title_ashen', weight: 25 },
  { key: 'title_umbral', weight: 10 },
  { key: 'relic_arcane', weight: 5 },
];

function pick(table: ReadonlyArray<{ key: string; weight: number }> = TABLE): string {
  if (table.length === 0) {
    throw new Error('Reward table cannot be empty');
  }
  const sum = table.reduce((s, r) => s + r.weight, 0);
  let r = Math.random() * sum;
  for (const row of table) {
    if ((r -= row.weight) <= 0) return row.key;
  }
  const fallback = table[0];
  if (!fallback) {
    throw new Error('Failed to select fallback reward');
  }
  return fallback.key;
}

export async function POST() {
  const userId = await requireUserId();
  const { db } = await import('@/lib/db');

  const u = await db.petalWallet.findUnique({ where: { userId } });
  const total = u?.balance ?? 0;
  if (total < COST) return new NextResponse('Not enough petals', { status: 400 });

  const reward = pick();

  await db.$transaction(async (tx) => {
    await tx.petalWallet.update({ where: { userId }, data: { balance: total - COST } });
    
    const existing = await tx.inventoryItem.findFirst({
      where: { userId, sku: reward },
    });
    
    if (existing) {
      // Already have this item - could increment count in metadata if needed
      const currentMeta = existing.metadata as any;
      await tx.inventoryItem.update({
        where: { id: existing.id },
        data: { metadata: { ...currentMeta, count: (currentMeta?.count || 1) + 1 } },
      });
    } else {
      await tx.inventoryItem.create({
        data: { User: { connect: { id: userId } }, sku: reward, kind: 'COSMETIC' },
      });
    }
  });

  return NextResponse.json({ ok: true, reward, remaining: total - COST });
}
