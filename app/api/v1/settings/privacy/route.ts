export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { auth } from '@clerk/nextjs/server';
import type { PrivacySettings as PrismaPrivacySettings, Prisma } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { PrivacySettingsUpdateSchema } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';
import { db } from '@/lib/db';

function normalise(settings: PrismaPrivacySettings) {
  return {
    ...settings,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.request(request, 'Fetching privacy settings', { userId });

    let settings = await db.privacySettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await db.privacySettings.create({ data: { userId } });
    }

    return NextResponse.json({ ok: true, data: normalise(settings) });
  } catch (error) {
    logger.apiError(request, 'Failed to fetch privacy settings', error as Error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch privacy settings' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates = PrivacySettingsUpdateSchema.parse(body);

    logger.request(request, 'Updating privacy settings', {
      userId,
      extra: { updates: Object.keys(updates) },
    });

    const existing = await db.privacySettings.findUnique({ where: { userId } });

    if (!existing) {
      const created = await db.privacySettings.create({
        data: buildCreateData(userId, updates),
      });

      return NextResponse.json({ ok: true, data: normalise(created) });
    }

    const updated = await db.privacySettings.update({
      where: { userId },
      data: buildUpdateData(updates),
    });

    return NextResponse.json({ ok: true, data: normalise(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid privacy settings data' },
        { status: 400 },
      );
    }

    logger.apiError(request, 'Failed to update privacy settings', error as Error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update privacy settings' },
      { status: 500 },
    );
  }
}

function buildCreateData(
  userId: string,
  updates: z.infer<typeof PrivacySettingsUpdateSchema>,
): Prisma.PrivacySettingsCreateInput {
  return {
    User: { connect: { id: userId } },
    showOnlineStatus: updates.showOnlineStatus ?? true,
    showLastSeen: updates.showLastSeen ?? true,
    showActivity: updates.showActivity ?? true,
    showAchievements: updates.showAchievements ?? true,
    showLeaderboardScores: updates.showLeaderboardScores ?? true,
    showPartyActivity: updates.showPartyActivity ?? true,
    showPurchaseHistory: updates.showPurchaseHistory ?? false,
    allowSearchIndexing: updates.allowSearchIndexing ?? true,
  };
}

function buildUpdateData(
  updates: z.infer<typeof PrivacySettingsUpdateSchema>,
): Prisma.PrivacySettingsUpdateInput {
  const data: Prisma.PrivacySettingsUpdateInput = {};

  if (typeof updates.showOnlineStatus === 'boolean') {
    data.showOnlineStatus = updates.showOnlineStatus;
  }

  if (typeof updates.showLastSeen === 'boolean') {
    data.showLastSeen = updates.showLastSeen;
  }

  if (typeof updates.showActivity === 'boolean') {
    data.showActivity = updates.showActivity;
  }

  if (typeof updates.showAchievements === 'boolean') {
    data.showAchievements = updates.showAchievements;
  }

  if (typeof updates.showLeaderboardScores === 'boolean') {
    data.showLeaderboardScores = updates.showLeaderboardScores;
  }

  if (typeof updates.showPartyActivity === 'boolean') {
    data.showPartyActivity = updates.showPartyActivity;
  }

  if (typeof updates.showPurchaseHistory === 'boolean') {
    data.showPurchaseHistory = updates.showPurchaseHistory;
  }

  if (typeof updates.allowSearchIndexing === 'boolean') {
    data.allowSearchIndexing = updates.allowSearchIndexing;
  }

  return data;
}
