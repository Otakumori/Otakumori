/**
 * Physics Character Hook
 *
 * React hook for integrating physics character rendering into games.
 * Provides easy-to-use interface with FPS monitoring and error handling.
 */

'use client';

import { logger } from '@/app/lib/logger';
import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import {
  PhysicsCharacterRenderer,
  R18_PHYSICS_PRESETS,
  CHARACTER_VISUAL_PRESETS,
} from './PhysicsCharacterRenderer';
import type { R18PhysicsConfig, CharacterVisualConfig } from './PhysicsCharacterRenderer';

export interface UsePhysicsCharacterOptions {
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  enablePhysics?: boolean;
  characterType?: string;
  physicsConfig?: Partial<R18PhysicsConfig>;
  visualConfig?: Partial<CharacterVisualConfig>;
  targetFPS?: number;
  autoDisableThreshold?: number; // FPS threshold to auto-disable physics
  }

export interface PhysicsCharacterAPI {
  render: (x: number, y: number, facing?: 'left' | 'right') => void;
  update: (
    deltaTime: number,
    velocity: { x: number; y: number },
    position: { x: number; y: number },
  ) => void;
  applyImpact: (force: { x: number; y: number }, part?: string) => void;
  enablePhysics: () => void;
  disablePhysics: () => void;
  setQuality: (quality: 'low' | 'medium' | 'high' | 'ultra') => void;
  isReady: boolean;
  renderer: PhysicsCharacterRenderer | null;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  physicsEnabled: boolean;
}

/**
 * Main hook for physics character rendering
 */
export function usePhysicsCharacter(
  ctx: CanvasRenderingContext2D | null,
  options: UsePhysicsCharacterOptions = {},
): PhysicsCharacterAPI {
  const {
    quality = 'medium',
    enablePhysics = true,
    characterType = 'default',
    physicsConfig,
    visualConfig,
    targetFPS = 60,
    autoDisableThreshold = 0.7, // Disable if FPS drops below 70% of target
  } = options;

  const rendererRef = useRef<PhysicsCharacterRenderer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>(
    quality,
  );
  const [physicsEnabled, setPhysicsEnabled] = useState(enablePhysics);

  // FPS monitoring
  const fpsRef = useRef<number>(targetFPS);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(performance.now());

  // Memoize configs
  const mergedPhysicsConfig = useMemo(() => {
    const baseConfig = R18_PHYSICS_PRESETS[characterType] || R18_PHYSICS_PRESETS.default;
    return {
      ...baseConfig,
      quality: currentQuality,
      enabled: physicsEnabled,
      ...physicsConfig,
    };
  }, [characterType, currentQuality, physicsEnabled, physicsConfig]);

  const mergedVisualConfig = useMemo(() => {
    const baseConfig = CHARACTER_VISUAL_PRESETS[characterType] || CHARACTER_VISUAL_PRESETS.default;
    return {
      ...baseConfig,
      ...visualConfig,
    };
  }, [characterType, visualConfig]);

  // Initialize renderer
  useEffect(() => {
    if (!ctx) {
      setIsReady(false);
      return;
    }

    try {
      const renderer = new PhysicsCharacterRenderer(
        ctx,
        characterType,
        mergedPhysicsConfig,
        mergedVisualConfig,
      );
      rendererRef.current = renderer;
      setIsReady(true);
    } catch (error) {
      logger.error('Failed to initialize PhysicsCharacterRenderer:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      setIsReady(false);
    }

    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [ctx, characterType, mergedPhysicsConfig, mergedVisualConfig]);

  // FPS monitoring
  useEffect(() => {
    if (!isReady || !physicsEnabled) return;

    const checkFPS = () => {
      const now = performance.now();
      const deltaTime = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      if (deltaTime > 0) {
        const currentFPS = 1000 / deltaTime;
        frameTimesRef.current.push(currentFPS);

        // Keep only last 60 frames
        if (frameTimesRef.current.length > 60) {
          frameTimesRef.current.shift();
        }

        // Calculate average FPS
        const avgFPS =
          frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
        fpsRef.current = avgFPS;

        // Auto-disable if FPS drops below threshold
        if (avgFPS < targetFPS * autoDisableThreshold) {
          logger.warn(
            `Physics auto-disabled: FPS ${avgFPS.toFixed(1)} < ${targetFPS * autoDisableThreshold}`,
          );
          setPhysicsEnabled(false);
          if (rendererRef.current) {
            rendererRef.current.setEnabled(false);
          }
        }
      }

      requestAnimationFrame(checkFPS);
    };

    const rafId = requestAnimationFrame(checkFPS);
    return () => cancelAnimationFrame(rafId);
  }, [isReady, physicsEnabled, targetFPS, autoDisableThreshold]);

  // Render function
  const render = useCallback(
    (x: number, y: number, facing: 'left' | 'right' = 'right') => {
      if (!isReady || !rendererRef.current) return;
      try {
        rendererRef.current.render(x, y, facing);
      } catch (error) {
        logger.error('Error rendering physics character:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    },
    [isReady],
  );

  // Update function
  const update = useCallback(
    (deltaTime: number, velocity: { x: number; y: number }, position: { x: number; y: number }) => {
      if (!isReady || !rendererRef.current || !physicsEnabled) return;
      try {
        rendererRef.current.update(deltaTime, velocity, position);
      } catch (error) {
        logger.error('Error updating physics character:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    },
    [isReady, physicsEnabled],
  );

  // Apply impact function
  const applyImpact = useCallback(
    (force: { x: number; y: number }, part: string = 'chest') => {
      if (!isReady || !rendererRef.current || !physicsEnabled) return;
      try {
        rendererRef.current.applyImpact(force, part);
      } catch (error) {
        logger.error('Error applying impact:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    },
    [isReady, physicsEnabled],
  );

  // Enable physics
  const enablePhysicsCallback = useCallback(() => {
    setPhysicsEnabled(true);
    if (rendererRef.current) {
      rendererRef.current.setEnabled(true);
    }
  }, []);

  // Disable physics
  const disablePhysicsCallback = useCallback(() => {
    setPhysicsEnabled(false);
    if (rendererRef.current) {
      rendererRef.current.setEnabled(false);
    }
  }, []);

  // Set quality
  const setQualityCallback = useCallback((newQuality: 'low' | 'medium' | 'high' | 'ultra') => {
    setCurrentQuality(newQuality);
    if (rendererRef.current) {
      rendererRef.current.setQuality(newQuality);
    }
  }, []);

  return {
    render,
    update,
    applyImpact,
    enablePhysics: enablePhysicsCallback,
    disablePhysics: disablePhysicsCallback,
    setQuality: setQualityCallback,
    isReady,
    renderer: rendererRef.current,
    quality: currentQuality,
    physicsEnabled,
  };
}

/**
 * Convenience hook for succubus character
 */
export function useSuccubusPhysics(
  ctx: CanvasRenderingContext2D | null,
  options: Omit<UsePhysicsCharacterOptions, 'characterType'> = {},
): PhysicsCharacterAPI {
  return usePhysicsCharacter(ctx, {
    ...options,
    characterType: 'succubus',
  });
}

/**
 * Convenience hook for demon lord character
 */
export function useDemonLordPhysics(
  ctx: CanvasRenderingContext2D | null,
  options: Omit<UsePhysicsCharacterOptions, 'characterType'> = {},
): PhysicsCharacterAPI {
  return usePhysicsCharacter(ctx, {
    ...options,
    characterType: 'demon_lord',
  });
}

/**
 * Convenience hook for player character
 */
export function usePlayerPhysics(
  ctx: CanvasRenderingContext2D | null,
  options: Omit<UsePhysicsCharacterOptions, 'characterType'> = {},
): PhysicsCharacterAPI {
  return usePhysicsCharacter(ctx, {
    ...options,
    characterType: 'player',
  });
}

/**
 * Hook for managing multiple physics characters
 */
export function usePhysicsCharacters(
  ctx: CanvasRenderingContext2D | null,
  characters: Array<{
    id: string;
    characterType?: string;
    options?: UsePhysicsCharacterOptions;
  }>,
): Record<string, PhysicsCharacterAPI> {
  const characterAPIs: Record<string, PhysicsCharacterAPI> = {};

  for (const char of characters) {
    characterAPIs[char.id] = usePhysicsCharacter(ctx, {
      ...char.options,
      characterType: char.characterType || 'default',
    });
  }

  return characterAPIs;
}
