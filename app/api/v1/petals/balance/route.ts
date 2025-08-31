/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
export const dynamic = 'force-dynamic'; // tells Next this cannot be statically analyzed
export const runtime = 'nodejs'; // keep on Node runtime (not edge)
export const preferredRegion = 'iad1'; // optional: co-locate w/ your logs region
export const maxDuration = 10; // optional guard

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(_req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        petalBalance: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      data: {
        petalBalance: user.petalBalance || 0,
        userId: user.id,
      },
    });
  } catch (error) {
    console.error('Error fetching petal balance:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
