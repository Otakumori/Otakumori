import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { env } from '@/env';
import { prisma } from '@/app/lib/prisma';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  requireLocalViewer,
} from '@/app/lib/auth/viewer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getStripeClient() {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
    typescript: true,
  });
}

/**
 * Confirms a checkout return against the authenticated local order and Stripe.
 * The client never receives authority to clear a cart from a query parameter.
 */
export async function GET(request: NextRequest) {
  try {
    const viewer = await requireLocalViewer();
    const sessionId = new URL(request.url).searchParams.get('session_id');

    if (!sessionId || sessionId.length > 255) {
      return NextResponse.json({ ok: false, error: 'Checkout session is required.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { stripeId: sessionId },
      select: {
        id: true,
        userId: true,
        displayNumber: true,
        status: true,
      },
    });

    // Respond with not-found for another user's order to avoid confirming that
    // a session exists to an unauthorized caller.
    if (!order || order.userId !== viewer.localUserId) {
      return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 });
    }

    if (!env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { ok: false, error: 'Checkout confirmation is temporarily unavailable.' },
        { status: 503 },
      );
    }

    const session = await getStripeClient().checkout.sessions.retrieve(sessionId);
    const isOwnedSession = session.client_reference_id === viewer.clerkUserId;
    const isCompletePayment = session.status === 'complete' && session.payment_status === 'paid';

    if (!isOwnedSession) {
      return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 });
    }

    if (!isCompletePayment) {
      return NextResponse.json(
        { ok: false, error: 'Payment is not confirmed yet.' },
        { status: 409 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        orderId: order.id,
        orderNumber: order.displayNumber,
        status: order.status,
      },
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof LocalUserUnavailableError) {
      return NextResponse.json(
        { ok: false, error: 'Checkout confirmation is temporarily unavailable.' },
        { status: 503 },
      );
    }

    const { logger } = await import('@/app/lib/logger');
    logger.error(
      '[checkout/confirmation] failed',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      { ok: false, error: 'Checkout confirmation is temporarily unavailable.' },
      { status: 503 },
    );
  }
}
