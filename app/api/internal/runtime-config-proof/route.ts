export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { env } from '@/env';
import { buildRuntimeConfigProof } from '@/lib/commerce/runtime-config-proof';

export async function GET() {
  const proof = buildRuntimeConfigProof({
    nodeEnv: env.NODE_ENV,
    vercelEnv: env.VERCEL_ENV,
    clerkSecretKey: env.CLERK_SECRET_KEY,
    clerkPublishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    upstashRestUrl: env.UPSTASH_REDIS_REST_URL,
    upstashRestToken: env.UPSTASH_REDIS_REST_TOKEN,
    databaseUrl: env.DATABASE_URL,
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
    fulfillmentDryRun: env.FULFILLMENT_DRY_RUN,
    stripeWebhookFulfillmentDryRun: env.STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN,
    fulfillmentProvider: env.FULFILLMENT_PROVIDER,
    allowLiveKeysInNonProd: env.ALLOW_LIVE_KEYS_IN_NON_PROD,
    allowTestKeysInProduction: env.ALLOW_TEST_KEYS_IN_PRODUCTION,
  });

  if (proof.environment === 'production') {
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(proof, {
    status: proof.commerceProofSafe ? 200 : 409,
    headers: {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
