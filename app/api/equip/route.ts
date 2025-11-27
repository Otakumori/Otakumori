
import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const { itemId, slot } = await req.json();
  // TODO: persist equip
  return NextResponse.json({ ok: true, data: { message: 'Equipped', itemId, slot } });
}
