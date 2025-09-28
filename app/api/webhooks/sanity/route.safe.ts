import crypto from 'crypto';
import { env } from '@/env';

export async function POST(req: Request) {
  const secret = (env as any).SANITY_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: 'sanity_webhook_disabled' }, { status: 503 });
  const raw = await req.text();
  const sig = req.headers.get('x-sanity-signature') || '';
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (sig !== expected) return new Response('bad sig', { status: 401 });
  // Owner will later add: revalidate, Algolia indexing
  return new Response('ok');
}
