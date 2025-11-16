import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PetalService } from '@/app/lib/petals';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    // Use PetalService to get balance info (includes lifetimePetalsEarned)
    const petalService = new PetalService();
    const petalInfo = await petalService.getUserPetalInfo(userId, requestId);

    if (!petalInfo.success || !petalInfo.data) {
      return NextResponse.json(
        { ok: false, error: petalInfo.error || 'Failed to fetch balance', requestId },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        balance: petalInfo.data.balance,
        lifetimePetalsEarned: petalInfo.data.lifetimePetalsEarned,
        totalSpent: petalInfo.data.totalSpent,
        needsDailyGrant: !petalInfo.data.lastDailyReward,
        lastGrantDate: petalInfo.data.lastDailyReward ?? null,
        isGuest: false,
      },
      requestId,
    });
  } catch (error) {
    console.error('Error fetching petal balance:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error', requestId },
      { status: 500 },
    );
  }
}
