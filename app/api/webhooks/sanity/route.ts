import crypto from 'crypto';
import { env } from '@/env.mjs';

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get('x-sanity-signature') || '';
  const expected = crypto
    .createHmac('sha256', env.SANITY_WEBHOOK_SECRET || '')
    .update(raw)
    .digest('hex');
  if (sig !== expected) return new Response('bad sig', { status: 401 });

  // TODO: revalidateTag('blog'), reindex Algolia
  console.log('Sanity webhook received:', raw);
  return new Response('ok');
}
