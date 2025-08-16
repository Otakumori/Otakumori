export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { validateEnvironment } from '@/utils/env-validator';
import { validateDatabase } from '@/utils/database-validator';
import { env } from '@/env';

export async function GET() {
  try {
    const present = (v?: string) => !!v && v.length > 0;

    return NextResponse.json({
      supabaseUrlPresent: present(env.NEXT_PUBLIC_SUPABASE_URL),
      printifyKeyPresent: present(env.PRINTIFY_API_KEY),
      printifyUrlPresent: present(env.PRINTIFY_API_URL),
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
      { status: 500 }
    );
  }
}


