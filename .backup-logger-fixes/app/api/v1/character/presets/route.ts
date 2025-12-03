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
});

export async function GET(request: Request) {
  try {
    const { userId: clerkId } = await auth();
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

    logger.error('Character presets fetch error', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
