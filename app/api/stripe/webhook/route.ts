import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { grantPetalsForOrder } from '@/lib/runes';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing stripe signature',
        },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    if (!env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Webhook secret not configured',
        },
        { status: 500 }
      );
    }

    try {
      event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid signature',
        },
        { status: 400 }
      );
    }

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (!session.metadata?.clerkUserId) {
        console.error('Missing clerkUserId in session metadata');
        return NextResponse.json(
          {
            ok: false,
            error: 'Missing user ID',
          },
          { status: 400 }
        );
      }

      // Get user from Clerk ID
      const user = await db.user.findUnique({
        where: { clerkId: session.metadata.clerkUserId },
      });

      if (!user) {
        console.error('User not found for clerk ID:', session.metadata.clerkUserId);
        return NextResponse.json(
          {
            ok: false,
            error: 'User not found',
          },
          { status: 404 }
        );
      }

      // Get line items with UPCs
      const lineItems = session.line_items?.data || [];
      const itemsWithUPCs = lineItems.map(item => ({
        id: item.id || '',
        name: item.description || 'Unknown Item',
        quantity: item.quantity || 1,
        unitAmount: item.amount_total || 0,
        upc: item.price?.metadata?.upc,
        printifyProductId: item.price?.metadata?.printifyProductId,
        printifyVariantId: item.price?.metadata?.printifyVariantId
          ? parseInt(item.price.metadata.printifyVariantId)
          : undefined,
        productId: item.price?.metadata?.productId || 'unknown',
        productVariantId: item.price?.metadata?.productVariantId || 'unknown',
        sku: item.price?.metadata?.sku || 'unknown',
      }));

      // Calculate subtotal
      const subtotalCents = Math.round((session.amount_total || 0) / 100);

      // Grant petals and get runes
      const petalResult = await grantPetalsForOrder({
        userId: user.id,
        stripeId: session.id,
        subtotalCents,
        lineItems: itemsWithUPCs,
      });

      // Create order record
      const order = await db.order.create({
        data: {
          id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          stripeId: session.id,
          status: 'pending',
          totalAmount: subtotalCents,
          subtotalCents,
          petalsAwarded: petalResult.granted,
          paidAt: new Date(),
          updatedAt: new Date(),
          OrderItem: {
            create: itemsWithUPCs.map(item => ({
              id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              productId: item.productId || 'unknown',
              productVariantId: item.productVariantId || 'unknown',
              sku: item.sku || 'unknown',
              name: item.name,
              quantity: item.quantity,
              unitAmount: item.unitAmount,
              upc: item.upc,
              printifyProductId: item.printifyProductId,
              printifyVariantId: item.printifyVariantId,
            })),
          },
        },
      });

      // Create user runes for this order
      if (petalResult.runes.length > 0) {
        for (const runeId of petalResult.runes) {
          const runeDef = await db.runeDef.findUnique({
            where: { canonicalId: runeId },
          });

          if (runeDef) {
            await db.userRune.create({
              data: {
                id: `rune_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: user.id,
                runeId: runeDef.id,
                orderId: order.id,
                acquiredAt: new Date(),
              },
            });
          }
        }
      }

      // Update user's petal balance
      await db.user.update({
        where: { id: user.id },
        data: { petalBalance: user.petalBalance + petalResult.granted },
      });

      // Create petal ledger entry
      await db.petalLedger.create({
        data: {
          id: `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          type: 'purchase_bonus',
          amount: petalResult.granted,
          reason: 'order_completion',
        },
      });

      // Log email (placeholder for actual email sending)
      await db.emailLog.create({
        data: {
          id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          orderId: order.id,
          to: user.email || '',
          provider: 'resend',
          template: 'order_confirmation',
          status: 'pending',
          meta: {
            petalsAwarded: petalResult.granted,
            runesCount: petalResult.runes.length,
            combosCount: petalResult.combos.length,
          },
          sentAt: new Date(),
        },
      });

      console.log(
        `Order processed: ${order.id}, Petals: ${petalResult.granted}, Runes: ${petalResult.runes.length}`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
