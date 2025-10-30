// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/app/lib/authz';
import { z } from 'zod';

const schema = z.object({ status: z.enum(['PUBLIC', 'HIDDEN', 'REMOVED']) });

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin();
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });

  const { SoapstoneStatus } = await import('@prisma/client');
  const newStatus = parsed.data.status === 'PUBLIC'
    ? SoapstoneStatus.VISIBLE
    : parsed.data.status === 'HIDDEN'
      ? SoapstoneStatus.REPORTED
      : SoapstoneStatus.REMOVED;
  
  const message = await db.soapstoneMessage.update({
    where: { id: params.id },
    data: {
      status: newStatus,
    },
  });

  return NextResponse.json({ ok: true, message });
}
