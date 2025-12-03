'use client';

import { logger } from '@/app/lib/logger';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  DynamicLightingEngine,
  type LightSource,
  type VolumetricEffect,
} from '@/lib/lighting/dynamic-lighting';

interface UseDynamicLightingOptions {
  enableMouseInteraction?: boolean;
  enableVolumetricEffects?: boolean;
  ambientIntensity?: number;
  autoStart?: boolean;
}

export function useDynamicLighting({
  enableMouseInteraction = true,
  enableVolumetricEffects = true,
  ambientIntensity = 0.3,
  autoStart = true,
}: UseDynamicLightingOptions = {}) {
  const engineRef = useRef<DynamicLightingEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  // Initialize engine
  const initialize = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (engineRef.current) return engineRef.current;

      try {
        engineRef.current = new DynamicLightingEngine(canvas);
        canvasRef.current = canvas;
        setIsInitialized(true);

        if (autoStart) {
          setIsRunning(true);
        }

        return engineRef.current;
      } catch (error) {
        logger.error('Failed to initialize lighting engine:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        return null;
      }
    },
    [autoStart],
  );

  // Start animation loop
  const start = useCallback(() => {
    if (!engineRef.current || isRunning) return;

    setIsRunning(true);

    const animate = (currentTime: number) => {
      if (!engineRef.current || !isRunning) return;

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      engineRef.current.render(deltaTime);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isRunning]);

  // Stop animation loop
  const stop = useCallback(() => {
    setIsRunning(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  }, []);

  // Auto-start effect
  useEffect(() => {
    if (isInitialized && autoStart && !isRunning) {
      start();
    }
  }, [isInitialized, autoStart, isRunning, start]);

  // Cleanup
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  // API methods
  const addLight = useCallback((light: LightSource) => {
    if (engineRef.current) {
      engineRef.current.addLight(light);
    }
  }, []);

  const removeLight = useCallback((id: string) => {
    if (engineRef.current) {
      engineRef.current.removeLight(id);
    }
  }, []);

  const updateLight = useCallback((id: string, updates: Partial<LightSource>) => {
    if (engineRef.current) {
      engineRef.current.updateLight(id, updates);
    }
  }, []);

  const addVolumetricEffect = useCallback((effect: VolumetricEffect) => {
    if (engineRef.current) {
      engineRef.current.addVolumetricEffect(effect);
    }
  }, []);

  const setAmbientLight = useCallback((r: number, g: number, b: number, intensity: number) => {
    if (engineRef.current) {
      engineRef.current.setAmbientLight(r, g, b, intensity);
    }
  }, []);

  const setMousePosition = useCallback((x: number, y: number) => {
    if (engineRef.current) {
      engineRef.current.setMousePosition(x, y);
    }
  }, []);

  useEffect(() => {
    if (!engineRef.current) return;
    if (!enableVolumetricEffects) {
      engineRef.current.clearVolumetricEffects();
    }
  }, [enableVolumetricEffects, isInitialized]);

  useEffect(() => {
    if (!engineRef.current) return;
    const clamped = Math.max(0, Math.min(1, ambientIntensity));
    engineRef.current.setAmbientLight(clamped, clamped, clamped, clamped);
  }, [ambientIntensity, isInitialized]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;

    if (!enableMouseInteraction) {
      const rect = canvas.getBoundingClientRect();
      engineRef.current.setMousePosition(rect.width / 2, rect.height / 2);
      return;
    }

    const handleMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePosition(event.clientX - rect.left, event.clientY - rect.top);
    };

    const handleLeave = () => {
      const rect = canvas.getBoundingClientRect();
      setMousePosition(rect.width / 2, rect.height / 2);
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, [enableMouseInteraction, isInitialized, setMousePosition]);

  const clearLights = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.clearLights();
    }
  }, []);

  const getAllLights = useCallback(() => {
    return engineRef.current?.getAllLights() || [];
  }, []);

  // Utility functions
  const createLightBurst = useCallback(
    (
      x: number,
      y: number,
      color: { r: number; g: number; b: number } = { r: 1, g: 1, b: 1 },
      duration: number = 1000,
    ) => {
      if (!engineRef.current) return;

      const burstId = `burst-${Date.now()}-${Math.random()}`;
      const burstLight: LightSource = {
        id: burstId,
        type: 'point',
        position: { x, y, z: 30 },
        color,
        intensity: 2.0,
        range: 250,
        falloff: 2,
        castsShadows: true,
        animated: false,
      };

      engineRef.current.addLight(burstLight);

      // Animate fade out
      const startTime = Date.now();
      const fadeInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
          clearInterval(fadeInterval);
          if (engineRef.current) {
            engineRef.current.removeLight(burstId);
          }
        } else {
          const intensity = 2.0 * (1 - progress);
          const range = 250 * (1 - progress * 0.5);

          if (engineRef.current) {
            engineRef.current.updateLight(burstId, { intensity, range });
          }
        }
      }, 16);
    },
    [],
  );

  const createPulsingLight = useCallback(
    (
      id: string,
      x: number,
      y: number,
      color: { r: number; g: number; b: number },
      baseIntensity: number = 0.8,
      pulseSpeed: number = 1.0,
    ) => {
      if (!engineRef.current) return;

      const pulsingLight: LightSource = {
        id,
        type: 'point',
        position: { x, y, z: 50 },
        color,
        intensity: baseIntensity,
        range: 200,
        falloff: 1.5,
        castsShadows: true,
        animated: true,
        animationSpeed: pulseSpeed,
        animationOffset: 0,
      };

      engineRef.current.addLight(pulsingLight);
    },
    [],
  );

  const updateCanvasSize = useCallback((width: number, height: number) => {
    if (engineRef.current) {
      engineRef.current.updateCanvasSize(width, height);
    }
  }, []);

  return {
    // Core
    engine: engineRef.current,
    isInitialized,
    isRunning,
    initialize,
    start,
    stop,

    // Light management
    addLight,
    removeLight,
    updateLight,
    clearLights,
    getAllLights,

    // Effects
    addVolumetricEffect,
    setAmbientLight,
    setMousePosition,

    // Utilities
    createLightBurst,
    createPulsingLight,
    updateCanvasSize,
  };
}

// Preset lighting configurations
export const LIGHTING_PRESETS = {
  gamecube: {
    ambient: { r: 0.1, g: 0.05, b: 0.2, intensity: 0.3 },
    main: {
      id: 'main',
      type: 'point' as const,
      position: { x: 400, y: 300, z: 100 },
      color: { r: 0.8, g: 0.6, b: 1 },
      intensity: 0.8,
      range: 300,
      falloff: 2,
      castsShadows: true,
      animated: true,
      animationSpeed: 0.5,
    },
    rim: {
      id: 'rim',
      type: 'directional' as const,
      position: { x: 600, y: 200, z: 50 },
      color: { r: 1, g: 0.8, b: 0.6 },
      intensity: 0.4,
      range: 400,
      falloff: 1.5,
      castsShadows: false,
      animated: true,
      animationSpeed: 0.3,
    },
  },

  dramatic: {
    ambient: { r: 0.05, g: 0.05, b: 0.1, intensity: 0.2 },
    main: {
      id: 'dramatic-main',
      type: 'spot' as const,
      position: { x: 400, y: 100, z: 200 },
      color: { r: 1, g: 0.9, b: 0.8 },
      intensity: 1.2,
      range: 400,
      falloff: 3,
      castsShadows: true,
      animated: false,
    },
  },

  colorful: {
    ambient: { r: 0.2, g: 0.1, b: 0.3, intensity: 0.4 },
    lights: [
      {
        id: 'color-1',
        type: 'point' as const,
        position: { x: 200, y: 200, z: 50 },
        color: { r: 1, g: 0.2, b: 0.2 },
        intensity: 0.6,
        range: 200,
        falloff: 2,
        castsShadows: false,
        animated: true,
        animationSpeed: 0.8,
      },
      {
        id: 'color-2',
        type: 'point' as const,
        position: { x: 600, y: 200, z: 50 },
        color: { r: 0.2, g: 0.2, b: 1 },
        intensity: 0.6,
        range: 200,
        falloff: 2,
        castsShadows: false,
        animated: true,
        animationSpeed: 1.2,
        animationOffset: Math.PI,
      },
      {
        id: 'color-3',
        type: 'point' as const,
        position: { x: 400, y: 400, z: 50 },
        color: { r: 0.2, g: 1, b: 0.2 },
        intensity: 0.6,
        range: 200,
        falloff: 2,
        castsShadows: false,
        animated: true,
        animationSpeed: 0.6,
        animationOffset: Math.PI / 2,
      },
    ],
  },
} as const;

// Utility function to apply preset
export function applyLightingPreset(
  lighting: ReturnType<typeof useDynamicLighting>,
  preset: keyof typeof LIGHTING_PRESETS,
) {
  const config = LIGHTING_PRESETS[preset];

  // Clear existing lights
  lighting.clearLights();

  // Set ambient
  lighting.setAmbientLight(
    config.ambient.r,
    config.ambient.g,
    config.ambient.b,
    config.ambient.intensity,
  );

  // Add lights
  if ('main' in config) {
    lighting.addLight(config.main);
  }
  if ('rim' in config) {
    lighting.addLight(config.rim);
  }
  if ('lights' in config) {
    config.lights.forEach((light) => lighting.addLight(light));
  }
}
