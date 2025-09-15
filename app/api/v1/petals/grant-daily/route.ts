// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { PetalTransactionSchema } from '@/app/lib/contracts';

const DAILY_GRANT_AMOUNT = 10;

export async function POST(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already granted today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingGrant = await prisma.petalLedger.findFirst({
      where: {
        userId,
        type: 'earn',
        reason: 'DAILY_LOGIN_GRANT',
        createdAt: { gte: today },
      },
    });

    if (existingGrant) {
      return NextResponse.json(
        { ok: false, error: 'Daily grant already claimed' },
        { status: 400 },
      );
    }

    // Create daily grant transaction
    const transaction = await prisma.petalLedger.create({
      data: {
        userId,
        type: 'earn',
        amount: DAILY_GRANT_AMOUNT,
        reason: 'DAILY_LOGIN_GRANT',
      },
    });

    const response = PetalTransactionSchema.parse(transaction);
    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Error granting daily petals:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
