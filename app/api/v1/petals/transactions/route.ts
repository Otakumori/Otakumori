// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db as prisma } from '@/lib/db';
import { PetalTransactionSchema } from '@/app/lib/contracts';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const transactions = await prisma.petalLedger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const response = transactions.map(tx => PetalTransactionSchema.parse(tx));
    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Error fetching petal transactions:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
