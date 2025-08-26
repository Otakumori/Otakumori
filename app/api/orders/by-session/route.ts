/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Session ID required',
        },
        { status: 400 }
      );
    }

    // Find order by Stripe session ID
    const order = await db.order.findUnique({
      where: { stripeId: sessionId },
      include: {
        OrderItem: true,
        UserRunes: {
          include: {
            rune: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Order not found',
        },
        { status: 404 }
      );
    }

    // Check if user owns this order
    if (order.userId !== userId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Access denied',
        },
        { status: 403 }
      );
    }

    // Get runes for this order
    const runes = order.UserRunes.map(ur => ({
      id: ur.rune.id,
      canonicalId: ur.rune.canonicalId,
      displayName: ur.rune.displayName,
      glyph: ur.rune.glyph,
      lore: ur.rune.lore,
    }));

    // Get site config for combo checking
    const siteConfig = await db.siteConfig.findUnique({
      where: { id: 'singleton' },
    });

    let combos: any[] = [];
    if (siteConfig?.runes) {
      const runesConfig = siteConfig.runes as any;
      const comboDefs = runesConfig.combos || [];

      // Check which combos are completed with these runes
      for (const combo of comboDefs) {
        if (!combo.isActive) continue;

        const userRunes = await db.userRune.findMany({
          where: { userId },
          include: { rune: true },
        });

        const userRuneIds = userRunes.map(ur => ur.rune.canonicalId);
        const isCompleted = combo.members.every((member: string) => userRuneIds.includes(member));

        if (isCompleted) {
          combos.push({
            id: combo.id,
            comboId: combo.comboId,
            revealCopy: combo.revealCopy,
            cosmeticBurst: combo.cosmeticBurst,
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        id: order.id,
        petalsAwarded: order.petalsAwarded || 0,
        runes,
        combos,
      },
    });
  } catch (error) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
