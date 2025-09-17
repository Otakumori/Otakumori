export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import type { Prisma, UserSettings as PrismaUserSettings } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { UserSettingsUpdateSchema } from "@/app/lib/contracts";
import { logger } from "@/app/lib/logger";
import { db } from "@/lib/db";

type NotificationPreferenceUpdate = NonNullable<
  z.infer<typeof UserSettingsUpdateSchema>["notificationPreferences"]
>;

type NotificationPreferences = ReturnType<typeof buildNotificationPreferences>;

const DEFAULT_NOTIFICATION_PREFERENCES = {
  email: true,
  push: true,
  inApp: true,
  friendRequests: true,
  partyInvites: true,
  achievements: true,
  leaderboards: true,
  comments: true,
  activities: true,
} as const;

type NotificationPreferenceKey = keyof typeof DEFAULT_NOTIFICATION_PREFERENCES;

function isJsonObject(value: Prisma.JsonValue | null | undefined): value is Prisma.JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildNotificationPreferences(
  current: Prisma.JsonValue | null | undefined,
  updates?: NotificationPreferenceUpdate,
): Record<NotificationPreferenceKey, boolean> {
  const base: Record<NotificationPreferenceKey, boolean> = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
  };

  if (isJsonObject(current)) {
    for (const [key, value] of Object.entries(current)) {
      if (typeof value === "boolean" && key in base) {
        base[key as NotificationPreferenceKey] = value;
      }
    }
  }

  if (updates) {
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === "boolean" && key in base) {
        base[key as NotificationPreferenceKey] = value;
      }
    }
  }

  return base;
}

function normaliseSettings(settings: PrismaUserSettings) {
  return {
    ...settings,
    notificationPreferences: buildNotificationPreferences(settings.notificationPreferences),
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  } satisfies {
    createdAt: string;
    updatedAt: string;
    notificationPreferences: NotificationPreferences;
  } & Omit<PrismaUserSettings, "createdAt" | "updatedAt" | "notificationPreferences">;
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    logger.request(request, "Fetching user settings", { userId });

    let settings = await db.userSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await db.userSettings.create({
        data: { userId },
      });
    }

    return NextResponse.json({ ok: true, data: normaliseSettings(settings) });
  } catch (error) {
    logger.apiError(request, "Failed to fetch user settings", error as Error);
    return NextResponse.json({ ok: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updates = UserSettingsUpdateSchema.parse(body);

    logger.request(request, "Updating user settings", { userId, extra: { updates: Object.keys(updates) } });

    const existing = await db.userSettings.findUnique({ where: { userId } });

    if (!existing) {
      const created = await db.userSettings.create({
        data: buildCreateData(userId, updates),
      });

      return NextResponse.json({ ok: true, data: normaliseSettings(created) });
    }

    const updated = await db.userSettings.update({
      where: { userId },
      data: buildUpdateData(existing, updates),
    });

    return NextResponse.json({ ok: true, data: normaliseSettings(updated) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid settings data" }, { status: 400 });
    }

    logger.apiError(request, "Failed to update user settings", error as Error);
    return NextResponse.json({ ok: false, error: "Failed to update settings" }, { status: 500 });
  }
}

function buildCreateData(userId: string, updates: z.infer<typeof UserSettingsUpdateSchema>): Prisma.UserSettingsCreateInput {
  return {
    userId,
    profileVisibility: updates.profileVisibility ?? "public",
    allowFriendRequests: updates.allowFriendRequests ?? true,
    allowPartyInvites: updates.allowPartyInvites ?? true,
    allowMessages: updates.allowMessages ?? true,
    activityVisibility: updates.activityVisibility ?? "public",
    leaderboardOptOut: updates.leaderboardOptOut ?? false,
    notificationPreferences: buildNotificationPreferences(undefined, updates.notificationPreferences),
    contentFilter: updates.contentFilter ?? "moderate",
    language: updates.language ?? "en",
    timezone: updates.timezone ?? "UTC",
    theme: updates.theme ?? "auto",
    motionReduced: updates.motionReduced ?? false,
    soundEnabled: updates.soundEnabled ?? true,
    musicEnabled: updates.musicEnabled ?? true,
  };
}

function buildUpdateData(
  existing: PrismaUserSettings,
  updates: z.infer<typeof UserSettingsUpdateSchema>,
): Prisma.UserSettingsUpdateInput {
  const data: Prisma.UserSettingsUpdateInput = {};

  if (updates.profileVisibility) {
    data.profileVisibility = updates.profileVisibility;
  }

  if (typeof updates.allowFriendRequests === "boolean") {
    data.allowFriendRequests = updates.allowFriendRequests;
  }

  if (typeof updates.allowPartyInvites === "boolean") {
    data.allowPartyInvites = updates.allowPartyInvites;
  }

  if (typeof updates.allowMessages === "boolean") {
    data.allowMessages = updates.allowMessages;
  }

  if (updates.activityVisibility) {
    data.activityVisibility = updates.activityVisibility;
  }

  if (typeof updates.leaderboardOptOut === "boolean") {
    data.leaderboardOptOut = updates.leaderboardOptOut;
  }

  if (updates.notificationPreferences) {
    data.notificationPreferences = buildNotificationPreferences(
      existing.notificationPreferences,
      updates.notificationPreferences,
    );
  }

  if (updates.contentFilter) {
    data.contentFilter = updates.contentFilter;
  }

  if (updates.language) {
    data.language = updates.language;
  }

  if (updates.timezone) {
    data.timezone = updates.timezone;
  }

  if (updates.theme) {
    data.theme = updates.theme;
  }

  if (typeof updates.motionReduced === "boolean") {
    data.motionReduced = updates.motionReduced;
  }

  if (typeof updates.soundEnabled === "boolean") {
    data.soundEnabled = updates.soundEnabled;
  }

  if (typeof updates.musicEnabled === "boolean") {
    data.musicEnabled = updates.musicEnabled;
  }

  return data;
}