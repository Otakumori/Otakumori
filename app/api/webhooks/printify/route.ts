// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';

export const runtime = 'nodejs'; // HMAC + raw body requires Node

// Placeholder HMAC verification — replace with Printify's official algorithm + header names
async function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
) {
  if (!secret) return true; // allow when not configured (dev)
  if (!signatureHeader) return false;
  try {
    const crypto = await import('node:crypto');
    const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    return hmac === signatureHeader;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  const route = '/api/webhooks/printify';

  try {
    const raw = await req.text();

    const signature =
      req.headers.get('x-printify-webhook-signature') ||
      req.headers.get('x-printify-signature') ||
      req.headers.get('x-hmac-signature');

    const ok = await verifySignature(raw, signature, env.PRINTIFY_WEBHOOK_SECRET);
    if (!ok) {
      logger.warn('signature verification failed', { requestId, route });
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch (_e) {
      logger.error('invalid json', { requestId, route }, { rawSnippet: raw.slice(0, 200) });
      return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
    }

    const topic = req.headers.get('x-printify-topic') || payload?.type || payload?.event;
    logger.info('webhook received', { requestId, route, extra: { topic } });

    // Use advanced service for webhook handling
    const { getAdvancedPrintifyService } = await import('@/app/lib/printify/advanced-service');
    const advancedService = getAdvancedPrintifyService();

    // Handle webhook event with advanced service for caching and analytics
    await advancedService.handleWebhookEvent({
      type: topic,
      data: payload.data || payload,
      timestamp: payload.created_at || new Date().toISOString(),
    });

    switch (topic) {
      case 'order:created':
        logger.info('order created', { requestId, route, extra: { orderId: payload.data?.id } });
        // TODO: implement your order sync logic here
        break;
      case 'order:sent_to_production':
        logger.info('order sent to production', {
          requestId,
          route,
          extra: { orderId: payload.data?.id },
        });
        break;
      case 'order:shipment_created':
        logger.info('shipment created', { requestId, route, extra: { orderId: payload.data?.id } });
        break;
      case 'order:shipment_delivered':
        logger.info('shipment delivered', {
          requestId,
          route,
          extra: { orderId: payload.data?.id },
        });
        break;
      case 'order:cancelled':
        logger.info('order cancelled', { requestId, route, extra: { orderId: payload.data?.id } });
        break;
      case 'product:updated':
        logger.info('product updated', {
          requestId,
          route,
          extra: { productId: payload.data?.id },
        });
        break;
      case 'inventory:updated':
        logger.info('inventory updated', {
          requestId,
          route,
          extra: { productId: payload.data?.id },
        });
        break;
      default:
        logger.warn('unhandled topic', { requestId, route, extra: { topic } });
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    logger.error(
      'webhook handler error',
      { requestId, route },
      { error: error?.message || String(error) },
    );
    return NextResponse.json({ ok: false, error: 'internal error' }, { status: 500 });
  }
}
