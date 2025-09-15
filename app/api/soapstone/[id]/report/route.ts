// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

const AUTO_HIDE_AFTER = 5; // tune as desired

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = params.id;

  const msg = await db.$transaction(async (tx) => {
    const updated = await tx.soapstoneMessage.update({
      where: { id },
      data: { reports: { increment: 1 } },
    });

    if (updated.reports + 1 >= AUTO_HIDE_AFTER && updated.status === 'PUBLIC') {
      return tx.soapstoneMessage.update({
        where: { id },
        data: { status: 'HIDDEN' },
      });
    }
    return updated;
  });

  // Ensure 'status' and 'reports' are present on the returned object.
  // If not, add them to the Prisma model and TypeScript type for SoapstoneMessage.
  return NextResponse.json({ ok: true, status: msg.status, reports: msg.reports });
}
