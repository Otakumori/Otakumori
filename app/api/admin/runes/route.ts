import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// GET: Fetch all rune definitions
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

    const runes = await db.runeDef.findMany({
      orderBy: { canonicalId: 'asc' },
    });

    return NextResponse.json({
      ok: true,
      data: { runes },
    });
  } catch (error) {
    console.error('Runes fetch error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// POST: Create or update rune definition
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
    const { id, canonicalId, displayName, glyph, lore, printifyUPCs, isActive } = body;

    if (!canonicalId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Canonical ID is required',
        },
        { status: 400 }
      );
    }

    // Check if canonical ID already exists (for new runes)
    if (!id) {
      const existingRune = await db.runeDef.findUnique({
        where: { canonicalId },
      });

      if (existingRune) {
        return NextResponse.json(
          {
            ok: false,
            error: 'Canonical ID already exists',
          },
          { status: 400 }
        );
      }
    }

    const runeData = {
      canonicalId,
      displayName: displayName || null,
      glyph: glyph || null,
      lore: lore || null,
      printifyUPCs: printifyUPCs || [],
      isActive: isActive ?? true,
      updatedAt: new Date(),
    };

    let rune;
    if (id) {
      // Update existing rune
      rune = await db.runeDef.update({
        where: { id },
        data: runeData,
      });
    } else {
      // Create new rune
      rune = await db.runeDef.create({
        data: {
          id: `rune_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...runeData,
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
      data: { rune },
    });
  } catch (error) {
    console.error('Rune save error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
