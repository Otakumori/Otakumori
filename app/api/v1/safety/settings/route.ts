export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { UserSafetySettingsUpdateSchema } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user safety settings
    let settings = await db.userSafetySettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Create default settings
      settings = await db.userSafetySettings.create({
        data: {
          userId,
        },
      });
    }

    const transformedSettings = {
      ...settings,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };

    return NextResponse.json({
      ok: true,
      data: transformedSettings,
    });
  } catch (error) {
    logger.error('Failed to fetch safety settings', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
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
    const validatedData = UserSafetySettingsUpdateSchema.parse(body);

    // Update or create safety settings
    const settings = await db.userSafetySettings.upsert({
      where: { userId },
      update: validatedData,
      create: {
        userId,
        ...validatedData,
      },
    });

    const transformedSettings = {
      ...settings,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };

    logger.info('Safety settings updated', {
      extra: {
        userId,
        updates: Object.keys(validatedData),
      },
    });

    return NextResponse.json({
      ok: true,
      data: transformedSettings,
    });
  } catch (error) {
    logger.error('Failed to update safety settings', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to update safety settings' },
      { status: 500 },
    );
  }
}
