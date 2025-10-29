export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { auth } from '@clerk/nextjs/server';
import type { Prisma, UserSafetySettings as PrismaUserSafetySettings } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { UserSafetySettingsUpdateSchema } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';
import { db } from '@/lib/db';

function normalise(settings: PrismaUserSafetySettings) {
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

    logger.request(request, 'Fetching safety settings', { userId });

    let settings = await db.userSafetySettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await db.userSafetySettings.create({ data: { userId } });
    }

    return NextResponse.json({ ok: true, data: normalise(settings) });
  } catch (error) {
    logger.apiError(request, 'Failed to fetch safety settings', error as Error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch safety settings' },
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
    const updates = UserSafetySettingsUpdateSchema.parse(body);

    logger.request(request, 'Updating safety settings', {
      userId,
      extra: { updates: Object.keys(updates) },
    });

    const result = await db.userSafetySettings.upsert({
      where: { userId },
      update: buildUpdateData(updates),
      create: buildCreateData(userId, updates),
    });

    return NextResponse.json({ ok: true, data: normalise(result) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid safety settings data' },
        { status: 400 },
      );
    }

    logger.apiError(request, 'Failed to update safety settings', error as Error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update safety settings' },
      { status: 500 },
    );
  }
}

function buildCreateData(
  userId: string,
  updates: z.infer<typeof UserSafetySettingsUpdateSchema>,
): Prisma.UserSafetySettingsCreateInput {
  return {
    user: { connect: { id: userId } },
    allowFriendRequests: updates.allowFriendRequests ?? true,
    allowPartyInvites: updates.allowPartyInvites ?? true,
    allowMessages: updates.allowMessages ?? true,
    blockedUsers: updates.blockedUsers ?? [],
    contentFilter: updates.contentFilter ?? 'moderate',
    reportNotifications: updates.reportNotifications ?? true,
    moderationNotifications: updates.moderationNotifications ?? true,
  };
}

function buildUpdateData(
  updates: z.infer<typeof UserSafetySettingsUpdateSchema>,
): Prisma.UserSafetySettingsUpdateInput {
  const data: Prisma.UserSafetySettingsUpdateInput = {};

  if (typeof updates.allowFriendRequests === 'boolean') {
    data.allowFriendRequests = updates.allowFriendRequests;
  }

  if (typeof updates.allowPartyInvites === 'boolean') {
    data.allowPartyInvites = updates.allowPartyInvites;
  }

  if (typeof updates.allowMessages === 'boolean') {
    data.allowMessages = updates.allowMessages;
  }

  if (updates.blockedUsers) {
    data.blockedUsers = updates.blockedUsers;
  }

  if (updates.contentFilter) {
    data.contentFilter = updates.contentFilter;
  }

  if (typeof updates.reportNotifications === 'boolean') {
    data.reportNotifications = updates.reportNotifications;
  }

  if (typeof updates.moderationNotifications === 'boolean') {
    data.moderationNotifications = updates.moderationNotifications;
  }

  return data;
}
