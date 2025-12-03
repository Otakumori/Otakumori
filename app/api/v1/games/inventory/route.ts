
export const dynamic = 'force-dynamic'; // tells Next this cannot be statically analyzed
export const runtime = 'nodejs'; // keep on Node runtime (not edge)
export const preferredRegion = 'iad1'; // optional: co-locate w/ your logs region
export const maxDuration = 10; // optional guard

import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    logger.warn('Game inventory requested from:', undefined, { value: req.headers.get('user-agent') });
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get user's inventory
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { userId: user.id },
      orderBy: { acquiredAt: 'desc' },
    });

    // Transform to match contract schema
    const transformedItems = inventoryItems.map((item) => ({
      id: item.id,
      sku: item.sku,
      kind: item.kind,
      acquiredAt: item.acquiredAt.toISOString(),
      metadata: item.metadata,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        items: transformedItems,
        total: transformedItems.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching inventory:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
