import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db as prisma } from '@/lib/db';

const WEBHOOK_SECRET = process.env.MERCHIZE_WEBHOOK_SECRET!;

function verifySignature(signature: string | null, rawBody: string) {
  if (!signature) return false;

  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return signature === expected;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('merchize-webhook-key');

  if (!verifySignature(signature, rawBody)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const { type, data } = event;

    switch (type) {
      case 'order_created':
        await prisma.order.updateMany({
          where: { externalVendorId: data.id },
          data: { vendor: 'merchize', vendorStatus: 'created' }
        });
        break;

      case 'order_changed_progress':
        await prisma.order.updateMany({
          where: { externalVendorId: data.id },
          data: { vendorStatus: data.status }
        });
        break;

      case 'order_changed_tracking':
        await prisma.order.updateMany({
          where: { externalVendorId: data.id },
          data: { trackingNumber: data.tracking_number }
        });
        break;

      case 'order_invalid_address':
        await prisma.order.updateMany({
          where: { externalVendorId: data.id },
          data: { vendorStatus: 'address_issue' }
        });
        break;

      case 'order_importer_error':
        await prisma.order.updateMany({
          where: { externalVendorId: data.id },
          data: { vendorStatus: 'failed' }
        });
        break;

      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Merchize webhook error', err);
    return NextResponse.json({ ok: true });
  }
}
