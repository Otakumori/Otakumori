 
 
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const maxDuration = 10;

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { addDSMessage, listDSMessages } from '@/lib/dsMessagesStore';
import { BLOCKLIST } from '@/lib/dsLexicon';

const Body = z.object({ phrase: z.string().min(3).max(80) });

export async function GET(_: NextRequest, { params }: { params: { slug: string } }) {
  const items = await listDSMessages(params.slug);
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const { userId } = auth();
  const { phrase } = Body.parse(await req.json());
  const lower = phrase.toLowerCase();
  if (BLOCKLIST.some((b) => lower.includes(b))) {
    return NextResponse.json({ ok: false, error: 'Message faded…' }, { status: 400 });
  }
  const item = await addDSMessage(params.slug, phrase, userId ?? null);
  return NextResponse.json({ ok: true, item });
}
