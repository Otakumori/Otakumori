import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { CharacterConfigRequestSchema, CharacterConfigResponseSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get active character config
    const activeConfig = await db.characterConfig.findFirst({
      where: {
        userId: currentUser.id,
        isActive: true,
      },
    });

    // Get all user's character configs
    const allConfigs = await db.characterConfig.findMany({
      where: { userId: currentUser.id },
      orderBy: { createdAt: 'desc' },
    });

    // Get user's unlocked presets
    const userPresets = await db.userCharacterPreset.findMany({
      where: { userId: currentUser.id },
      include: { preset: true },
    });

    // Get character reactions for active config
    const reactions = activeConfig
      ? await db.characterReaction.findMany({
          where: { characterConfigId: activeConfig.id },
        })
      : [];

    // Transform data
    const config = activeConfig
      ? {
          id: activeConfig.id,
          userId: activeConfig.userId,
          name: activeConfig.name,
          isActive: activeConfig.isActive,
          configData: activeConfig.configData,
          meshData: activeConfig.meshData,
          textureData: activeConfig.textureData,
          createdAt: activeConfig.createdAt.toISOString(),
          updatedAt: activeConfig.updatedAt.toISOString(),
        }
      : null;

    const presets = userPresets.map((up) => ({
      id: up.preset.id,
      name: up.preset.name,
      description: up.preset.description,
      category: up.preset.category,
      meshData: up.preset.meshData,
      textureData: up.preset.textureData,
      colorPalette: up.preset.colorPalette,
      rarity: up.preset.rarity,
      unlockCondition: up.preset.unlockCondition,
      isDefault: up.preset.isDefault,
      createdAt: up.preset.createdAt.toISOString(),
      updatedAt: up.preset.updatedAt.toISOString(),
    }));

    const transformedReactions = reactions.map((reaction) => ({
      id: reaction.id,
      characterConfigId: reaction.characterConfigId,
      context: reaction.context,
      reactionType: reaction.reactionType,
      animationData: reaction.animationData,
      triggerConditions: reaction.triggerConditions,
      createdAt: reaction.createdAt.toISOString(),
    }));

    const responseData = {
      config,
      presets,
      reactions: transformedReactions,
      allConfigs: allConfigs.map((config) => ({
        id: config.id,
        name: config.name,
        isActive: config.isActive,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString(),
      })),
    };

    return NextResponse.json({ ok: true, data: responseData });
  } catch (error) {
    console.error('Character config fetch error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CharacterConfigRequestSchema.parse(body);

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // If setting as active, deactivate other configs
    if (validatedData.isActive) {
      await db.characterConfig.updateMany({
        where: { userId: currentUser.id },
        data: { isActive: false },
      });
    }

    // Create new character config
    const newConfig = await db.characterConfig.create({
      data: {
        userId: currentUser.id,
        name: validatedData.name,
        isActive: validatedData.isActive || false,
        configData: validatedData.configData,
        meshData: validatedData.configData, // For now, use configData as meshData
        textureData: validatedData.configData, // For now, use configData as textureData
      },
    });

    // Create default reactions for this config
    const contexts = ['home', 'shop', 'games', 'social', 'achievements'];
    const reactionTypes = ['idle', 'happy', 'excited', 'focused', 'sleepy'];

    for (const context of contexts) {
      for (const reactionType of reactionTypes) {
        await db.characterReaction.create({
          data: {
            characterConfigId: newConfig.id,
            context,
            reactionType,
            animationData: {
              duration: 1000,
              keyframes: [
                { time: 0, transform: 'scale(1) rotate(0deg)' },
                { time: 0.5, transform: 'scale(1.1) rotate(5deg)' },
                { time: 1, transform: 'scale(1) rotate(0deg)' },
              ],
            },
            triggerConditions: {
              context,
              reactionType,
            },
          },
        });
      }
    }

    const response = {
      id: newConfig.id,
      userId: newConfig.userId,
      name: newConfig.name,
      isActive: newConfig.isActive,
      configData: newConfig.configData,
      meshData: newConfig.meshData,
      textureData: newConfig.textureData,
      createdAt: newConfig.createdAt.toISOString(),
      updatedAt: newConfig.updatedAt.toISOString(),
    };

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Character config creation error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
