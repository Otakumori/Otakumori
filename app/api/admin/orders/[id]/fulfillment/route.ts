import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/app/lib/auth/admin';
import { db } from '@/lib/db';
import { stripe } from '@/app/lib/stripe';
import { createPrintifyOrder } from '@/lib/fulfillment/printify';

export const runtime = 'nodejs';

const RetrySchema = z.object({
  action: z.literal('retry'),
  confirmation: z.literal('RETRY PRINTIFY FULFILLMENT'),
});

const RETRYABLE_STATUSES = new Set(['failed', 'mapping_failed', 'no_items']);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();

    const parsed = RetrySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Explicit fulfillment retry confirmation is required.' },
        { status: 400 },
      );
    }

    const { id } = await params;
    const order = await db.order.findUnique({
      where: { id },
      include: { PrintifyOrderSync: true },
    });
    if (!order) {
      return NextResponse.json({ ok: false, error: 'Order not found.' }, { status: 404 });
    }
    if (!order.paidAt) {
      return NextResponse.json(
        { ok: false, error: 'Unpaid orders cannot be submitted for fulfillment.' },
        { status: 409 },
      );
    }
    if (!order.PrintifyOrderSync || !RETRYABLE_STATUSES.has(order.PrintifyOrderSync.status)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Fulfillment is not safely retryable. Reconcile in-progress or uncertain provider submissions first.',
        },
        { status: 409 },
      );
    }

    const session = await stripe.checkout.sessions.retrieve(order.stripeId);
    const result = await createPrintifyOrder(order.id, session, { allowRetry: true });
    return NextResponse.json(result, { status: result.ok ? 200 : 409 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json({ ok: false, error: 'Forbidden.' }, { status: 403 });
    }
    return NextResponse.json(
      { ok: false, error: 'Fulfillment recovery failed closed.' },
      { status: 500 },
    );
  }
}
