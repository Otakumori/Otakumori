// Compatibility endpoint only. All Stripe events use the canonical verified,
// deduplicated payment and fulfillment handler.
export { POST } from '@/app/api/webhooks/stripe/route';

export const runtime = 'nodejs';
