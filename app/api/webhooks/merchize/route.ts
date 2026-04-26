import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db as prisma } from '@/lib/db';

const WEBHOOK_SECRET = process.env.MERCHIZE_WEBHOOK_SECRET;

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyWebhookKey(webhookKey: string | null) {
  if (!WEBHOOK_SECRET || !webhookKey) return false;
  return safeCompare(webhookKey, WEBHOOK_SECRET);
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookKey = req.headers.get('merchize-webhook-key');

  if (!verifyWebhookKey(webhookKey)) {
    return NextResponse.json({ error: 'Invalid webhook key' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const eventType = event.type ?? event.event ?? event.name;
    const data = event.data ?? event.order ?? event.payload ?? {};
    const merchizeOrderId = String(data.id ?? data.order_id ?? data.orderId ?? '');

    console.log('Merchize webhook received:', {
      eventType,
      merchizeOrderId,
    });

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
  } catch (err) {
    console.error('Merchize webhook error:', err);
    return NextResponse.json({ ok: true });
  }
}
