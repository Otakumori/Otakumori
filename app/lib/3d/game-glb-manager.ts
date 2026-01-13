/**
 * Game GLB Manager
 * Generates and caches GLB files for game use
 * Integrates procedurally generated GLBs into the game system
 */

import { generateComprehensiveGLB, type ComprehensiveGLBOptions } from './comprehensive-glb-generator';
import { avatarConfigToCreatorConfig } from './character-config-bridge';
import { putBlobFile } from '@/app/lib/blob/client';
import { logger } from '@/app/lib/logger';
import type { AvatarConfiguration } from './avatar-parts';
import { getGameTranslationConfig } from './character-translator';

export interface GameGLBCacheEntry {
  glbUrl: string;
  gameId: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  generatedAt: Date;
  fileSize: number;
  expiresAt?: Date;
}

export interface GenerateGameGLBOptions {
  gameId?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  forceRegenerate?: boolean; // Force regeneration even if cached
  userId?: string; // For blob storage path
}

/**
 * Generate GLB file for game use from avatar configuration
 * Returns the blob storage URL of the generated GLB
 */
export async function generateGameGLB(
  avatarConfig: AvatarConfiguration,
  options: GenerateGameGLBOptions = {}
): Promise<{ glbUrl: string; fileSize: number } | null> {
  try {
    const { gameId, quality = 'medium', userId } = options;

    logger.info('Generating game GLB', undefined, {
      gameId: gameId || 'default',
      quality,
      userId: userId || 'unknown',
    });

    // Convert AvatarConfiguration to FullCharacterConfig
    const fullConfig = avatarConfigToCreatorConfig(avatarConfig);

    // Get game translation config if gameId provided
    const gameTranslationConfig = gameId ? (getGameTranslationConfig(gameId) || undefined) : undefined;

    // Prepare GLB generation options
    const glbOptions: ComprehensiveGLBOptions = {
      quality,
      celShaded: true, // Default to cel-shaded for anime aesthetic
      allowPartialGeneration: true,
      maxFileSizeMB: 50,
      gameId,
      gameTranslationConfig,
    };

    // Generate GLB
    const result = await generateComprehensiveGLB(fullConfig, glbOptions);

    if (!result.success || !result.glbBuffer) {
      logger.error('Game GLB generation failed', undefined, {
        error: result.error,
        gameId: gameId || 'default',
      });
      return null;
    }

    // Upload to blob storage
    const timestamp = Date.now();
    const filename = `game-avatar-${avatarConfig.id}-${gameId || 'default'}-${quality}-${timestamp}.glb`;
    const blobKey = userId ? `avatars/${userId}/${filename}` : `avatars/temp/${filename}`;

    logger.info('Uploading game GLB to blob storage', undefined, {
      key: blobKey,
      size: result.glbBuffer.byteLength,
    });

    const { url } = await putBlobFile({
      key: blobKey,
      data: Buffer.from(result.glbBuffer),
      contentType: 'model/gltf-binary',
      access: 'public', // Public access for games to load
    });

    logger.info('Game GLB generated and uploaded successfully', undefined, {
      url,
      fileSize: result.glbBuffer.byteLength,
      gameId: gameId || 'default',
      quality,
    });

    return {
      glbUrl: url,
      fileSize: result.glbBuffer.byteLength,
    };
  } catch (error) {
    logger.error('Game GLB generation error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

/**
 * Generate GLB URLs for multiple game configurations
 * Useful for pre-generating GLBs for different games
 */
export async function generateGameGLBs(
  avatarConfig: AvatarConfiguration,
  gameIds: string[],
  quality: 'low' | 'medium' | 'high' | 'ultra' = 'medium',
  userId?: string
): Promise<Record<string, { glbUrl: string; fileSize: number } | null>> {
  const results: Record<string, { glbUrl: string; fileSize: number } | null> = {};

  // Generate GLBs in parallel for efficiency
  const promises = gameIds.map(async (gameId) => {
    const result = await generateGameGLB(avatarConfig, {
      gameId,
      quality,
      userId,
    });
    return { gameId, result };
  });

  const resolved = await Promise.allSettled(promises);

  resolved.forEach((settled, index) => {
    const gameId = gameIds[index];
    if (settled.status === 'fulfilled') {
      results[gameId] = settled.value.result;
    } else {
      logger.error('Failed to generate GLB for game', undefined, {
        gameId,
        error: settled.reason,
      });
      results[gameId] = null;
    }
  });

  return results;
}

/**
 * Extract GLB URL from avatar configuration
 * Checks baseModelUrl or configurationData for stored GLB URLs
 */
export function getGLBUrlFromConfig(
  avatarConfig: AvatarConfiguration,
  gameId?: string
): string | null {
  // Check baseModelUrl first
  if (avatarConfig.baseModelUrl) {
    return avatarConfig.baseModelUrl;
  }

  // Check configurationData for game-specific GLB URLs
  const configData = avatarConfig as any;
  if (configData.gameGLBUrls && gameId && configData.gameGLBUrls[gameId]) {
    return configData.gameGLBUrls[gameId];
  }

  // Check for generic GLB URL in configurationData
  if (configData.glbUrl) {
    return configData.glbUrl;
  }

  return null;
}

/**
 * Cache key for GLB generation
 * Used to determine if GLB needs regeneration
 */
export function getGLBCacheKey(
  avatarConfigId: string,
  gameId: string,
  quality: 'low' | 'medium' | 'high' | 'ultra'
): string {
  return `glb:${avatarConfigId}:${gameId}:${quality}`;
}

