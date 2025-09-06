// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  // Simple: set status = HIDDEN; You could also store a separate Flag table if needed
  await prisma.soapstoneMessage.update({
    where: { id: params.id },
    data: { status: 'HIDDEN' },
  });
  return NextResponse.json({ ok: true });
}
