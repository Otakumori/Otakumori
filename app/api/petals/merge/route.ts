import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // Get guest session ID from cookies
    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get('guest_session_id')?.value;

    if (!guestSessionId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No guest session to merge',
        },
        { status: 400 }
      );
    }

    // Check if merge already happened
    const existingMerge = await db.mergeLog.findUnique({
      where: {
        guestSessionId_userId: {
          guestSessionId,
          userId,
        },
      },
    });

    if (existingMerge) {
      return NextResponse.json({
        ok: true,
        data: {
          message: 'Guest petals already merged',
          mergedAt: existingMerge.mergedAt,
          petalsMerged: existingMerge.guestPetalCountAtMerge,
        },
      });
    }

    // Get user record
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, petalBalance: true },
    });

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Sum guest petal events
    const guestPetalSum = await db.petalLedger.aggregate({
      where: {
        guestSessionId,
        type: 'earn',
      },
      _sum: { amount: true },
    });

    const guestPetalCount = guestPetalSum._sum.amount || 0;

    if (guestPetalCount === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          message: 'No guest petals to merge',
          petalsMerged: 0,
        },
      });
    }

    // Perform merge transaction
    const result = await db.$transaction(async tx => {
      // Update user petal balance
      const newBalance = user.petalBalance + guestPetalCount;

      await tx.user.update({
        where: { id: user.id },
        data: { petalBalance: newBalance },
      });

      // Update guest petal events to link to user
      await tx.petalLedger.updateMany({
        where: {
          guestSessionId,
          type: 'earn',
        },
        data: { userId: user.id },
      });

      // Create merge log
      const mergeLog = await tx.mergeLog.create({
        data: {
          guestSessionId,
          userId: user.id,
          guestPetalCountAtMerge: guestPetalCount,
          userPetalCountBefore: user.petalBalance,
          userPetalCountAfter: newBalance,
        },
      });

      return {
        newBalance,
        guestPetalCount,
        mergeLog,
      };
    });

    // Clear guest session cookie (optional - you might want to keep it for analytics)
    // cookies().delete('guest_session_id');

    return NextResponse.json({
      ok: true,
      data: {
        message: 'Guest petals merged successfully',
        petalsMerged: result.guestPetalCount,
        newBalance: result.newBalance,
        mergedAt: result.mergeLog.mergedAt,
      },
    });
  } catch (error) {
    console.error('Guest merge error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
