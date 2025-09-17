export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import type { GameSettings as PrismaGameSettings, Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  GameSettingsListRequestSchema,
  GameSettingsUpdateSchema,
} from "@/app/lib/contracts";
import { logger } from "@/app/lib/logger";
import { db } from "@/lib/db";

function normalise(settings: PrismaGameSettings) {
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
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listRequest = GameSettingsListRequestSchema.parse({
      gameCode: searchParams.get("gameCode") ?? undefined,
    });

    logger.request(request, "Fetching game settings", {
      userId,
      extra: { gameCode: listRequest.gameCode },
    });

    const settings = await db.gameSettings.findMany({
      where: {
        userId,
        ...(listRequest.gameCode ? { gameCode: listRequest.gameCode } : {}),
      },
      orderBy: { gameCode: "asc" },
    });

    return NextResponse.json({
      ok: true,
      data: {
        settings: settings.map(normalise),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid request parameters" }, { status: 400 });
    }

    logger.apiError(request, "Failed to fetch game settings", error as Error);
    return NextResponse.json({ ok: false, error: "Failed to fetch game settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates = GameSettingsUpdateSchema.parse(body);

    logger.request(request, "Updating game settings", {
      userId,
      extra: { gameCode: updates.gameCode },
    });

    const result = await db.gameSettings.upsert({
      where: {
        userId_gameCode: {
          userId,
          gameCode: updates.gameCode,
        },
      },
      update: buildUpdateData(updates),
      create: buildCreateData(userId, updates),
    });

    return NextResponse.json({ ok: true, data: normalise(result) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid game settings data" }, { status: 400 });
    }

    logger.apiError(request, "Failed to update game settings", error as Error);
    return NextResponse.json({ ok: false, error: "Failed to update game settings" }, { status: 500 });
  }
}

function buildCreateData(
  userId: string,
  updates: z.infer<typeof GameSettingsUpdateSchema>,
): Prisma.GameSettingsCreateInput {
  return {
    userId,
    gameCode: updates.gameCode,
    difficulty: updates.difficulty ?? "normal",
    soundEffects: updates.soundEffects ?? true,
    music: updates.music ?? true,
    hapticFeedback: updates.hapticFeedback ?? true,
    autoSave: updates.autoSave ?? true,
    customSettings: updates.customSettings ?? {},
  };
}

function buildUpdateData(
  updates: z.infer<typeof GameSettingsUpdateSchema>,
): Prisma.GameSettingsUpdateInput {
  const data: Prisma.GameSettingsUpdateInput = {};

  if (updates.difficulty) {
    data.difficulty = updates.difficulty;
  }

  if (typeof updates.soundEffects === "boolean") {
    data.soundEffects = updates.soundEffects;
  }

  if (typeof updates.music === "boolean") {
    data.music = updates.music;
  }

  if (typeof updates.hapticFeedback === "boolean") {
    data.hapticFeedback = updates.hapticFeedback;
  }

  if (typeof updates.autoSave === "boolean") {
    data.autoSave = updates.autoSave;
  }

  if (updates.customSettings) {
    data.customSettings = updates.customSettings;
  }

  return data;
}