import { NextResponse } from 'next/server';
import { requireLocalViewer } from '@/app/lib/auth/viewer';
import { PetalSpendError, spendPetalsAndFulfill } from '@/app/lib/petals/spend';

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

export async function POST(req: Request) {
  const { localUserId } = await requireLocalViewer();
  const idempotencyKey = req.headers.get('x-idempotency-key')?.trim();
  if (!idempotencyKey || idempotencyKey.length > 128) {
    return NextResponse.json({ ok: false, error: 'IDEMPOTENCY_KEY_REQUIRED' }, { status: 400 });
  }

  const reward = pick();

  try {
    const result = await spendPetalsAndFulfill(
      localUserId,
      COST,
      `Gacha pull: ${reward}`,
      'petal_gacha',
      async (tx) => {
        await tx.idempotencyKey.create({
          data: {
            key: `petal-gacha:${localUserId}:${idempotencyKey}`,
            purpose: 'petal_gacha',
          },
        });
        const existing = await tx.inventoryItem.findFirst({
          where: { userId: localUserId, sku: reward },
        });

        if (existing) {
          const currentMeta = existing.metadata as Record<string, unknown> | null;
          const count = typeof currentMeta?.count === 'number' ? currentMeta.count : 1;
          await tx.inventoryItem.update({
            where: { id: existing.id },
            data: { metadata: { ...currentMeta, count: count + 1 } },
          });
        } else {
          await tx.inventoryItem.create({
            data: {
              User: { connect: { id: localUserId } },
              sku: reward,
              kind: 'COSMETIC',
            },
          });
        }
      },
    );

    return NextResponse.json({ ok: true, reward, remaining: result.newBalance });
  } catch (error) {
    if (error instanceof PetalSpendError && error.code === 'INSUFFICIENT_PETALS') {
      return new NextResponse('Not enough petals', { status: 400 });
    }
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'DUPLICATE_REQUEST' }, { status: 409 });
    }
    throw error;
  }
}
