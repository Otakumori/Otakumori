 
 
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

function toCsvCell(v: unknown) {
  if (v == null) return '';
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  // escape double quotes
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  // Pull a reasonable chunk; adjust if you expect huge histories (or paginate by query)
  const rows = await prisma.rewardLedger.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      createdAt: true,
      type: true,
      amount: true,
      balanceAfter: true,
      metadata: true,
    },
    take: 5000,
  });

  const header = ['id', 'createdAt', 'type', 'amount', 'balanceAfter', 'metadata'];
  const body = rows.map((r) => [
    r.id,
    r.createdAt.toISOString(),
    r.type,
    r.amount,
    r.balanceAfter,
    r.metadata ? JSON.stringify(r.metadata) : '',
  ]);

  const parts = [header, ...body].map((cols) => cols.map(toCsvCell).join(',')).join('\r\n');

  return new NextResponse(parts, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="petal-ledger.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
