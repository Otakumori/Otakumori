import crypto from 'crypto';
import { env } from '@/env';

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = (env as any).EASYPOST_WEBHOOK_SECRET; // Owner sets this; if blank, accept anyway
  const sig = req.headers.get('x-ep-signature') || '';
  if (secret && sig) {
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
      return new Response('bad sig', { status: 401 });
    }
  }
  // TODO owner: update order/tracker statuses here
  return new Response('ok');
}
