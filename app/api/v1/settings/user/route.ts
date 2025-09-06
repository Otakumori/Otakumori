// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { logger } from '@/app/lib/logger';
import { UserSettingsUpdateSchema } from '@/app/lib/contracts';
import { auth } from '@clerk/nextjs/server';

export async function GET(_request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('User settings fetch request', { userId });

    // Get or create user settings
    let settings = await db.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings for new user
      settings = await db.userSettings.create({
        data: { userId },
      });
    }

    const response = {
      ...settings,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };

    logger.info('User settings fetched successfully', { userId });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    logger.error('Failed to fetch user settings', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return NextResponse.json({ ok: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const settingsUpdate = UserSettingsUpdateSchema.parse(body);

    logger.info('User settings update request', {
      userId,
      extra: { updateFields: Object.keys(settingsUpdate) },
    });

    // Update or create user settings
    const settings = await db.userSettings.upsert({
      where: { userId },
      update: settingsUpdate,
      create: {
        userId,
        ...settingsUpdate,
      },
    });

    const response = {
      ...settings,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };

    logger.info('User settings updated successfully', {
      userId,
      extra: { updatedFields: Object.keys(settingsUpdate) },
    });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    logger.error('Failed to update user settings', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid settings data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
