/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// GET: Fetch all rune combos
export async function GET() {
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

    // TODO: Add admin role check
    // const user = await db.user.findUnique({ where: { clerkId: userId } });
    // if (!user?.isAdmin) { return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 }); }

    const combos = await db.runeCombo.findMany({
      orderBy: { comboId: 'asc' },
    });

    return NextResponse.json({
      ok: true,
      data: { combos },
    });
  } catch (error) {
    console.error('Combos fetch error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST: Create or update rune combo
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

    // TODO: Add admin role check
    // const user = await db.user.findUnique({ where: { clerkId: userId } });
    // if (!user?.isAdmin) { return NextResponse.json({ ok: false, error: 'Admin access required' }, { status: 403 }); }

    const body = await request.json();
    const { id, comboId, members, revealCopy, cosmeticBurst, isActive } = body;

    if (!comboId || !members || members.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Combo ID and members are required',
        },
        { status: 400 }
      );
    }

    // Check if combo ID already exists (for new combos)
    if (!id) {
      const existingCombo = await db.runeCombo.findUnique({
        where: { comboId },
      });

      if (existingCombo) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Combo ID already exists',
          },
          { status: 400 }
        );
      }
    }

    // Validate that all member runes exist
    for (const memberId of members) {
      const runeExists = await db.runeDef.findUnique({
        where: { canonicalId: memberId },
      });

      if (!runeExists) {
        return NextResponse.json(
          {
            ok: false,
            error: `Rune ${memberId} not found`,
          },
          { status: 400 }
        );
      }
    }

    const comboData = {
      comboId,
      members,
      revealCopy: revealCopy || null,
      cosmeticBurst: cosmeticBurst || 'small',
      isActive: isActive ?? true,
      updatedAt: new Date(),
    };

    let combo;
    if (id) {
      // Update existing combo
      combo = await db.runeCombo.update({
        where: { id },
        data: comboData,
      });
    } else {
      // Create new combo
      combo = await db.runeCombo.create({
        data: {
          id: `combo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...comboData,
          createdAt: new Date(),
        },
      });
    }

    // Update site config to invalidate cache
    await db.siteConfig.update({
      where: { id: 'singleton' },
      data: {
        updatedAt: new Date(),
        updatedBy: userId,
      },
    });

    return NextResponse.json({
      ok: true,
      data: { combo },
    });
  } catch (error) {
    console.error('Combo save error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
