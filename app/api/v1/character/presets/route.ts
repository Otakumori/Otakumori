export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { CharacterPresetRequestSchema } from '@/app/lib/contracts';
import { env } from '@/env';
import { db } from '@/lib/db';

const FALLBACK_TIMESTAMP = '2024-01-01T00:00:00.000Z';

const QuerySchema = CharacterPresetRequestSchema.extend({
  category: CharacterPresetRequestSchema.shape.category.optional(),
  rarity: CharacterPresetRequestSchema.shape.rarity.optional(),
  unlocked: CharacterPresetRequestSchema.shape.unlocked.optional(),
});

function shouldUsePresetFallback() {
  return env.CI === 'true' || env.NODE_ENV === 'test' || env.NEXT_PUBLIC_PROBE_MODE === '1';
}

function getFallbackPresets() {
  return [
    {
      id: 'ci-sakura-hair',
      name: 'Sakura Traveler Hair',
      description: 'Stable public preset used for CI and preview probes when the database is unavailable.',
      category: 'hair',
      meshData: {},
      textureData: {},
      colorPalette: ['#ffc7d9', '#ff6a9c', '#7c3aed'],
      rarity: 'common',
      unlockCondition: {},
      isDefault: true,
      isUnlocked: true,
      createdAt: FALLBACK_TIMESTAMP,
      updatedAt: FALLBACK_TIMESTAMP,
    },
    {
      id: 'ci-forest-cloak',
      name: 'Forest Shrine Cloak',
      description: 'Stable public clothing preset used for CI and preview probes.',
      category: 'clothing',
      meshData: {},
      textureData: {},
      colorPalette: ['#1f102f', '#db2777', '#f9a8d4'],
      rarity: 'common',
      unlockCondition: {},
      isDefault: true,
      isUnlocked: true,
      createdAt: FALLBACK_TIMESTAMP,
      updatedAt: FALLBACK_TIMESTAMP,
    },
  ] as const;
}

function filterFallbackPresets(params: z.infer<typeof QuerySchema>) {
  return getFallbackPresets().filter((preset) => {
    if (params.category && preset.category !== params.category) return false;
    if (params.rarity && preset.rarity !== params.rarity) return false;
    if (typeof params.unlocked === 'boolean' && preset.isUnlocked !== params.unlocked) return false;
    return true;
  });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const params = QuerySchema.parse({
      category: searchParams.get('category') ?? undefined,
      rarity: searchParams.get('rarity') ?? undefined,
      unlocked:
        searchParams.get('unlocked') === null
          ? undefined
          : searchParams.get('unlocked') === 'true'
            ? true
            : searchParams.get('unlocked') === 'false'
              ? false
              : undefined,
    });

    if (shouldUsePresetFallback()) {
      return NextResponse.json({ ok: true, data: filterFallbackPresets(params) });
    }

    const { userId: clerkId } = await auth();

    const presets = await db.characterPreset.findMany({
      where: {
        ...(params.category ? { category: params.category } : {}),
        ...(params.rarity ? { rarity: params.rarity } : {}),
      },
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
        });

        unlockedIds = new Set(userPresets.map((preset) => preset.presetId));
      }
    }

    const payload = presets.map((preset) => {
      const isUnlocked = unlockedIds?.has(preset.id) ?? false;
      return {
        id: preset.id,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        meshData: preset.meshData,
        textureData: preset.textureData,
        colorPalette: preset.colorPalette,
        rarity: preset.rarity,
        unlockCondition: preset.unlockCondition,
        isDefault: preset.isDefault,
        isUnlocked,
        createdAt: preset.createdAt.toISOString(),
        updatedAt: preset.updatedAt.toISOString(),
      };
    });

    const filtered =
      typeof params.unlocked === 'boolean'
        ? payload.filter((preset) => preset.isUnlocked === params.unlocked)
        : payload;

    return NextResponse.json({ ok: true, data: filtered });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid query parameters' }, { status: 400 });
    }

    logger.error('Character presets fetch error', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
