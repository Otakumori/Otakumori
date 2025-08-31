/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const maxDuration = 10;

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { voteDSMessage } from '@/lib/dsMessagesStore';

const Body = z.object({ id: z.string(), kind: z.enum(['up', 'down']) });

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const { id, kind } = Body.parse(await req.json());
  const updated = await voteDSMessage(params.slug, id, kind);
  if (!updated)
    return NextResponse.json({ ok: false, error: 'Message vanished.' }, { status: 404 });
  return NextResponse.json({ ok: true, item: updated });
}
