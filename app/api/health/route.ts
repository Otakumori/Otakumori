import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store' };

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json(
      { ok: true, status: 'healthy' },
      { status: 200, headers: noStore },
    );
  } catch {
    // A readiness outage must never be returned as success, including in CI.
    // Never disclose Prisma/connection errors or provider credentials publicly.
    return NextResponse.json(
      { ok: false, status: 'unhealthy', code: 'DATABASE_UNAVAILABLE' },
      { status: 503, headers: noStore },
    );
  }
}
