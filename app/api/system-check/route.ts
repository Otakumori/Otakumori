// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export async function GET() {
  try {
    const present = (v?: string) => !!v && v.length > 0;

    return NextResponse.json({
      printifyKeyPresent: present(env.PRINTIFY_API_KEY),
      stripeSecretPresent: present(env.STRIPE_SECRET_KEY),
      clerkSecretPresent: present(env.CLERK_SECRET_KEY),
      dbPresent: present(env.DATABASE_URL),
      shopId: env.PRINTIFY_SHOP_ID || null,
      nodeEnv: env.NODE_ENV,
    });
  } catch (error) {
    console.error('System check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
