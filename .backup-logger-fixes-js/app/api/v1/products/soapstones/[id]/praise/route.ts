import { logger } from '@/app/lib/logger';
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
        User: { select: { id: true } },
      },
    });

    if (!soapstone) {
      return NextResponse.json({ ok: false, error: 'Soapstone not found' }, { status: 404 });
    }

    // Cannot praise your own soapstone
    if (soapstone.authorId === user.id) {
      return NextResponse.json(
        { ok: false, error: 'Cannot praise your own sign' },
        { status: 400 },
      );
    }

    // Check if already praised
    const existing = await db.productSoapstonePraise.findUnique({
      where: {
        userId_soapstoneId: {
          soapstoneId: soapstoneId,
          userId: user.id,
        },
      },
    });

    if (existing) {
      // Remove praise (toggle) - use PetalService to spend 1 petal from author
      const { PetalService } = await import('@/app/lib/petals');
      const petalService = new PetalService();

      const spendResult = await petalService.spendPetals(
        soapstone.authorId,
        1,
        'soapstone_praise_removed',
      );

      await db.$transaction([
        db.productSoapstonePraise.delete({
          where: { id: existing.id },
        }),
        db.productSoapstone.update({
          where: { id: soapstoneId },
          data: { appraises: { decrement: 1 } },
        }),
      ]);

      return NextResponse.json({
        ok: true,
        data: {
          praised: false,
          praiseCount: soapstone.appraises - 1,
          authorBalance: spendResult.newBalance,
        },
      });
    }

    // Add praise - use centralized grantPetals to award petals to author
    const { grantPetals } = await import('@/app/lib/petals/grant');

    const earnResult = await grantPetals({
      userId: soapstone.authorId,
      amount: 1,
      source: 'soapstone_praise',
      metadata: {
        soapstoneId,
        praisedBy: user.id,
      },
      description: 'Soapstone praise',
      req: req as any, // For rate limiting
    });

    await db.$transaction([
      db.productSoapstonePraise.create({
        data: {
          ProductSoapstone: { connect: { id: soapstoneId } },
          User: { connect: { id: user.id } },
        },
      }),
      db.productSoapstone.update({
        where: { id: soapstoneId },
        data: { appraises: { increment: 1 } },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      data: {
        praised: true,
        praiseCount: soapstone.appraises + 1,
        authorBalance: earnResult.newBalance,
        authorLifetimePetalsEarned: earnResult.lifetimeEarned,
        dailyCapReached: earnResult.limited || false,
      },
    });
  } catch (error) {
    logger.error('Failed to praise soapstone:', error);
    return NextResponse.json({ ok: false, error: 'Failed to process praise' }, { status: 500 });
  }
}
