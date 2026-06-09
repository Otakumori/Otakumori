export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { env } from '@/env';
import {
  authorizeCheckoutHealthRequest,
  buildCheckoutHealthEnv,
} from '@/lib/checkout/health';
import { buildCommerceRuntimeStatus } from '@/lib/commerce/runtime-status';

export async function GET(request: Request) {
  const envValues = buildCheckoutHealthEnv(env);
  const authFailure = authorizeCheckoutHealthRequest(request, envValues);

  if (authFailure) {
    return NextResponse.json(authFailure.body, { status: authFailure.status });
  }

  const status = buildCommerceRuntimeStatus({
    nodeEnv: env.NODE_ENV,
    vercelEnv: env.VERCEL_ENV,
    stripeSecretKey: env.STRIPE_SECRET_KEY,
    fulfillmentDryRun: env.FULFILLMENT_DRY_RUN,
    stripeWebhookFulfillmentDryRun: env.STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN,
    fulfillmentProvider: env.FULFILLMENT_PROVIDER,
    allowLiveKeysInNonProd: env.ALLOW_LIVE_KEYS_IN_NON_PROD,
    allowTestKeysInProduction: env.ALLOW_TEST_KEYS_IN_PRODUCTION,
  });

  return NextResponse.json(status, {
    status: status.commerceProofSafe ? 200 : 409,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
