import crypto from 'crypto';
import { type NextRequest, NextResponse } from 'next/server';
import { generateRequestId } from '@/app/lib/api-contracts';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

const WEBHOOK_SECRET = env.MERCHIZE_WEBHOOK_SECRET;

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

function coerceString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

function truncate(value: string | null, maxLength = 80) {
  if (!value) return null;
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const rawBody = await req.text();
  const webhookKey = req.headers.get('merchize-webhook-key');

  if (!verifyWebhookKey(webhookKey)) {
    const { logger } = await import('@/app/lib/logger');
    logger.warn('Merchize webhook rejected', {
      requestId,
      route: '/api/webhooks/merchize',
      extra: { reason: WEBHOOK_SECRET ? 'invalid_key' : 'missing_secret' },
    });
    return NextResponse.json(
      { ok: false, error: 'Invalid webhook key', requestId },
      { status: 401 },
    );
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON', requestId }, { status: 400 });
  }

  if (!event || typeof event !== 'object' || Array.isArray(event)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid webhook payload', requestId },
      { status: 400 },
    );
  }

  const record = event as Record<string, unknown>;
  const eventType =
    coerceString(record.type) ?? coerceString(record.event) ?? coerceString(record.name);
  const data =
    record.data && typeof record.data === 'object' && !Array.isArray(record.data)
      ? (record.data as Record<string, unknown>)
      : record.order && typeof record.order === 'object' && !Array.isArray(record.order)
        ? (record.order as Record<string, unknown>)
        : record.payload && typeof record.payload === 'object' && !Array.isArray(record.payload)
          ? (record.payload as Record<string, unknown>)
          : {};
  const merchizeOrderId =
    coerceString(data.id) ?? coerceString(data.order_id) ?? coerceString(data.orderId);

  const { logger } = await import('@/app/lib/logger');
  logger.info('Merchize webhook verified in read-only mode', {
    requestId,
    route: '/api/webhooks/merchize',
    extra: {
      eventType: truncate(eventType),
      hasMerchizeOrderId: Boolean(merchizeOrderId),
      action: 'accepted_noop',
    },
  });

  return NextResponse.json(
    {
      ok: true,
      requestId,
      status: 'accepted_noop',
      message:
        'Merchize webhook verified. Order mutation is disabled until provider-neutral order mapping is implemented.',
    },
    { status: 202 },
  );
}
