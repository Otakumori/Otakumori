import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { shouldUseE2ECatalogFallback } from '@/lib/catalog/e2eFallback';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, status: 'healthy' });
  } catch (e: any) {
    if (shouldUseE2ECatalogFallback()) {
      return NextResponse.json(
        {
          ok: true,
          status: 'degraded',
          checks: {
            database: {
              ok: false,
              reason: 'unavailable in CI/test',
            },
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-store',
          },
        },
      );
    }
    return NextResponse.json({ ok: false, error: e?.message ?? 'db error' }, { status: 500 });
  }
}
