 
 
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { isAdmin } from '@/app/lib/authz';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { isHidden, isFlagged } = body as Partial<{ isHidden: boolean; isFlagged: boolean }>;
  const msg = await prisma.soapstoneMessage.update({
    where: { id: params.id },
    data: {
      ...(typeof isHidden === 'boolean' ? { isHidden } : {}),
      ...(typeof isFlagged === 'boolean' ? { isFlagged } : {}),
    },
  });
  return NextResponse.json({ ok: true, msg });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 403 });
  await prisma.soapstoneMessage.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
