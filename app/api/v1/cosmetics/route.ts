import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';

/**
 * GET /api/v1/cosmetics
 * Returns unlocked cosmetics and equipped items for authenticated user
 */
export async function GET(_req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        activeCosmetic: true,
        activeOverlay: true,
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'USER_NOT_FOUND', requestId }, { status: 404 });
    }

    // Get unlocked cosmetics from inventory
    const inventoryItems = await db.inventoryItem.findMany({
      where: {
        userId: user.id,
        kind: { in: ['COSMETIC', 'OVERLAY'] },
      },
      select: {
        sku: true,
        kind: true,
        metadata: true,
      },
    });

    const unlocked = inventoryItems.map((item) => item.sku);

    // Determine equipped HUD skin from activeOverlay or metadata
    let hudSkinId: 'default' | 'quake' = 'default';
    if (user.activeOverlay === 'hud-quake-overlay' || unlocked.includes('hud-quake-overlay')) {
      // Check if quake is actually equipped
      const quakeItem = inventoryItems.find((item) => item.sku === 'hud-quake-overlay');
      if (quakeItem || user.activeOverlay === 'hud-quake-overlay') {
        hudSkinId = 'quake';
      }
    }

    return NextResponse.json({
      ok: true,
      data: {
        unlocked,
        equipped: {
          hudSkinId,
          cosmetic: user.activeCosmetic,
          overlay: user.activeOverlay,
        },
      },
      requestId,
    });
  } catch (error: any) {
    console.error('[Cosmetics GET] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error.message, requestId },
      { status: 500 },
    );
  }
}
