// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
export const dynamic = 'force-dynamic'; // tells Next this cannot be statically analyzed
export const runtime = 'nodejs'; // keep on Node runtime (not edge)
export const preferredRegion = 'iad1'; // optional: co-locate w/ your logs region
export const maxDuration = 10; // optional guard

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'UNAUTHENTICATED' }, { status: 401 });
    }

    const titles = await prisma.userTitle.findMany({
      where: { userId },
      orderBy: { awardedAt: 'desc' },
    });

    return NextResponse.json({ ok: true, titles });
  } catch (err) {
    console.error('Titles error:', err);
    return NextResponse.json({ ok: false, error: 'TITLES_ERROR' }, { status: 500 });
  }
}
