// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  StripeCheckoutSessionSchema,
  StripePaymentIntentSchema,
} from '@/lib/api/stripe';
import { db } from '@/lib/db';
import { logger } from '@/app/lib/logger';
import {
  printifyService,
  type PrintifyOrderData,
  type PrintifyShippingAddress,
} from '@/app/lib/printify';
import { env } from '@/env';
import { petalService } from '@/app/lib/petals';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    console.error('Missing Stripe signature header');
    return new NextResponse('Missing signature', { status: 400 });
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  try {
    // Verify webhook signature
    const event = await verifyWebhookSignature(body, signature, env.STRIPE_WEBHOOK_SECRET);

    // Processing Stripe webhook

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = parseWebhookEvent(event, StripeCheckoutSessionSchema);
        // Checkout completed

        // Update order status and create Printify order
        await handleCheckoutCompleted(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = parseWebhookEvent(event, StripePaymentIntentSchema);
        console.warn('Payment succeeded:', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
        });
        // Update order status if needed
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = parseWebhookEvent(event, StripePaymentIntentSchema);
        console.error('Payment failed:', {
          paymentIntentId: failedPayment.id,
          lastPaymentError: failedPayment.last_payment_error,
        });
        // Update order status to failed
        break;

      default:
      // Unhandled event type
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);

    if (error instanceof Error && error.message.includes('signature verification failed')) {
      return new NextResponse('Invalid signature', { status: 400 });
    }

    return new NextResponse(
      `Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 500 },
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  try {
    // Get order from database using Stripe session ID
    const order = await db.order.findFirst({
      where: { stripeId: session.id },
      include: {
        OrderItem: {
          include: {
            Product: true,
            ProductVariant: true,
          },
        },
      },
    });

    if (!order) {
      console.error(`Order not found for Stripe session: ${session.id}`);
      return;
    }

    // Update order status to pending_mapping (next step in workflow)
    await db.order.update({
      where: { id: order.id },
      data: {
        status: 'pending_mapping',
        paidAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Create Printify order (simulated for now)
    await createPrintifyOrder(order);

    // Award petals for purchase using the petal service
    if (session.amount_total > 0) {
      const petalResult = await petalService.awardPurchaseBonus(
        order.userId,
        order.id,
        session.amount_total,
        session.id,
      );

      if (petalResult.success) {
        logger.info('Purchase bonus awarded successfully', {
          extra: {
            orderId: order.id,
            userId: order.userId,
            amount: session.amount_total,
            petalsAwarded: petalResult.awarded,
            newBalance: petalResult.newBalance,
          },
        });
      } else {
        logger.error('Failed to award purchase bonus', {
          extra: {
            orderId: order.id,
            userId: order.userId,
            error: petalResult.error,
          },
        });
      }
    }

    logger.info('Order completed successfully', {
      extra: {
        orderId: order.id,
        amount: session.amount_total,
      },
    });
  } catch (error) {
    console.error('Error handling checkout completed:', error);
    logger.error(
      'Webhook error processing checkout.session.completed',
      {
        extra: {
          event: 'checkout.session.completed',
        },
      },
      error as Error,
    );
  }
}

async function createPrintifyOrder(order: any) {
  try {
    logger.info('Printify order creation started', {
      extra: {
        orderId: order.id,
        itemCount: order.OrderItem.length,
        total: order.totalAmount,
      },
    });

    // Get shipping address from order metadata or use defaults
    // In a real implementation, this would come from the checkout form
    const shippingAddress: PrintifyShippingAddress = {
      first_name: 'Customer', // TODO: Extract from order metadata
      last_name: 'Name',
      email: 'customer@example.com', // TODO: Extract from order metadata
      country: 'US',
      region: 'CA',
      city: 'San Francisco',
      zip: '94102',
      address1: '123 Main St',
      address2: '',
    };

    const printifyOrderData: PrintifyOrderData = {
      external_id: order.id,
      label: `Order #${order.displayNumber}`,
      line_items: order.OrderItem.map((item: any) => ({
        printify_product_id: item.printifyProductId,
        printify_variant_id: item.printifyVariantId,
        quantity: item.quantity,
      })),
      shipping_method: 1, // Standard shipping
      send_shipping_notification: true,
      address_to: shippingAddress,
    };

    // Create the order in Printify
    const printifyOrder = await printifyService.createOrder(printifyOrderData);

    // Update the order with Printify information
    await db.order.update({
      where: { id: order.id },
      data: {
        status: 'in_production',
        updatedAt: new Date(),
        // TODO: Add printifyOrderId field to schema if needed
      },
    });

    logger.info('Printify order created successfully', {
      extra: {
        orderId: order.id,
        printifyOrderId: printifyOrder.id,
        status: printifyOrder.status,
      },
    });

    return printifyOrder;
  } catch (error) {
    console.error('Error creating Printify order:', error);
    logger.error(
      'Printify order creation failed',
      {
        extra: {
          orderId: order.id,
        },
      },
      error as Error,
    );

    // Update order status to indicate Printify failure
    await db.order.update({
      where: { id: order.id },
      data: {
        status: 'pending_mapping', // Keep in pending state for manual review
        updatedAt: new Date(),
      },
    });

    throw error;
  }
}
