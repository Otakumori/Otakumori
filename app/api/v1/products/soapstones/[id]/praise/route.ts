import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';

export const runtime = 'nodejs';

// POST /api/v1/products/soapstones/[id]/praise - Praise a soapstone
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const soapstoneId = params.id;

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Check if soapstone exists
    const soapstone = await db.productSoapstone.findUnique({
      where: { id: soapstoneId },
      include: {
        user: { select: { id: true } },
      },
    });

    if (!soapstone) {
      return NextResponse.json({ ok: false, error: 'Soapstone not found' }, { status: 404 });
    }

    // Cannot praise your own soapstone
    if (soapstone.userId === user.id) {
      return NextResponse.json(
        { ok: false, error: 'Cannot praise your own sign' },
        { status: 400 },
      );
    }

    // Check if already praised
    const existing = await db.productSoapstonePraise.findUnique({
      where: {
        soapstoneId_userId: {
          soapstoneId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      // Remove praise (toggle)
      await db.$transaction([
        db.productSoapstonePraise.delete({
          where: { id: existing.id },
        }),
        db.productSoapstone.update({
          where: { id: soapstoneId },
          data: { praiseCount: { decrement: 1 } },
        }),
        // Author loses 1 petal when praise is removed
        db.user.update({
          where: { id: soapstone.userId },
          data: { petalBalance: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        data: { praised: false, praiseCount: soapstone.praiseCount - 1 },
      });
    }

    // Add praise
    await db.$transaction([
      db.productSoapstonePraise.create({
        data: {
          soapstoneId,
          userId: user.id,
        },
      }),
      db.productSoapstone.update({
        where: { id: soapstoneId },
        data: { praiseCount: { increment: 1 } },
      }),
      // Author earns 1 petal per praise
      db.user.update({
        where: { id: soapstone.userId },
        data: { petalBalance: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: { praised: true, praiseCount: soapstone.praiseCount + 1 },
    });
  } catch (error) {
    console.error('Failed to praise soapstone:', error);
    return NextResponse.json({ ok: false, error: 'Failed to process praise' }, { status: 500 });
  }
}
