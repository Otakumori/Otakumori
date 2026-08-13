import { logger } from '@/app/lib/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  LocalUserUnavailableError,
  requireLocalViewer,
  schemaUnavailableResponse,
} from '@/app/lib/auth/viewer';
import { PetalService } from '@/app/lib/petals';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const requestId = generateRequestId();

  try {
    let localUserId: string;
    try {
      ({ localUserId } = await requireLocalViewer());
    } catch (error) {
      if (error instanceof LocalUserUnavailableError) {
        return NextResponse.json(schemaUnavailableResponse(requestId), { status: 503 });
      }

      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    // Use PetalService to get balance info (includes lifetimePetalsEarned)
    const petalService = new PetalService();
    const petalInfo = await petalService.getUserPetalInfo(localUserId, requestId);

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
    logger.error('Error fetching petal balance:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { ok: false, error: 'Internal server error', requestId },
      { status: 500 },
    );
  }
}
