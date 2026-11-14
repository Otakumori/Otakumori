import Stripe from 'stripe';
import { env } from '@/env.mjs';
import { assertExternalMutationAllowed } from '@/app/lib/security/previewIsolation';

let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  assertExternalMutationAllowed('stripe');
  if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is required');
  stripeClient ??= new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
    typescript: true,
  });
  return stripeClient;
}
