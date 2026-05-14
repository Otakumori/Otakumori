export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { env } from '@/env';

export const GET = withAdminAuth(async (_request: NextRequest) => {
  try {
    const present = (v?: string) => !!v && v.length > 0;

    return NextResponse.json({
      printifyKeyPresent: present(env.PRINTIFY_API_KEY),
      printifyShopIdPresent: present(env.PRINTIFY_SHOP_ID),
      stripeSecretPresent: present(env.STRIPE_SECRET_KEY),
      clerkSecretPresent: present(env.CLERK_SECRET_KEY),
      dbPresent: present(env.DATABASE_URL),
      nodeEnv: env.NODE_ENV,
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'System check failed:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      {
        status: 'error',
        message: 'System check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
});
