
import { logger } from '@/app/lib/logger';
import { type NextRequest } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { type WebhookEvent } from '@clerk/nextjs/server';
import { env } from '@/env';

export const dynamic = 'force-dynamic';

/**
 * Deprecated Clerk webhook endpoint.
 *
 * The canonical identity endpoint is /api/webhooks/clerk. Keep this route verified while the
 * live dashboard destination is audited, but do not perform provider writes from it.
 */

const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 });
  }
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);
  logger.warn(`Clerk webhook received: ${body.type}`);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET!);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    logger.error('Error verifying webhook', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  logger.warn('Deprecated Clerk webhook endpoint received event', undefined, { eventType });

  return new Response('Deprecated Clerk webhook endpoint; use /api/webhooks/clerk', {
    status: 202,
  });
}
