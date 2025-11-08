import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { withRateLimit } from '@/app/lib/rate-limiting';

export const runtime = 'nodejs';

// GET /api/v1/character/config - Get user's character configuration for games
export async function GET(request: NextRequest) {
  return withRateLimit('character-config-get', async (_req) => {
    try {
      const { userId } = await auth();
      const { searchParams } = new URL(request.url);
      const _gameId = searchParams.get('gameId');
      const _mode = searchParams.get('mode') || 'default';

      if (!userId) {
        return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
      }

      // Try to find user's avatar configuration
      const avatarConfig = await db.avatarConfiguration.findFirst({
        where: {
          userId,
        },
        include: {
          AvatarConfigurationPart: true,
          AvatarMorphTarget: true,
          AvatarMaterialOverride: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      if (!avatarConfig) {
        // Return default character configuration
        const defaultConfig = {
          id: 'default-character',
          userId: 'default',
          baseModel: 'female',
          parts: [
            {
              id: 'part-head-1',
              configurationId: 'default-character',
              partId: 'head_001',
              partType: 'head',
              createdAt: new Date(),
            },
            {
              id: 'part-body-1',
              configurationId: 'default-character',
              partId: 'body_001',
              partType: 'body',
              createdAt: new Date(),
            },
          ],
          morphTargets: {},
          materialOverrides: {},
          contentRating: 'sfw',
          showNsfwContent: false,
          ageVerified: false,
          defaultAnimation: 'idle',
          idleAnimations: ['idle'],
          allowExport: false,
          exportFormat: 'glb',
          version: 1,
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return NextResponse.json({
          ok: true,
          data: defaultConfig,
          isCustom: false,
          fallbackSpriteUrl: '/assets/default-avatar.png',
          defaultCharacterId: 'default_female',
        });
      }

      // Extract configuration data from JSON
      const cfg = avatarConfig.configurationData as any;
      
      // Transform database result to API format
      const transformedConfig = {
        id: avatarConfig.id,
        userId: avatarConfig.userId,
        name: cfg?.name,
        baseModel: cfg?.baseModel,
        baseModelUrl: cfg?.baseModelUrl,
        contentRating: cfg?.contentRating,
        showNsfwContent: cfg?.showNsfwContent,
        ageVerified: cfg?.ageVerified,
        defaultAnimation: cfg?.defaultAnimation,
        idleAnimations: cfg?.idleAnimations,
        allowExport: cfg?.allowExport,
        exportFormat: avatarConfig.exportFormat,
        version: cfg?.version,
        isPublic: cfg?.isPublic,
        thumbnailUrl: cfg?.thumbnailUrl,
        createdAt: avatarConfig.createdAt,
        updatedAt: avatarConfig.updatedAt,
        parts: avatarConfig.AvatarConfigurationPart.map((p) => ({
          id: p.id,
          configurationId: p.configurationId,
          partId: p.partId,
          partType: p.partType,
          attachmentOrder: p.attachmentOrder,
        })),
        morphTargets: avatarConfig.AvatarMorphTarget.reduce(
          (acc, mt) => {
            acc[mt.targetName] = mt.value;
            return acc;
          },
          {} as Record<string, number>,
        ),
        materialOverrides: avatarConfig.AvatarMaterialOverride.reduce(
          (acc, mo) => {
            acc[mo.slot] = {
              type: mo.type,
              value: mo.value,
              opacity: mo.opacity,
            };
            return acc;
          },
          {} as Record<string, any>,
        ),
      };

      return NextResponse.json({
        ok: true,
        data: transformedConfig,
        isCustom: true,
        fallbackSpriteUrl: '/assets/default-avatar.png', // TODO: Generate sprite from 3D model
        defaultCharacterId: cfg?.baseModel,
      });
    } catch (error) {
      console.error('Failed to fetch character config:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch character configuration' },
        { status: 500 },
      );
    }
  });
}

// POST /api/v1/character/config - Create or update character configuration
export async function POST(request: NextRequest) {
  return withRateLimit('character-config-post', async (_req) => {
    try {
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.json({ ok: false, error: 'Authentication required' }, { status: 401 });
      }

      const body = await request.json();
      const {
        name,
        baseModel,
        baseModelUrl,
        contentRating,
        showNsfwContent,
        ageVerified,
        defaultAnimation,
        idleAnimations,
        allowExport,
        exportFormat,
        parts,
        morphTargets,
        materialOverrides,
      } = body;

      // Validate content rating and age verification
      if (contentRating === 'nsfw' || contentRating === 'explicit') {
        if (!ageVerified) {
          return NextResponse.json(
            { ok: false, error: 'Age verification required for NSFW content' },
            { status: 403 },
          );
        }
      }

      // Create configuration data object
      const configData = {
        name,
        baseModel,
        baseModelUrl,
        contentRating,
        showNsfwContent,
        ageVerified,
        defaultAnimation,
        idleAnimations,
        allowExport,
        version: body.version || '1.0',
        isPublic: body.isPublic !== undefined ? body.isPublic : true,
        thumbnailUrl: body.thumbnailUrl,
      };

      // Create or update configuration
      const avatarConfig = await db.avatarConfiguration.upsert({
        where: {
          userId,
        } as any, // TODO: Fix Prisma schema to allow userId as unique field
        update: {
          configurationData: configData,
          exportFormat,
        },
        create: {
          User: { connect: { id: userId } },
          configurationData: configData,
          exportFormat,
        },
      });

      // Update parts
      if (parts) {
        // Delete existing parts
        await db.avatarConfigurationPart.deleteMany({
          where: {
            configurationId: avatarConfig.id,
          },
        });

        // Create new parts
        await db.avatarConfigurationPart.createMany({
          data: parts.map((part: any, index: number) => ({
            configurationId: avatarConfig.id,
            partId: part.partId,
            partType: part.partType,
            attachmentOrder: index,
          })),
        });
      }

      // Update morph targets
      if (morphTargets) {
        // Delete existing morph targets
        await db.avatarMorphTarget.deleteMany({
          where: {
            configurationId: avatarConfig.id,
          },
        });

        // Create new morph targets
        await db.avatarMorphTarget.createMany({
          data: Object.entries(morphTargets).map(([targetName, value]) => ({
            configurationId: avatarConfig.id,
            targetName,
            value: value as number,
          })),
        });
      }

      // Update material overrides
      if (materialOverrides) {
        // Delete existing material overrides
        await db.avatarMaterialOverride.deleteMany({
          where: {
            configurationId: avatarConfig.id,
          },
        });

        // Create new material overrides
        await db.avatarMaterialOverride.createMany({
          data: Object.entries(materialOverrides).map(([slot, override]: [string, any]) => ({
            configurationId: avatarConfig.id,
            slot,
            type: override.type,
            value: override.value,
            opacity: override.opacity,
            metallic: override.metallic,
            roughness: override.roughness,
            normalStrength: override.normalStrength,
          })),
        });
      }

      // Extract config data for response
      const savedCfg = avatarConfig.configurationData as any;
      
      return NextResponse.json({
        ok: true,
        data: {
          id: avatarConfig.id,
          userId: avatarConfig.userId,
          name: savedCfg?.name,
          baseModel: savedCfg?.baseModel,
          contentRating: savedCfg?.contentRating,
          showNsfwContent: savedCfg?.showNsfwContent,
          ageVerified: savedCfg?.ageVerified,
          defaultAnimation: savedCfg?.defaultAnimation,
          idleAnimations: savedCfg?.idleAnimations,
          allowExport: savedCfg?.allowExport,
          exportFormat: avatarConfig.exportFormat,
          version: savedCfg?.version,
          isPublic: savedCfg?.isPublic,
          createdAt: avatarConfig.createdAt,
          updatedAt: avatarConfig.updatedAt,
        },
      });
    } catch (error) {
      console.error('Failed to save character config:', error);
      return NextResponse.json(
        { ok: false, error: 'Failed to save character configuration' },
        { status: 500 },
      );
    }
  });
}
