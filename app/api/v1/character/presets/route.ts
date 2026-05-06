export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { CharacterPresetRequestSchema } from '@/app/lib/contracts';
import { db } from '@/lib/db';

const QuerySchema = CharacterPresetRequestSchema.extend({
  category: CharacterPresetRequestSchema.shape.category.optional(),
  rarity: CharacterPresetRequestSchema.shape.rarity.optional(),
  unlocked: CharacterPresetRequestSchema.shape.unlocked.optional(),
  includeAssets: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

function toBooleanParam(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function toLimitParam(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return undefined;
  return Math.min(parsed, 100);
}

function safeIsoDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    const { searchParams } = new URL(request.url);

    const params = QuerySchema.parse({
      category: searchParams.get('category') ?? undefined,
      rarity: searchParams.get('rarity') ?? undefined,
      unlocked: toBooleanParam(searchParams.get('unlocked')),
      includeAssets: toBooleanParam(searchParams.get('includeAssets')),
      limit: toLimitParam(searchParams.get('limit')),
    });

    const includeAssets = params.includeAssets === true;
    const take = params.limit ?? 60;

    const presets = await db.characterPreset.findMany({
      where: {
        ...(params.category ? { category: params.category } : {}),
        ...(params.rarity ? { rarity: params.rarity } : {}),
      },
      take,
      orderBy: [{ rarity: 'asc' }, { category: 'asc' }, { name: 'asc' }],
    });

    let unlockedIds: Set<string> | undefined;

    if (clerkId) {
      const user = await db.user.findUnique({
        where: { clerkId },
        select: { id: true },
      });

      if (user) {
        const userPresets = await db.userCharacterPreset.findMany({
          where: { userId: user.id },
          select: { presetId: true },
          take: 500,
        });

        unlockedIds = new Set(userPresets.map((preset) => preset.presetId));
      }
    }

    const payload = presets.map((preset) => {
      const isUnlocked = unlockedIds?.has(preset.id) ?? false;
      const basePayload = {
        id: preset.id,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        rarity: preset.rarity,
        unlockCondition: preset.unlockCondition,
        isDefault: preset.isDefault,
        isUnlocked,
        createdAt: safeIsoDate(preset.createdAt),
        updatedAt: safeIsoDate(preset.updatedAt),
      };

      if (!includeAssets) return basePayload;

      return {
        ...basePayload,
        meshData: preset.meshData,
        textureData: preset.textureData,
        colorPalette: preset.colorPalette,
      };
    });

    const filtered =
      typeof params.unlocked === 'boolean'
        ? payload.filter((preset) => preset.isUnlocked === params.unlocked)
        : payload;

    return NextResponse.json(
      { ok: true, data: filtered, meta: { count: filtered.length, includeAssets } },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid query parameters', issues: error.issues }, { status: 400 });
    }

    logger.error('Character presets fetch error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
