import { type NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db as prisma } from '@/lib/db';
import { env } from '@/env/server';

export const runtime = 'nodejs';

type MerchizeWebhookEvent = {
  type?: string;
  event?: string;
  name?: string;
  data?: Record<string, unknown>;
  order?: Record<string, unknown>;
  payload?: Record<string, unknown>;
};

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyWebhookKey(webhookKey: string | null) {
  const webhookSecret = env.MERCHIZE_WEBHOOK_SECRET;
  if (!webhookSecret || !webhookKey) return false;
  return safeCompare(webhookKey, webhookSecret);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookKey = req.headers.get('merchize-webhook-key');

  if (!verifyWebhookKey(webhookKey)) {
    return NextResponse.json({ error: 'Invalid webhook key' }, { status: 401 });
  }

  let event: MerchizeWebhookEvent;
  try {
    event = JSON.parse(rawBody) as MerchizeWebhookEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const eventType = event.type ?? event.event ?? event.name;
    const data = asRecord(event.data ?? event.order ?? event.payload);
    const merchizeOrderId = String(data.id ?? data.order_id ?? data.orderId ?? '');

    if (eventType === 'order_changed_tracking' && merchizeOrderId) {
      const trackingNumber = data.tracking_number ?? data.trackingNumber;
      if (trackingNumber) {
        await prisma.order.updateMany({
          where: { printifyId: merchizeOrderId },
          data: { trackingNumber: String(trackingNumber) },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error('Merchize webhook error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: true, degraded: true });
  }
}
