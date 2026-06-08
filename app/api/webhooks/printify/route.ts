
import { createHmac, timingSafeEqual } from 'node:crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';

export const runtime = 'nodejs'; // HMAC + raw body requires Node

/**
 * Compare two hex digests in constant time. Returns false on length mismatch
 * (timingSafeEqual throws when the buffers differ in length).
 */
function timingSafeHexEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

/**
 * Verify the Printify webhook HMAC signature.
 *
 * Fails closed: a missing/invalid signature returns false. The secret is
 * required by the caller before this runs, so it is always present here.
 */
function verifySignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false;
  const hmac = createHmac('sha256', secret).update(rawBody).digest('hex');
  return timingSafeHexEqual(hmac, signatureHeader);
}

export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  const route = '/api/webhooks/printify';

  try {
    const raw = await req.text();

    // Fail closed when the webhook secret is not configured.
    const secret = env.PRINTIFY_WEBHOOK_SECRET;
    if (!secret) {
      logger.error('webhook secret not configured', { requestId, route });
      return NextResponse.json(
        { ok: false, error: 'WEBHOOK_SECRET_NOT_CONFIGURED' },
        { status: 503 },
      );
    }

    const signature =
      req.headers.get('x-printify-webhook-signature') ||
      req.headers.get('x-printify-signature') ||
      req.headers.get('x-hmac-signature');

    const ok = verifySignature(raw, signature, secret);
    if (!ok) {
      logger.warn('signature verification failed', undefined, { requestId, route });
      return NextResponse.json({ ok: false, error: 'INVALID_SIGNATURE' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      // Never log the raw body — it may contain provider/customer data.
      logger.error(
        'invalid json',
        { requestId, route, extra: { parseError: error.message } },
        undefined,
        error,
      );
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
        // Trigger product sync via Inngest
        try {
          const { inngest } = await import('@/inngest/client');
          await inngest.send({
            name: 'printify/product-changed',
            data: { productId: payload.data?.id },
          });
          logger.info('product sync triggered', {
            requestId,
            route,
            extra: { productId: payload.data?.id },
          });
        } catch (error) {
          logger.error('failed to trigger product sync', undefined, {
            requestId,
            route,
            extra: { productId: payload.data?.id, error: String(error) },
          }, undefined);
        }
        break;
      case 'inventory:updated':
        logger.info('inventory updated', {
          requestId,
          route,
          extra: { productId: payload.data?.id },
        });
        break;
      default:
        logger.warn('unhandled topic', undefined, { requestId, route, extra: { topic } });
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
