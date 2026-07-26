
export const dynamic = 'force-dynamic'; // tells Next this cannot be statically analyzed
export const runtime = 'nodejs'; // keep on Node runtime (not edge)
export const preferredRegion = 'iad1'; // optional: co-locate w/ your logs region
export const maxDuration = 10; // optional guard

import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  requireLocalViewer,
  schemaUnavailableResponse,
} from '@/app/lib/auth/viewer';

export async function GET() {
  try {
    let localUserId: string;
    try {
      ({ localUserId } = await requireLocalViewer());
    } catch (error) {
      if (error instanceof AuthenticationRequiredError) {
        return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
      }
      if (error instanceof LocalUserUnavailableError) {
        return schemaUnavailableResponse('titles_user_unavailable');
      }
      throw error;
    }

    if (!localUserId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const titles = await prisma.userTitle.findMany({
      where: { userId: localUserId },
      orderBy: { awardedAt: 'desc' },
    });

    return NextResponse.json({ ok: true, titles });
  } catch (err) {
    logger.error(
      'Titles error:',
      undefined,
      undefined,
      err instanceof Error ? err : new Error(String(err)),
    );
    return NextResponse.json({ ok: false, error: 'TITLES_ERROR' }, { status: 500 });
  }
}
