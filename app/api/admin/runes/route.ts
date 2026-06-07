
import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { authorizeAdminApi } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';

// GET: Fetch all rune definitions
export async function GET() {
  const authorization = await authorizeAdminApi();
  if (!authorization.ok) return authorization.response;

  try {
    const runes = await db.runeDef.findMany({
      orderBy: { canonicalId: 'asc' },
    });

    return NextResponse.json({
      ok: true,
      data: { runes },
    });
  } catch (error) {
    logger.error('Runes error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}

// POST: Create or update rune definition
export async function POST(request: NextRequest) {
  const authorization = await authorizeAdminApi(request);
  if (!authorization.ok) return authorization.response;
  const userId = authorization.userId!;

  try {
    const body = await request.json();
    const { id, canonicalId, displayName, glyph, lore, printifyUPCs, isActive } = body;

    if (!canonicalId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Canonical ID is required',
        },
        { status: 400 },
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
          { status: 400 },
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
    logger.error('Runes error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        ok: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
