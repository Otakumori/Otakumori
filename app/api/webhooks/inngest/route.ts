// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { inngest } from '../../../../inngest/client';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// Handle Clerk webhooks and trigger Inngest functions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headersList = headers();

    // Verify webhook signature (implement proper verification)
    const signature = headersList.get('svix-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Parse the webhook event
    const eventType = body.type;
    const eventData = body.data;

    console.log(`Received webhook: ${eventType}`);

    // Route different webhook types to appropriate Inngest functions
    switch (eventType) {
      case 'user.created':
      case 'user.updated':
        // Trigger user sync function
        await inngest.send({
          name: 'clerk/user.created',
          data: eventData,
        });
        break;

      case 'order.created':
        // Trigger order processing
        await inngest.send({
          name: 'order/created',
          data: eventData,
        });
        break;

      case 'payment.succeeded':
        // Trigger payment processing
        await inngest.send({
          name: 'stripe/webhook',
          data: { type: 'payment_intent.succeeded', ...eventData },
        });
        break;

      case 'payment.failed':
        // Trigger failed payment handling
        await inngest.send({
          name: 'stripe/webhook',
          data: { type: 'payment_intent.payment_failed', ...eventData },
        });
        break;

      case 'inventory.low':
        // Trigger inventory sync
        await inngest.send({
          name: 'inventory/sync',
          data: eventData,
        });
        break;

      default:
        console.log(`Unhandled webhook type: ${eventType}`);
    }

    return NextResponse.json({
      success: true,
      message: `Webhook ${eventType} processed successfully`,
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({
    message: 'Inngest webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
