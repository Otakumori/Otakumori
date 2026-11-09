import crypto from 'node:crypto';
import { env } from '@/env.mjs';

const MAX_WEBHOOK_AGE_MS = 60_000;
const MAX_FUTURE_SKEW_MS = 30_000;
const SIGNATURE_PREFIX = 'hmac-sha256-hex=';

function unauthorized() {
  return Response.json({ ok: false, error: 'EASYPOST_WEBHOOK_UNAUTHORIZED' }, { status: 401 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = env.EASYPOST_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: 'EASYPOST_WEBHOOK_UNAVAILABLE' }, { status: 503 });
  }

  const timestamp = req.headers.get('x-timestamp');
  const signedPath = req.headers.get('x-path');
  const signatureHeader = req.headers.get('x-hmac-signature-v2');
  const requestPath = new URL(req.url).pathname;

  if (!timestamp || !signedPath || !signatureHeader || signedPath !== requestPath) {
    return unauthorized();
  }

  const timestampMs = Date.parse(timestamp);
  const ageMs = Date.now() - timestampMs;
  if (!Number.isFinite(timestampMs) || ageMs > MAX_WEBHOOK_AGE_MS || ageMs < -MAX_FUTURE_SKEW_MS) {
    return unauthorized();
  }

  const normalizedSignature = signatureHeader.toLowerCase();
  if (!normalizedSignature.startsWith(SIGNATURE_PREFIX)) {
    return unauthorized();
  }

  const receivedHex = normalizedSignature.slice(SIGNATURE_PREFIX.length);
  if (!/^[a-f0-9]{64}$/.test(receivedHex)) {
    return unauthorized();
  }

  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}${req.method.toUpperCase()}${signedPath}${raw}`, 'utf8')
    .digest('hex');
  const received = Buffer.from(receivedHex, 'hex');
  const expected = Buffer.from(expectedHex, 'hex');
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    return unauthorized();
  }

  // TODO: handle tracker.updated, delivered → update order status
  return Response.json({ ok: true });
}
