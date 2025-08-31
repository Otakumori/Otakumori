export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { logger } from '@/app/lib/logger';
import {
  GameSettingsUpdateSchema,
  GameSettingsListRequestSchema,
  type GameSettingsUpdate,
  type GameSettingsListRequest,
} from '@/app/lib/contracts';
import { auth } from '@clerk/nextjs/server';



export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listRequest = GameSettingsListRequestSchema.parse({
      gameCode: searchParams.get('gameCode') || undefined,
    });

    logger.info('Game settings fetch request', {
      userId,
      extra: { gameCode: listRequest.gameCode },
    });

    // Build where clause
    const whereClause: any = { userId };
    if (listRequest.gameCode) {
      whereClause.gameCode = listRequest.gameCode;
    }

    const settings = await db.gameSettings.findMany({
      where: whereClause,
      orderBy: { gameCode: 'asc' },
    });

    const response = {
      settings: settings.map((setting) => ({
        ...setting,
        createdAt: setting.createdAt.toISOString(),
        updatedAt: setting.updatedAt.toISOString(),
      })),
    };

    logger.info('Game settings fetched successfully', {
      userId,
      extra: { settingsCount: settings.length },
    });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    logger.error('Failed to fetch game settings', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid request parameters' }, { status: 400 });
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to fetch game settings' },
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
    const settingsUpdate = GameSettingsUpdateSchema.parse(body);

    logger.info('Game settings update request', {
      userId,
      extra: { gameCode: settingsUpdate.gameCode, updateFields: Object.keys(settingsUpdate) },
    });

    // Update or create game settings
    const settings = await db.gameSettings.upsert({
      where: {
        userId_gameCode: {
          userId,
          gameCode: settingsUpdate.gameCode,
        },
      },
      update: {
        difficulty: settingsUpdate.difficulty,
        soundEffects: settingsUpdate.soundEffects,
        music: settingsUpdate.music,
        hapticFeedback: settingsUpdate.hapticFeedback,
        autoSave: settingsUpdate.autoSave,
        customSettings: settingsUpdate.customSettings,
      },
      create: {
        userId,
        gameCode: settingsUpdate.gameCode,
        difficulty: settingsUpdate.difficulty || 'normal',
        soundEffects: settingsUpdate.soundEffects ?? true,
        music: settingsUpdate.music ?? true,
        hapticFeedback: settingsUpdate.hapticFeedback ?? true,
        autoSave: settingsUpdate.autoSave ?? true,
        customSettings: settingsUpdate.customSettings,
      },
    });

    const response = {
      ...settings,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };

    logger.info('Game settings updated successfully', {
      userId,
      extra: { gameCode: settingsUpdate.gameCode },
    });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    logger.error('Failed to update game settings', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid game settings data' }, { status: 400 });
    }

    return NextResponse.json(
      { ok: false, error: 'Failed to update game settings' },
      { status: 500 },
    );
  }
}
