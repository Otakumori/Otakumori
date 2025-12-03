import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';
import { cosmeticItems } from '@/app/lib/cosmetics/cosmeticsConfig';

export const runtime = 'nodejs';

async function handler() {
  try {
    // Count NSFW users
    const totalNSFWUsers = await db.user.count({
      where: {
        nsfwEnabled: true,
      },
    });

    // Count NSFW items from cosmetics config
    const totalNSFWItems = cosmeticItems.filter(
      (item) => item.contentRating && item.contentRating !== 'sfw',
    ).length;

    // Get global NSFW setting from SiteSetting
    const globalSetting = await db.siteSetting.findUnique({
      where: { key: 'nsfw_global_enabled' },
      select: { boolValue: true },
    });

    const globalNSFWEnabled = globalSetting?.boolValue ?? true; // Default to enabled

    return NextResponse.json({
      ok: true,
      data: {
        totalNSFWUsers,
        totalNSFWItems,
        globalNSFWEnabled,
      },
    });
  } catch (error) {
    logger.error('NSFW stats error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Failed to fetch NSFW stats' }, { status: 500 });
  }
}

export const GET = withAdminAuth(handler);
