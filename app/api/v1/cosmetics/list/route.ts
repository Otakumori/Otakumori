/**
 * List available cosmetics from cosmeticsConfig
 * Filters by NSFW policy and returns items available for purchase
 */

import { logger } from '@/app/lib/logger';
import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import {
  cosmeticItems,
  filterByNSFWPolicy,
  type CosmeticItem,
} from '@/app/lib/cosmetics/cosmeticsConfig';
import { getPolicyFromRequest } from '@/app/lib/policy/fromRequest';
import { db } from '@/app/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    // Get NSFW policy
    const policy = getPolicyFromRequest(req);
    const nsfwAllowed = policy.nsfwAllowed;

    // Filter by NSFW policy
    const filteredItems = filterByNSFWPolicy(cosmeticItems, nsfwAllowed);

    // If user is authenticated, check which items they own
    let ownedItemIds: string[] = [];
    if (userId) {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true },
      });

      if (user) {
        // Get user's inventory items
        const inventoryItems = await db.inventoryItem.findMany({
          where: { userId: user.id },
          select: { sku: true },
        });

        // Map SKUs to cosmetic IDs (assuming SKU matches cosmetic ID or is stored in metadata)
        ownedItemIds = inventoryItems
          .map((item) => {
            // Try to match SKU to cosmetic ID
            const cosmetic = cosmeticItems.find((c) => c.id === item.sku);
            return cosmetic?.id;
          })
          .filter((id): id is string => !!id);
      }
    }

    // Transform items with ownership status
    const itemsWithOwnership: (CosmeticItem & { owned: boolean })[] = filteredItems.map((item) => ({
      ...item,
      owned: ownedItemIds.includes(item.id),
    }));

    return NextResponse.json({
      ok: true,
      data: {
        items: itemsWithOwnership,
        total: itemsWithOwnership.length,
      },
    });
  } catch (error) {
    logger.error('Error fetching cosmetics:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
