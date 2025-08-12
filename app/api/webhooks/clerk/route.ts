import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Get the headers
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return NextResponse.json({ 
        error: 'Missing svix headers' 
      }, { status: 400 });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Get webhook secret from environment
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('CLERK_WEBHOOK_SECRET not configured');
      return NextResponse.json({ 
        error: 'Webhook secret not configured' 
      }, { status: 500 });
    }

    // Create a new Svix instance with your secret.
    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json({ 
        error: 'Webhook verification failed' 
      }, { status: 400 });
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
      timestamp: new Date().toISOString()
    });

    // For now, just log the events
    // In production, you would sync these to your database
    switch (eventType) {
      case 'user.created':
        console.log('User created:', userId);
        // TODO: Implement user sync to Supabase
        break;
        
      case 'user.updated':
        console.log('User updated:', userId);
        // TODO: Implement user sync to Supabase
        break;
        
      case 'user.deleted':
        console.log('User deleted:', userId);
        // TODO: Implement user cleanup in Supabase
        break;
        
      default:
        console.log('Unhandled webhook event:', eventType);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Webhook ${eventType} processed successfully`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({ 
    message: 'Clerk webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}
