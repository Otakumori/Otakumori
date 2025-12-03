
import { logger } from '@/app/lib/logger';
import { type NextRequest } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { type WebhookEvent } from '@clerk/nextjs/server';
import { env } from '@/env';

export const dynamic = 'force-dynamic';

/**
 * Clerk webhook handler
 * Sets default avatar presets for new users
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

  if (eventType === 'user.created') {
    const { id, email_addresses, public_metadata } = evt.data;
    logger.warn(`Creating user ${id} with ${email_addresses?.length || 0} email addresses`);

    // New user created

    // Set default avatar preset if not already set
    if (!public_metadata?.avatarPreset) {
      try {
        // Import Clerk client dynamically to avoid issues
        const { clerkClient } = await import('@clerk/nextjs/server');

        // Set a default avatar preset
        const defaultPreset = {
          gender: 'female',
          hair: 'long',
          hairColor: 'pink',
          eyes: 'blue',
          skin: 'fair',
          outfit: 'casual',
          accessories: [],
        };

        const client = await clerkClient();
        await client.users.updateUserMetadata(id, {
          publicMetadata: {
            ...public_metadata,
            avatarPreset: defaultPreset,
            joinedAt: new Date().toISOString(),
          },
        });

        // Set default avatar preset for user
      } catch (error) {
        logger.error('Error setting avatar preset', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        // Don't fail the webhook if avatar preset setting fails
      }
    }
  }

  if (eventType === 'user.updated') {
    const { id, public_metadata } = evt.data;
    logger.warn(`Updating user ${id} metadata`);
    // User updated

    // Log avatar preset changes for debugging
    if (public_metadata?.avatarPreset) {
      // Avatar preset updated for user
    }
  }

  return new Response('', { status: 200 });
}
