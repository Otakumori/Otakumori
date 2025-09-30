import Stripe from 'stripe';
import { z } from 'zod';
import { env } from '@/env';

// Initialize Stripe client
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
});

// Zod schemas for Stripe webhook events
export const StripeWebhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.any(),
  }),
  created: z.number(),
  livemode: z.boolean(),
  pending_webhooks: z.number(),
  request: z.object({
    id: z.string().optional(),
    idempotency_key: z.string().optional(),
  }),
});

// Webhook event type schemas
export const StripeCheckoutSessionSchema = z.object({
  id: z.string(),
  customer: z.string().nullable(),
  customer_email: z.string().nullable(),
  payment_status: z.string(),
  status: z.string(),
  amount_total: z.number(),
  currency: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const StripePaymentIntentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
  customer: z.string().nullable(),
  metadata: z.record(z.string(), z.string()).optional(),
});

// Webhook verification function
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<Stripe.Event> {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (error) {
    throw new Error(
      `Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

// Parse webhook event with type safety
export function parseWebhookEvent<T>(event: Stripe.Event, schema: z.ZodType<T>): T {
  const parsed = schema.safeParse(event.data.object);
  if (!parsed.success) {
    throw new Error(`Failed to parse webhook event: ${parsed.error.message}`);
  }
  return parsed.data;
}

// Stripe API functions
export async function createCheckoutSession(params: {
  priceId: string;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata,
  });

  return session;
}

export async function getCustomer(customerId: string) {
  return stripe.customers.retrieve(customerId);
}

export async function createCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}) {
  return stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  });
}

export async function getPaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

// Health check function
export async function checkStripeHealth() {
  try {
    // Test API access by listing customers (limit 1)
    const customers = await stripe.customers.list({ limit: 1 });
    return {
      healthy: true,
      livemode: customers.data.length > 0 ? customers.data[0]?.livemode : false,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
  }
}

export { stripe };
