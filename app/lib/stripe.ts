import Stripe from 'stripe';
import { env } from '@/env.mjs';
import { assertExternalMutationAllowed } from '@/app/lib/security/previewIsolation';
import {
  attestStripeMerchantAccount,
  readStripeMerchantConfiguration,
} from '@/lib/stripe/merchant';

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  assertExternalMutationAllowed('stripe');
  readStripeMerchantConfiguration(env);
  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
    typescript: true,
  });
  return stripeClient;
}

export async function getVerifiedStripeClient(): Promise<Stripe> {
  const client = getStripeClient();
  await attestStripeMerchantAccount(client, env);
  return client;
}
