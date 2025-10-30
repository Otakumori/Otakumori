import { type NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { env } from '@/env.mjs';
import { db } from '@/lib/db';
import { type WebhookEvent } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await request.text();
  const body = JSON.parse(payload);
  
  // Log webhook event type for debugging
  console.warn('Clerk webhook payload type:', body.type || 'unknown');

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      // Create user profile in database
      await db.user.create({
        data: {
          id: id,
          email: email_addresses[0]?.email_address || '',
          username: `user_${id.slice(0, 8)}`,
          display_name: `${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous',
          avatarUrl: image_url || null,
          clerkId: id,
          visibility: 'PUBLIC',
          createdAt: new Date(),
        },
      });

    const updateData: any = {};
    if (userData.email) updateData.email = userData.email;
    if (userData.username) updateData.username = userData.username;
    if (userData.firstName && userData.lastName) {
      updateData.display_name = `${userData.firstName} ${userData.lastName}`;
    }
    if (userData.imageUrl) updateData.avatarUrl = userData.imageUrl;

    const createData: any = {
      clerkId: u.id,
      email: userData.email || '',
      username: userData.username || `user_${u.id.slice(0, 8)}`,
      wallet: { create: { petals: 0, runes: 0 } },
      profile: { create: {} },
    };
    if (userData.firstName && userData.lastName) {
      createData.display_name = `${userData.firstName} ${userData.lastName}`;
    }
    if (userData.imageUrl) createData.avatarUrl = userData.imageUrl;

    await prisma.user.upsert({
      where: { clerkId: u.id },
      update: updateData,
      create: createData,
    });

    return NextResponse.json({ ok: true });
  }

  // Email updates (keep primary email in sync)
  if (type === 'email.created' || type === 'email.updated') {
    const u = evt.data as ClerkUser;
    const email = getPrimaryEmail(u);
    if (email) {
      await prisma.user
        .update({
          where: { clerkId: u.id },
          data: { email },
        })
        .catch(() => {});
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    try {
      // Update user profile in database
      await db.user.update({
        where: { id },
        data: {
          email: email_addresses[0]?.email_address || '',
          display_name: `${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous',
          avatarUrl: image_url || null,
        },
      });

      // `User profile updated for ${id}`
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Soft delete user profile
      await db.user.update({
        where: { id },
        data: {
          visibility: 'PRIVATE',
        },
      });

      // `User profile soft deleted for ${id}`
    } catch (error) {
      console.error('Error soft deleting user profile:', error);
    }
  }

  return new NextResponse('', { status: 200 });
}
