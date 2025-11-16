import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';

const EquipSchema = z.object({
  hudSkinId: z.enum(['default', 'quake']).optional(),
  cosmetic: z.string().optional(),
  overlay: z.string().optional(),
});

/**
 * POST /api/v1/cosmetics/equip
 * Equip a cosmetic item (HUD skin, overlay, etc.)
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    const body = await req.json();
    const validation = EquipSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_ERROR', details: validation.error.issues, requestId },
        { status: 400 },
      );
    }

    const { hudSkinId, cosmetic, overlay } = validation.data;

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'USER_NOT_FOUND', requestId },
        { status: 404 },
      );
    }

    // Build update data
    const updateData: any = {};

    if (hudSkinId !== undefined) {
      // For HUD skins, we store in activeOverlay
      if (hudSkinId === 'quake') {
        // Verify user owns the quake HUD
        const ownsQuake = await db.inventoryItem.findFirst({
          where: {
            userId: user.id,
            sku: 'hud-quake-overlay',
          },
        });

        if (!ownsQuake) {
          return NextResponse.json(
            { ok: false, error: 'ITEM_NOT_OWNED', message: 'You must purchase Quake HUD first', requestId },
            { status: 403 },
          );
        }

        updateData.activeOverlay = 'hud-quake-overlay';
      } else {
        // Default HUD - clear overlay
        updateData.activeOverlay = null;
      }
    }

    if (cosmetic !== undefined) {
      updateData.activeCosmetic = cosmetic;
    }

    if (overlay !== undefined) {
      updateData.activeOverlay = overlay;
    }

    // Update user
    await db.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      ok: true,
      data: {
        equipped: {
          hudSkinId: hudSkinId || (updateData.activeOverlay === 'hud-quake-overlay' ? 'quake' : 'default'),
          cosmetic: updateData.activeCosmetic || null,
          overlay: updateData.activeOverlay || null,
        },
      },
      requestId,
    });
  } catch (error: any) {
    console.error('[Cosmetics Equip] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error.message, requestId },
      { status: 500 },
    );
  }
}

