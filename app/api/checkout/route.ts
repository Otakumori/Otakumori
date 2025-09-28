// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { env } from '@/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, shipping_address } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    if (!shipping_address) {
      return NextResponse.json({ error: 'Shipping address required' }, { status: 400 });
    }

    // Calculate total and format line items for Stripe
    let total_cents = 0;
    const line_items = items.map((item: any) => {
      const price_cents = item.price_cents || 0;
      total_cents += price_cents * item.quantity;

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title,
            description: item.description || '',
            images: item.image_url ? [item.image_url] : [],
          },
          unit_amount: price_cents,
        },
        quantity: item.quantity,
      };
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/cart`,
      metadata: {
        clerk_user_id: userId,
        items: JSON.stringify(items),
        shipping_address: JSON.stringify(shipping_address),
        total_cents: total_cents.toString(),
      },
      customer_email: shipping_address.email,
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'DE', 'FR', 'JP', 'AU'], // Add more as needed
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 500, // $5.00 shipping
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
                value: 7,
              },
            },
          },
        },
      ],
    });

    return NextResponse.json({
      session_id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
