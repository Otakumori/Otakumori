 
 
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { env } from '@/env';
import { db } from '@/app/lib/db';
import { withRateLimit, rateLimitConfigs } from '@/app/lib/rateLimit';

export const runtime = 'nodejs';
export const maxDuration = 10;

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  return withRateLimit(req, rateLimitConfigs.auth, async () => {
    try {
      const { userId  } = await auth();
      if (!userId) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
      }

      const { items, successUrl, cancelUrl, shippingInfo } = await req.json();

      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ ok: false, error: 'Invalid items' }, { status: 400 });
      }

      // Get user from database
      const user = await db.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
      }

      // Calculate totals
      const subtotalCents = items.reduce(
        (sum: number, item: any) => sum + item.priceCents * item.quantity,
        0,
      );
      const totalAmount = subtotalCents;

      // Create order in database first
      const order = await db.order.create({
        data: {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          stripeId: `temp_${Date.now()}`, // Temporary ID, will be updated
          totalAmount,
          subtotalCents,
          currency: 'USD',
          status: 'pending',
          primaryItemName: items[0]?.name || 'Order',
          label: `Order for ${shippingInfo?.firstName || user.display_name || user.username}`,
          updatedAt: new Date(),
        },
      });

      // Create order items
      for (const item of items) {
        await db.orderItem.create({
          data: {
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            orderId: order.id,
            productId: item.productId,
            productVariantId: item.variantId,
            sku: item.sku || `SKU-${item.productId}`,
            name: item.name,
            quantity: item.quantity,
            unitAmount: item.priceCents,
            printifyProductId: item.printifyProductId,
            printifyVariantId: item.printifyVariantId,
          },
        });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name || `Item ${item.sku}`,
              description: item.description,
              images: item.images || [],
            },
            unit_amount: item.priceCents,
          },
          quantity: item.quantity,
        })),
        mode: 'payment',
        success_url:
          successUrl ||
          `${env.NEXT_PUBLIC_SITE_URL}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${env.NEXT_PUBLIC_SITE_URL}/shop/cart`,
        metadata: {
          userId,
          orderId: order.id,
          orderNumber: order.displayNumber.toString(),
        },
        customer_email: shippingInfo?.email || user.email,
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP'],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 500, // $5.00
                currency: 'usd',
              },
              display_name: 'Standard shipping',
              delivery_estimate: {
                minimum: {
                  unit: 'business_day',
                  value: 5,
                },
                maximum: {
                  unit: 'business_day',
                  value: 10,
                },
              },
            },
          },
        ],
      });

      // Update order with Stripe session ID
      await db.order.update({
        where: { id: order.id },
        data: {
          stripeId: session.id,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        ok: true,
        data: {
          url: session.url,
          orderId: order.id,
          orderNumber: order.displayNumber,
        },
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
    }
  });
}
