 
 
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { type WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Helper function to sync user data to Prisma
async function syncUserToPrisma(userData: any, operation: 'create' | 'update') {
  try {
    const userId = userData.id;
    const email = userData.email_addresses?.[0]?.email_address || userData.email;
    const username = userData.username || `user_${userId.slice(-8)}`;
    const displayName =
      userData.first_name && userData.last_name
        ? `${userData.first_name} ${userData.last_name}`
        : userData.username || username;
    const avatarUrl = userData.profile_image_url || userData.image_url;

    if (!email || !userId) {
      console.error('Missing required user data:', { userId, email });
      return;
    }

    const userDataForPrisma = {
      email,
      username,
      display_name: displayName,
      avatarUrl,
      clerkId: userId,
      // Set NSFW affirmation if they have confirmed their age (18+)
      nsfwAffirmedAt: userData.public_metadata?.age_verified ? new Date() : null,
      nsfwEnabled: Boolean(userData.public_metadata?.age_verified),
    };

    if (operation === 'create') {
      await prisma.user.create({
        data: userDataForPrisma,
      });
      console.log(`✅ User created in Prisma: ${username} (${email})`);
    } else {
      await prisma.user.upsert({
        where: { clerkId: userId },
        update: userDataForPrisma,
        create: userDataForPrisma,
      });
      console.log(`✅ User updated in Prisma: ${username} (${email})`);
    }
  } catch (error) {
    console.error('Error syncing user to Prisma:', error);
    throw error;
  }
}

// Helper function to delete user from Prisma
async function deleteUserFromPrisma(userId: string) {
  try {
    if (!userId) {
      console.error('No user ID provided for deletion');
      return;
    }

    // Delete user and all related data (cascade will handle most relationships)
    const deletedUser = await prisma.user.delete({
      where: { clerkId: userId },
    });

    console.log(`✅ User deleted from Prisma: ${deletedUser.username} (${deletedUser.email})`);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      // User not found - this is okay, maybe they were already deleted
      console.log(`ℹ️ User with Clerk ID ${userId} not found in Prisma (already deleted?)`);
    } else {
      console.error('Error deleting user from Prisma:', error);
      throw error;
    }
  }
}

export async function POST(req: Request) {
  try {
    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json(
        {
          error: 'Missing svix headers',
        },
        { status: 400 },
      );
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Get webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('CLERK_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        {
          error: 'Webhook secret not configured',
        },
        { status: 500 },
      );
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json(
        {
          error: 'Webhook verification failed',
        },
        { status: 400 },
      );
    }

    // Handle the webhook
    const eventType = evt.type;

    // Safely extract user data
    const userData = evt.data as any;
    const userId = userData?.id;
    const email = userData?.email_addresses?.[0]?.email_address || userData?.email;

    console.log(`Received Clerk webhook: ${eventType}`, {
      userId,
      email,
      timestamp: new Date().toISOString(),
    });

    // For now, just log the events
    // In production, you would sync these to your database
    switch (eventType) {
      case 'user.created':
        console.log('User created:', userId);
        await syncUserToPrisma(userData, 'create');
        break;

      case 'user.updated':
        console.log('User updated:', userId);
        await syncUserToPrisma(userData, 'update');
        break;

      case 'user.deleted':
        console.log('User deleted:', userId);
        await deleteUserFromPrisma(userId);
        break;

      default:
        console.log('Unhandled webhook event:', eventType);
    }

    return NextResponse.json({
      success: true,
      message: `Webhook ${eventType} processed successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({
    message: 'Clerk webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
