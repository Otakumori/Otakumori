
import { logger } from '@/app/lib/logger';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  isMissingSchemaError,
  requireLocalViewer,
} from '@/app/lib/auth/viewer';
import { PetalTransactionSchema } from '@/app/lib/contracts';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { localUserId } = await requireLocalViewer();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const transactions = await prisma.petalLedger.findMany({
      where: { userId: localUserId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const response = transactions.map((tx) => PetalTransactionSchema.parse(tx));
    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof LocalUserUnavailableError || isMissingSchemaError(error)) {
      return NextResponse.json(
        { ok: false, error: 'Petal transactions are temporarily unavailable.' },
        { status: 503 },
      );
    }
    logger.error('Error fetching petal transactions:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
