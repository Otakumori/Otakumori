
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { db } from '@/lib/db';

export const runtime = 'nodejs'; // HMAC + raw body requires Node

async function verifySignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined,
) {
  if (!secret || !signatureHeader?.startsWith('sha256=')) return false;
  try {
    const crypto = await import('node:crypto');
    const expected = Buffer.from(
      `sha256=${crypto.createHmac('sha256', secret).update(rawBody).digest('hex')}`,
    );
    const received = Buffer.from(signatureHeader);
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const requestId = newRequestId();
  const route = '/api/webhooks/printify';
  let claimedEventId: string | null = null;

  try {
    const raw = await req.text();

    const signature = req.headers.get('x-pfy-signature');

    const ok = await verifySignature(raw, signature, env.PRINTIFY_WEBHOOK_SECRET);
    if (!ok) {
      logger.warn('signature verification failed', undefined, { requestId, route });
      return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 });
    }

    let payload: any;
    try {
      payload = JSON.parse(raw);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error(
        'invalid json',
        { requestId, route, extra: { parseError: error.message, rawSnippet: raw.slice(0, 200) } },
        undefined,
        error,
      );
      return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
    }

    const topic = payload?.type;
    const providerOrderId = payload?.resource?.id;
    const resourceData = payload?.resource?.data ?? {};
    if (!payload?.id || !topic || !providerOrderId) {
      return NextResponse.json({ ok: false, error: 'invalid payload' }, { status: 400 });
    }

    const eventId = `printify:${payload.id}`;
    try {
      await db.webhookEvent.create({
        data: {
          id: eventId,
          type: topic,
          payload: { processingStatus: 'processing', object: payload },
        },
      });
    } catch (error) {
      const existing = await db.webhookEvent.findUnique({
        where: { id: eventId },
      });
      if (!existing) throw error;
      const existingPayload = existing.payload as { processingStatus?: string } | null;
      if (existingPayload?.processingStatus === 'completed') {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      if (
        existingPayload?.processingStatus === 'processing' &&
        Date.now() - existing.updatedAt.getTime() < 5 * 60 * 1000
      ) {
        return NextResponse.json({ ok: false, retry: true }, { status: 409 });
      }
      await db.webhookEvent.update({
        where: { id: eventId },
        data: { payload: { processingStatus: 'processing', object: payload, retry: true } },
      });
    }
    claimedEventId = eventId;

    const isOrderTopic = topic.startsWith('order:');
    const sync = isOrderTopic
      ? await db.printifyOrderSync.findFirst({ where: { printifyOrderId: providerOrderId } })
      : null;
    if (isOrderTopic && !sync) {
      logger.warn('Printify webhook has no local order mapping', undefined, {
        requestId,
        route,
        providerOrderId,
      });
      await db.webhookEvent.update({
        where: { id: eventId },
        data: { payload: { processingStatus: 'completed', object: payload, unmatched: true } },
      });
      return NextResponse.json({ ok: true, unmatched: true });
    }
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
        break;
      case 'order:sent-to-production':
        if (!sync) throw new Error('Missing Printify order mapping');
        logger.info('order sent to production', {
          requestId,
          route,
          extra: { orderId: providerOrderId },
        });
        await db.$transaction([
          db.printifyOrderSync.update({
            where: { localOrderId: sync.localOrderId },
            data: { status: 'in-production', error: null, lastSyncAt: new Date() },
          }),
          db.order.update({
            where: { id: sync.localOrderId },
            data: { status: 'in_production' },
          }),
        ]);
        break;
      case 'order:updated':
        if (!sync) throw new Error('Missing Printify order mapping');
        await db.printifyOrderSync.update({
          where: { localOrderId: sync.localOrderId },
          data: {
            status: String(resourceData.status ?? 'updated'),
            lastSyncAt: new Date(),
          },
        });
        break;
      case 'order:shipment:created':
        if (!sync) throw new Error('Missing Printify order mapping');
        logger.info('shipment created', { requestId, route, extra: { orderId: providerOrderId } });
        await db.$transaction([
          db.printifyOrderSync.update({
            where: { localOrderId: sync.localOrderId },
            data: { status: 'shipped', error: null, lastSyncAt: new Date() },
          }),
          db.order.update({
            where: { id: sync.localOrderId },
            data: {
              status: 'shipped',
              shippedAt: resourceData.shipped_at ? new Date(resourceData.shipped_at) : new Date(),
              carrier: resourceData.carrier?.code ?? null,
              trackingNumber: resourceData.carrier?.tracking_number ?? null,
              trackingUrl: resourceData.carrier?.tracking_url ?? null,
            },
          }),
        ]);
        break;
      case 'order:shipment:delivered':
        logger.info('shipment delivered', {
          requestId,
          route,
          extra: { orderId: providerOrderId },
        });
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

    await db.webhookEvent.update({
      where: { id: eventId },
      data: { payload: { processingStatus: 'completed', object: payload } },
    });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (claimedEventId) {
      await db.webhookEvent
        .update({
          where: { id: claimedEventId },
          data: {
            payload: {
              processingStatus: 'failed',
              error: error instanceof Error ? error.message.slice(0, 500) : 'unknown',
            },
          },
        })
        .catch(() => undefined);
    }
    logger.error(
      'webhook handler error',
      { requestId, route },
      { error: error?.message || String(error) },
    );
    return NextResponse.json({ ok: false, error: 'internal error' }, { status: 500 });
  }
}
