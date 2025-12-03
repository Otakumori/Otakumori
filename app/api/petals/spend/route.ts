
import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { requireUserId } from '@/app/lib/auth';
import { petalService } from '@/app/lib/petals';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const { amount, reason, metadata } = await req.json();

    // Log spend with metadata for analytics/debugging
    logger.warn('Petal spend request:', undefined, { userId, amount, reason, metadata: metadata || {} });

    const result = await petalService.spendPetals(
      userId,
      Number(amount),
      reason ?? 'SHOP_PURCHASE',
    );

    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, petals: result.newBalance });
  } catch (e: any) {
    const status = e?.status ?? 400;
    return NextResponse.json({ ok: false, error: String(e.message ?? e) }, { status });
  }
}
