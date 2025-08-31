export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { CharacterPresetRequestSchema } from '@/app/lib/contracts';



export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);

    const queryParams = {
      category: searchParams.get('category') || undefined,
      rarity: searchParams.get('rarity') || undefined,
      unlocked: searchParams.get('unlocked') === 'true' ? true : undefined,
    };

    const validatedParams = CharacterPresetRequestSchema.parse(queryParams);

    // Build where clause
    let whereClause: any = {};

    if (validatedParams.category) {
      whereClause.category = validatedParams.category;
    }

    if (validatedParams.rarity) {
      whereClause.rarity = validatedParams.rarity;
    }

    // Get presets
    const presets = await db.characterPreset.findMany({
      where: whereClause,
      orderBy: [
        { rarity: 'asc' }, // common first
        { category: 'asc' },
        { name: 'asc' },
      ],
    });

    // If user is authenticated and requesting unlocked presets, filter them
    let unlockedPresetIds: string[] = [];
    if (userId && validatedParams.unlocked !== undefined) {
      const currentUser = await db.user.findUnique({
        where: { clerkId: userId },
      });

      if (currentUser) {
        const userPresets = await db.userCharacterPreset.findMany({
          where: { userId: currentUser.id },
          select: { presetId: true },
        });
        unlockedPresetIds = userPresets.map((up) => up.presetId);
      }
    }

    // Transform presets
    const transformedPresets = presets.map((preset) => ({
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
      isUnlocked: userId ? unlockedPresetIds.includes(preset.id) : false,
      createdAt: preset.createdAt.toISOString(),
      updatedAt: preset.updatedAt.toISOString(),
    }));

    // Filter by unlocked status if requested
    const filteredPresets =
      validatedParams.unlocked !== undefined
        ? transformedPresets.filter((p) => p.isUnlocked === validatedParams.unlocked)
        : transformedPresets;

    return NextResponse.json({ ok: true, data: filteredPresets });
  } catch (error) {
    console.error('Character presets fetch error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid query parameters' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
