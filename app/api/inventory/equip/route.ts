/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(req: Request) {
  const { userId: clerkId } = auth();
  if (!clerkId) return NextResponse.json({ ok: false, error: 'auth' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { sku } = body as { sku?: string };
  if (!sku) return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return NextResponse.json({ ok: false, error: 'no_user' }, { status: 400 });

  // Check if user owns this item
  const owned = await prisma.inventoryItem.findFirst({
    where: { userId: user.id, sku },
  });
  if (!owned) return NextResponse.json({ ok: false, error: 'not_owned' }, { status: 404 });

  // Determine slot based on SKU prefix
  let updateData: any = {};
  if (sku.startsWith('frame.')) {
    updateData.activeCosmetic = sku;
  } else if (sku.startsWith('overlay.')) {
    updateData.activeOverlay = sku;
  } else if (sku.startsWith('cursor.')) {
    updateData.activeCursor = sku;
  } else if (sku.startsWith('textstyle.')) {
    updateData.activeTextStyle = sku;
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ ok: false, error: 'invalid_sku' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  return NextResponse.json({ ok: true });
}
