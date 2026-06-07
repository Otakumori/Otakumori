
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { requireUserId } from '@/app/lib/auth';
import { grantPetals } from '@/app/lib/petals/grant';
import { resolveClickReward } from '@/app/lib/petals/serverRewards';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const { reason } = await req.json().catch(() => ({ reason: undefined }));

    // The petal reward is server-owned: the client cannot dictate the amount.
    const { amount, source } = resolveClickReward(reason ?? 'PETAL_CLICK');

    const result = await grantPetals({
      userId,
      amount,
      source,
      description: `Petal click (${reason ?? 'PETAL_CLICK'})`,
      req,
    });

    if (!result.success) {
      const status =
        result.errorCode === 'RATE_LIMITED'
          ? 429
          : result.errorCode === 'AUTH_REQUIRED'
            ? 401
            : 400;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }

    return NextResponse.json({ ok: true, petals: result.newBalance, earned: result.granted });
  } catch (e: any) {
    const status = e?.status ?? 400;
    return NextResponse.json({ ok: false, error: String(e.message ?? e) }, { status });
  }
}
