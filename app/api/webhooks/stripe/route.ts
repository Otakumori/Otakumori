import { type NextRequest } from 'next/server';
import { stripe } from '@/app/lib/stripe';
import { env } from '@/env.mjs';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const raw = await req.text(); // important: raw body
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig!, env.STRIPE_WEBHOOK_SECRET);
  } catch (e: any) {
    return new Response(`Invalid signature: ${e.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // TODO: mark order paid, send email, etc.
      console.log('Checkout session completed:', event.data.object.id);
      break;
    case 'payment_intent.succeeded':
      console.log('Payment intent succeeded:', event.data.object.id);
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment intent failed:', event.data.object.id);
      break;
    case 'invoice.payment_succeeded':
      console.log('Invoice payment succeeded:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
      break;
  }
  return new Response('ok');
}

export const config = { api: { bodyParser: false } } as any;
