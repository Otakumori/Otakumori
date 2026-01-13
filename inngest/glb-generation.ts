/**
 * GLB Generation Background Job
 * Generates GLB models asynchronously in the background
 */

import { inngest } from './client';
import { logger } from '@/app/lib/logger';
import { db } from '@/app/lib/db';
import { generateComprehensiveGLB, type ComprehensiveGLBOptions } from '@/app/lib/3d/comprehensive-glb-generator';
import { avatarConfigToCreatorConfig } from '@/app/lib/3d/character-config-bridge';
import { putBlobFile } from '@/app/lib/blob/client';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { trackError, trackEvent, EVENT_CATEGORIES } from '@/app/lib/monitoring';

interface GLBGenerationEvent {
  userId: string;
  avatarConfigId: string;
  format: 'glb' | 'fbx' | 'gltf';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  gameId?: string;
  includeOutfit?: boolean;
  includeExtras?: boolean;
  includeMakeup?: boolean;
  includeVFX?: boolean;
  celShaded?: boolean;
}

/**
 * Generate GLB model in the background
 */
export const generateGLBBackground = inngest.createFunction(
  {
    name: 'Generate GLB Background',
    id: 'generate-glb-background',
    retries: 2, // Retry up to 2 times on failure
  },
  { event: 'avatar/glb.generate' },
  async ({ event, step }: { event: { data: GLBGenerationEvent }; step: any }) => {
    try {
    const { userId, avatarConfigId, format, quality = 'high', gameId, includeOutfit = true, includeExtras = false, includeMakeup = false, includeVFX = false, celShaded = false } = event.data;

    logger.info('GLB generation job started', undefined, {
      userId,
      avatarConfigId,
      format,
      quality,
      gameId,
    });

    // Step 1: Fetch avatar configuration
    const avatarConfig = await step.run('fetch-avatar-config', async () => {
      const configRecord = await db.avatarConfiguration.findUnique({
        where: { id: avatarConfigId },
        include: {
          AvatarConfigurationPart: true,
          AvatarMorphTarget: true,
          AvatarMaterialOverride: true,
        },
      });

      if (!configRecord) {
        throw new Error(`Avatar configuration not found: ${avatarConfigId}`);
      }

      if (configRecord.userId !== userId) {
        throw new Error('Avatar configuration does not belong to user');
      }

      // Transform to AvatarConfiguration format
      const cfg = configRecord.configurationData as any;
      const avatarConfig: AvatarConfiguration = {
        id: configRecord.id,
        userId: configRecord.userId,
        baseModel: cfg?.baseModel || 'female',
        parts: configRecord.AvatarConfigurationPart.reduce(
          (acc, p) => {
            acc[p.partType] = p.partId;
            return acc;
          },
          {} as Record<string, string>,
        ),
        morphTargets: configRecord.AvatarMorphTarget.reduce(
          (acc, mt) => {
            acc[mt.targetName] = mt.value;
            return acc;
          },
          {} as Record<string, number>,
        ),
        materialOverrides: configRecord.AvatarMaterialOverride.reduce(
          (acc, mo) => {
            acc[mo.slot] = {
              type: mo.type,
              value: mo.value,
              opacity: mo.opacity,
              // Note: metallic, roughness, normalStrength may be in mo.value as JSON
              // For now, use defaults if not available
            };
            return acc;
          },
          {} as Record<string, any>,
        ),
        contentRating: cfg?.contentRating || 'sfw',
        showNsfwContent: cfg?.showNsfwContent || false,
        ageVerified: cfg?.ageVerified || false,
        defaultAnimation: cfg?.defaultAnimation || 'idle',
        idleAnimations: cfg?.idleAnimations || ['idle'],
        allowExport: cfg?.allowExport !== false,
        exportFormat: format,
        createdAt: configRecord.createdAt,
        updatedAt: configRecord.updatedAt,
      };

      return avatarConfig;
    });

    // Step 2: Generate GLB
    const glbBuffer = await step.run('generate-glb', async () => {
      const generationStartTime = Date.now();
      
      // Convert AvatarConfiguration to FullCharacterConfig
      const fullConfig = avatarConfigToCreatorConfig(avatarConfig);

      const glbOptions: ComprehensiveGLBOptions = {
        quality,
        gameId,
        includeOutfit,
        includeExtras,
        includeMakeup,
        includeVFX,
        celShaded,
        allowPartialGeneration: true, // Allow partial generation to continue even if some optional parts fail
        maxFileSizeMB: 50, // Warn if file exceeds 50MB
      };

      const result = await generateComprehensiveGLB(fullConfig, glbOptions);

      if (!result.success || !result.glbBuffer) {
        const generationDuration = Date.now() - generationStartTime;
        
        // Track GLB generation failure
        trackError(
          new Error(result.error || 'GLB generation failed'),
          {
            component: 'glb-generation-background',
            operation: 'generate-glb',
            avatarConfigId,
            userId,
            format,
            quality,
            duration: generationDuration,
          },
          {
            export_format: format,
            export_quality: quality,
          }
        );
        
        throw new Error(result.error || 'GLB generation failed');
      }
      
      const generationDuration = Date.now() - generationStartTime;
      const fileSizeMB = result.glbBuffer.byteLength / (1024 * 1024);
      
      // Track successful async GLB generation
      trackEvent('avatar_export_async_completed', EVENT_CATEGORIES.USER, {
        format,
        quality,
        duration: generationDuration,
        fileSizeMB: Math.round(fileSizeMB * 100) / 100,
        gameId: gameId || undefined,
        userId,
      });

      // Log warnings if any
      if (result.warnings && result.warnings.length > 0) {
        logger.warn('GLB generation completed with warnings', undefined, {
          avatarConfigId,
          warningCount: result.warnings.length,
          warnings: result.warnings.slice(0, 5),
        });
      }

      // Log performance metrics
      if (result.metadata?.performance) {
        logger.info('GLB generation performance', undefined, {
          avatarConfigId,
          totalTime: `${result.metadata.performance.totalTime.toFixed(2)}ms`,
          buildTime: `${result.metadata.performance.buildTime.toFixed(2)}ms`,
          exportTime: `${result.metadata.performance.exportTime.toFixed(2)}ms`,
          fileSize: `${(result.glbBuffer.byteLength / (1024 * 1024)).toFixed(2)}MB`,
        });
      }

      return Buffer.from(result.glbBuffer);
    });

    // Step 3: Upload to blob storage
    const glbUrl = await step.run('upload-glb', async () => {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { username: true },
      });

      const username = user?.username || userId;
      const timestamp = Date.now();
      const filename = `${username}-avatar-${timestamp}.${format}`;
      const key = `glb-exports/${userId}/${filename}`;

      const { url } = await putBlobFile({
        key,
        data: glbBuffer,
        contentType: format === 'glb' ? 'model/gltf-binary' : format === 'gltf' ? 'model/gltf+json' : 'application/octet-stream',
        access: 'public', // Public access for games to load
      });

      logger.info('GLB uploaded to blob storage', undefined, {
        avatarConfigId,
        url,
        key,
        fileSize: glbBuffer.byteLength,
      });

      return url;
    });

    // Step 4: Update avatar configuration with GLB URL
    await step.run('update-config-with-glb-url', async () => {
      // Update the AvatarConfiguration record with the GLB URL
      await db.avatarConfiguration.update({
        where: { id: avatarConfigId },
        data: {
          glbUrl,
          glbGeneratedAt: new Date(),
        },
      });

      logger.info('GLB generation completed successfully', undefined, {
        avatarConfigId,
        glbUrl,
        format,
        quality,
        fileSize: glbBuffer.byteLength,
      });
    });

    return {
      success: true,
      avatarConfigId,
      glbUrl,
      format,
      fileSize: glbBuffer.byteLength,
    };
  } catch (error) {
    // Track background job failure
    const errorObj = error instanceof Error ? error : new Error(String(error));
    trackError(errorObj, {
      component: 'glb-generation-background',
      operation: 'background-job',
      userId: event.data.userId,
      avatarConfigId: event.data.avatarConfigId,
      format: event.data.format,
      quality: event.data.quality,
    }, {
      export_format: event.data.format,
      export_quality: event.data.quality || 'high',
      export_async: 'true',
    });
    
    throw error;
  }
  },
);

