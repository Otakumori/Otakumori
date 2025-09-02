 
 
import { NextResponse } from 'next/server';
import { requireUserId } from '@/app/lib/auth';
import { petalService } from '@/app/lib/petals';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req: Request) {
  try {
    const userId = await requireUserId();
    const { amount, reason, metadata } = await req.json();

    const result = await petalService.awardPetals(userId, {
      type: 'earn',
      amount: Number(amount),
      reason: reason ?? 'PETAL_CLICK',
      metadata,
    });

    if (!result.success) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, petals: result.newBalance });
  } catch (e: any) {
    const status = e?.status ?? 400;
    return NextResponse.json({ ok: false, error: String(e.message ?? e) }, { status });
  }
}
