// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { PetalBalanceSchema } from '@/app/lib/contracts';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Compute current balance from ledger
    const result = await prisma.petalLedger.aggregate({
      where: { userId },
      _sum: { amount: true },
    });

    const balance = result._sum.amount ?? 0;

    // Check if user needs daily grant
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastGrant = await prisma.petalLedger.findFirst({
      where: {
        userId,
        type: 'earn',
        reason: 'DAILY_LOGIN_GRANT',
        createdAt: { gte: today },
      },
      orderBy: { createdAt: 'desc' },
    });

    const needsDailyGrant = !lastGrant;

    const response = PetalBalanceSchema.parse({
      balance,
      needsDailyGrant,
      lastGrantDate: lastGrant?.createdAt ?? null,
    });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Error fetching petal balance:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
