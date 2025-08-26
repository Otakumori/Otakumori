/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const payload = await req.text();
  const h = headers();
  const svixId = h.get('svix-id');
  const svixTimestamp = h.get('svix-timestamp');
  const svixSignature = h.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const wh = new Webhook(env.CLERK_WEBHOOK_SECRET!);
  let evt;

  try {
    evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  // Handle events as needed (user.created, user.updated, etc.)
  const eventType = (evt as any).type;
  console.log(`Received Clerk webhook: ${eventType}`, (evt as any).data);

  switch (eventType) {
    case 'user.created':
      // Handle new user creation
      console.log('New user created:', (evt as any).data);
      break;

    case 'user.updated':
      // Handle user updates
      console.log('User updated:', (evt as any).data);
      break;

    case 'user.deleted':
      // Handle user deletion
      console.log('User deleted:', (evt as any).data);
      break;

    default:
      console.log(`Unhandled event type: ${eventType}`);
  }

  return new Response('ok', { status: 200 });
}
