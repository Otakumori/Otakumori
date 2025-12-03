
export const dynamic = 'force-dynamic'; // tells Next this cannot be statically analyzed
export const runtime = 'nodejs'; // keep on Node runtime (not edge)
export const preferredRegion = 'iad1'; // optional: co-locate w/ your logs region
export const maxDuration = 10; // optional guard

import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    // Log profile presets request for analytics
    logger.warn('Profile presets requested from:', undefined, {
      userAgent: req.headers.get('user-agent'),
    });

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Implement profile presets logic
    return NextResponse.json({
      ok: true,
      data: {
        presets: [],
        message: 'Profile presets endpoint - implementation pending',
      },
    });
  } catch (error) {
    logger.error(
      'Error fetching profile presets:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
