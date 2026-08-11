import crypto from 'crypto';
import { env } from '@/env.mjs';

function verifySignature(raw: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  const provided = Buffer.from(signature, 'hex');
  const expectedBytes = Buffer.from(expected, 'hex');

  return provided.length === expectedBytes.length && crypto.timingSafeEqual(provided, expectedBytes);
}

export async function POST(req: Request) {
  const secret = env.SANITY_WEBHOOK_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: 'SANITY_WEBHOOK_UNAVAILABLE' }, { status: 503 });
  }

  const raw = await req.text();
  const sig = req.headers.get('x-sanity-signature') || '';
  if (!verifySignature(raw, sig, secret)) return new Response('bad sig', { status: 401 });

  // TODO: revalidateTag('blog'), reindex Algolia
  return new Response('ok');
}
