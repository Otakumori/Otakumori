/**
 * React Hook for Sprite Avatar Loading
 * Manages sprite sheet generation, caching, and loading for game avatars
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import type {
  SpriteSheet,
  SpriteGenerationOptions,
} from '@om/avatar-engine/gameIntegration/spriteGenerator';
import type { SpriteAtlas } from '@om/avatar-engine/gameIntegration/spriteAtlas';
import {
  generateSpriteSheetWithCache,
  getSpriteCacheKey,
  getCachedSpriteSheet,
} from '@om/avatar-engine/gameIntegration/spriteGenerator';
import { createSpriteAtlas } from '@om/avatar-engine/gameIntegration/spriteAtlas';
import { generateSpriteSheetWithWorker } from '@om/avatar-engine/gameIntegration/spriteWorker';

export interface UseSpriteAvatarOptions {
  avatarConfig: AvatarConfiguration | null;
  gameId: string;
  options?: SpriteGenerationOptions;
  useWorker?: boolean;
  onProgress?: (progress: number, message: string) => void;
}

export interface UseSpriteAvatarResult {
  spriteSheet: SpriteSheet | null;
  spriteAtlas: SpriteAtlas | null;
  isLoading: boolean;
  error: Error | null;
  generate: () => Promise<void>;
  clearCache: () => void;
}

/**
 * Hook for loading and managing sprite avatars
 */
export function useSpriteAvatar({
  avatarConfig,
  gameId,
  options = {},
  useWorker = true,
  onProgress,
}: UseSpriteAvatarOptions): UseSpriteAvatarResult {
  const [spriteSheet, setSpriteSheet] = useState<SpriteSheet | null>(null);
  const [spriteAtlas, setSpriteAtlas] = useState<SpriteAtlas | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Generate sprite sheet
  const generate = useCallback(async () => {
    if (!avatarConfig) {
      setError(new Error('No avatar configuration provided'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cacheKey = getSpriteCacheKey(avatarConfig, options);
      const cached = await getCachedSpriteSheet(cacheKey);

      if (cached) {
        if (onProgress) {
          onProgress(100, 'Loaded from cache');
        }

        // Create atlas from cached sprite sheet
        const atlas = await createSpriteAtlas(
          cached.frames,
          cached.frameWidth,
          cached.frameHeight,
        );

        setSpriteSheet(cached);
        setSpriteAtlas(atlas);
        setIsLoading(false);
        return;
      }

      // Generate new sprite sheet
      if (onProgress) {
        onProgress(0, 'Generating sprite sheet...');
      }

      let generated: SpriteSheet;

      if (useWorker) {
        // Use Web Worker for non-blocking generation
        generated = await generateSpriteSheetWithWorker(avatarConfig, options, (progress, message) => {
          if (onProgress) {
            onProgress(progress, message);
          }
        });
      } else {
        // Use main thread (with caching)
        generated = await generateSpriteSheetWithCache(avatarConfig, options);
        if (onProgress) {
          onProgress(100, 'Generation complete');
        }
      }

      // Create sprite atlas
      if (onProgress) {
        onProgress(90, 'Creating sprite atlas...');
      }

      const atlas = await createSpriteAtlas(
        generated.frames,
        generated.frameWidth,
        generated.frameHeight,
      );

      setSpriteSheet(generated);
      setSpriteAtlas(atlas);

      if (onProgress) {
        onProgress(100, 'Complete');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate sprite sheet');
      setError(error);
      console.error('Sprite generation error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [avatarConfig, options, useWorker, onProgress]);

  // Auto-generate when avatar config changes
  useEffect(() => {
    if (avatarConfig) {
      generate();
    } else {
      setSpriteSheet(null);
      setSpriteAtlas(null);
      setError(null);
    }
  }, [avatarConfig, generate]);

  // Clear cache
  const clearCache = useCallback(() => {
    if (avatarConfig) {
      const cacheKey = getSpriteCacheKey(avatarConfig, options);
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(`sprite_${cacheKey}`);
        } catch (err) {
          console.warn('Failed to clear sprite cache:', err);
        }
      }
    }
    setSpriteSheet(null);
    setSpriteAtlas(null);
  }, [avatarConfig, options]);

  return {
    spriteSheet,
    spriteAtlas,
    isLoading,
    error,
    generate,
    clearCache,
  };
}

