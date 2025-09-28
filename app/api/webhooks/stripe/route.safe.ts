/** Local test:
 * 1) stripe login
 * 2) stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
 *    (Copy the whsec_... into STRIPE_WEBHOOK_SECRET, restart dev)
 * 3) stripe trigger checkout.session.completed
 *    stripe trigger payment_intent.succeeded
 *    stripe trigger payment_intent.payment_failed
 *    stripe trigger invoice.payment_succeeded
 */

import { type NextRequest } from 'next/server';
import { stripe, type StripeEvent } from '@/src/lib/stripe.safe';
import { env } from '@/env';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const secret = (env as any).STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ error: 'stripe_webhook_disabled' }, { status: 503 });
  }
  const sig = req.headers.get('stripe-signature');
  const raw = await req.text(); // IMPORTANT: raw body
  let event: StripeEvent;
  try {
    event = stripe.webhooks.constructEvent(raw, sig!, secret);
  } catch (e: any) {
    return new Response(`Invalid signature: ${e.message}`, { status: 400 });
  }
  switch (event.type) {
    case 'checkout.session.completed':
    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed':
    case 'invoice.payment_succeeded':
      // No side effects yet; just acknowledge. Owner will wire fulfillment later.
      break;
    default:
      break;
  }
  return new Response('ok');
}
