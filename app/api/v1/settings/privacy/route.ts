export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { logger } from '@/app/lib/logger';
import { PrivacySettingsUpdateSchema, type PrivacySettingsUpdate } from '@/app/lib/contracts';
import { auth } from '@clerk/nextjs/server';



export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('Privacy settings fetch request', { userId });

    // Get or create privacy settings
    let settings = await db.privacySettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default privacy settings for new user
      settings = await db.privacySettings.create({
        data: { userId },
      });
    }

    const response = {
      ...settings,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };

    logger.info('Privacy settings fetched successfully', { userId });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    logger.error('Failed to fetch privacy settings', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

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
    const settingsUpdate = PrivacySettingsUpdateSchema.parse(body);

    logger.info('Privacy settings update request', {
      userId,
      extra: { updateFields: Object.keys(settingsUpdate) },
    });

    // Update or create privacy settings
    const settings = await db.privacySettings.upsert({
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

    logger.info('Privacy settings updated successfully', {
      userId,
      extra: { updatedFields: Object.keys(settingsUpdate) },
    });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    logger.error('Failed to update privacy settings', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid privacy settings data' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to update privacy settings' },
      { status: 500 },
    );
  }
}
