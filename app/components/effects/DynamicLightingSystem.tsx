'use client';

import { logger } from '@/app/lib/logger';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  DynamicLightingEngine,
  type LightSource,
  type VolumetricEffect,
} from '@/lib/lighting/dynamic-lighting';
import { RUNTIME_FLAGS } from '@/constants.client';

interface DynamicLightingSystemProps {
  className?: string;
  enableMouseInteraction?: boolean;
  enableVolumetricEffects?: boolean;
  ambientIntensity?: number;
  gameTheme?: 'action' | 'puzzle' | 'strategy' | 'all' | null;
  onLightingReady?: (
    engine: DynamicLightingEngine,
    controls: {
      addLight: (light: LightSource) => void;
      removeLight: (id: string) => void;
      addBurst: (x: number, y: number, color?: { r: number; g: number; b: number }) => void;
    },
  ) => void;
}

// Theme-based lighting configurations
const THEME_LIGHTING = {
  action: {
    primary: { r: 1, g: 0.2, b: 0.2 }, // Red
    secondary: { r: 1, g: 0.6, b: 0 }, // Orange
    ambient: { r: 0.2, g: 0.05, b: 0.05 },
  },
  puzzle: {
    primary: { r: 0.2, g: 0.8, b: 1 }, // Blue
    secondary: { r: 0.6, g: 0.2, b: 1 }, // Purple
    ambient: { r: 0.05, g: 0.1, b: 0.2 },
  },
  strategy: {
    primary: { r: 0.2, g: 1, b: 0.2 }, // Green
    secondary: { r: 1, g: 1, b: 0.2 }, // Yellow
    ambient: { r: 0.05, g: 0.2, b: 0.05 },
  },
  all: {
    primary: { r: 1, g: 0.4, b: 1 }, // Pink/Magenta
    secondary: { r: 0.4, g: 1, b: 1 }, // Cyan
    ambient: { r: 0.1, g: 0.05, b: 0.2 },
  },
} as const;

export default function DynamicLightingSystem({
  className = '',
  enableMouseInteraction = true,
  enableVolumetricEffects = true,
  ambientIntensity = 0.3,
  gameTheme = null,
  onLightingReady,
}: DynamicLightingSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<DynamicLightingEngine | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const addCustomLight = useCallback((light: LightSource) => {
    if (engineRef.current) {
      engineRef.current.addLight(light);
    }
  }, []);

  const removeCustomLight = useCallback((id: string) => {
    if (engineRef.current) {
      engineRef.current.removeLight(id);
    }
  }, []);

  const addLightBurst = useCallback(
    (x: number, y: number, color: { r: number; g: number; b: number } = { r: 1, g: 1, b: 1 }) => {
      if (!engineRef.current) return;

      const burstLight: LightSource = {
        id: `burst-${Date.now()}`,
        type: 'point',
        position: { x, y, z: 50 },
        color,
        intensity: 1.5,
        range: 200,
        falloff: 3,
        castsShadows: true,
        animated: false,
      };

      engineRef.current.addLight(burstLight);

      // Animate burst fade out
      let intensity = 1.5;
      const fadeInterval = setInterval(() => {
        intensity *= 0.9;
        if (intensity < 0.1) {
          clearInterval(fadeInterval);
          if (engineRef.current) {
            engineRef.current.removeLight(burstLight.id);
          }
        } else if (engineRef.current) {
          engineRef.current.updateLight(burstLight.id, { intensity });
        }
      }, 16);
    },
    [],
  );

  // Initialize lighting engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      if (engineRef.current) {
        engineRef.current.updateCanvasSize(
          rect.width * window.devicePixelRatio,
          rect.height * window.devicePixelRatio,
        );
      } else {
        try {
          engineRef.current = new DynamicLightingEngine(canvas);
          setupDefaultLighting();
          setIsInitialized(true);
          onLightingReady?.(engineRef.current, {
            addLight: addCustomLight,
            removeLight: removeCustomLight,
            addBurst: addLightBurst,
          });
        } catch (error) {
          logger.error('Failed to initialize lighting engine:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        }
      }
    };

    updateCanvasSize();

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [onLightingReady]);

  // Setup default lighting configuration
  const setupDefaultLighting = useCallback(() => {
    if (!engineRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const centerX = canvas.width / (2 * window.devicePixelRatio);
    const centerY = canvas.height / (2 * window.devicePixelRatio);

    // Set ambient light
    engineRef.current.setAmbientLight(0.1, 0.05, 0.2, ambientIntensity);

    // Add main GameCube lighting
    const mainLight: LightSource = {
      id: 'gamecube-main',
      type: 'point',
      position: { x: centerX, y: centerY - 50, z: 100 },
      color: { r: 0.8, g: 0.6, b: 1 },
      intensity: 0.8,
      range: 300,
      falloff: 2,
      castsShadows: true,
      animated: true,
      animationSpeed: 0.5,
      animationOffset: 0,
    };

    engineRef.current.addLight(mainLight);

    // Add rim lighting
    const rimLight: LightSource = {
      id: 'rim-light',
      type: 'directional',
      position: { x: centerX + 200, y: centerY - 100, z: 50 },
      color: { r: 1, g: 0.8, b: 0.6 },
      intensity: 0.4,
      range: 400,
      falloff: 1.5,
      castsShadows: false,
      animated: true,
      animationSpeed: 0.3,
      animationOffset: Math.PI,
    };

    engineRef.current.addLight(rimLight);

    // Add volumetric effects if enabled
    if (enableVolumetricEffects) {
      const fogEffect: VolumetricEffect = {
        id: 'ambient-fog',
        type: 'fog',
        density: 0.1,
        color: { r: 0.3, g: 0.2, b: 0.5, a: 0.3 },
        animated: true,
        windInfluence: 0.2,
      };

      engineRef.current.addVolumetricEffect(fogEffect);

      const rayEffect: VolumetricEffect = {
        id: 'light-rays',
        type: 'rays',
        density: 0.15,
        color: { r: 0.8, g: 0.6, b: 1, a: 0.2 },
        animated: true,
        windInfluence: 0.1,
      };

      engineRef.current.addVolumetricEffect(rayEffect);
    }
  }, [ambientIntensity, enableVolumetricEffects]);

  // Update lighting based on game theme
  useEffect(() => {
    if (!engineRef.current || !gameTheme) return;

    const theme = THEME_LIGHTING[gameTheme];

    // Update main light color
    engineRef.current.updateLight('gamecube-main', {
      color: theme.primary,
      intensity: 0.9,
    });

    // Update rim light color
    engineRef.current.updateLight('rim-light', {
      color: theme.secondary,
      intensity: 0.5,
    });

    // Update ambient light
    engineRef.current.setAmbientLight(
      theme.ambient.r,
      theme.ambient.g,
      theme.ambient.b,
      ambientIntensity,
    );

    // Add theme-specific accent lights
    const accentLight: LightSource = {
      id: 'theme-accent',
      type: 'spot',
      position: { x: 100, y: 100, z: 30 },
      color: theme.secondary,
      intensity: 0.3,
      range: 200,
      falloff: 3,
      castsShadows: false,
      animated: true,
      animationSpeed: 1.2,
      animationOffset: Math.PI / 2,
    };

    engineRef.current.addLight(accentLight);
  }, [gameTheme, ambientIntensity]);

  // Mouse interaction for dynamic lighting
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!enableMouseInteraction || !engineRef.current || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) * window.devicePixelRatio;
      const y = (event.clientY - rect.top) * window.devicePixelRatio;

      engineRef.current.setMousePosition(x, y);

      // Add dynamic mouse light
      const mouseLight: LightSource = {
        id: 'mouse-light',
        type: 'point',
        position: { x: x / window.devicePixelRatio, y: y / window.devicePixelRatio, z: 20 },
        color: { r: 1, g: 1, b: 1 },
        intensity: 0.3,
        range: 150,
        falloff: 2,
        castsShadows: false,
        animated: false,
      };

      engineRef.current.addLight(mouseLight);

      // Remove mouse light after a short delay
      setTimeout(() => {
        if (engineRef.current) {
          engineRef.current.removeLight('mouse-light');
        }
      }, 100);
    },
    [enableMouseInteraction],
  );

  // Mouse leave handler
  const handleMouseLeave = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.removeLight('mouse-light');
    }
  }, []);

  // Setup mouse event listeners
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  // Animation loop
  useEffect(() => {
    if (!engineRef.current || !isInitialized) return;

    const animate = (currentTime: number) => {
      if (!engineRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Render lighting
      engineRef.current.render(deltaTime);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isInitialized]);

  // Public API for external control
  // Expose methods via ref callback
  useEffect(() => {
    if (isInitialized && engineRef.current) {
      // Attach methods to the component for external access
      (canvasRef.current as any)?.setAttribute('data-lighting-ready', 'true');
    }
  }, [isInitialized]);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-auto"
        style={{
          mixBlendMode: 'screen',
          opacity: 0.9,
        }}
      />

      {/* Debug info */}
      {RUNTIME_FLAGS.isDev && isInitialized && (
        <div className="absolute top-2 left-2 bg-black/60 text-white p-2 rounded text-xs font-mono z-50">
          <div>Lighting Engine: Active</div>
          <div>Theme: {gameTheme || 'default'}</div>
          <div>Lights: {engineRef.current?.getAllLights().length || 0}</div>
          <div>Mouse Interaction: {enableMouseInteraction ? 'ON' : 'OFF'}</div>
        </div>
      )}
    </div>
  );
}

// Export additional utilities
export { THEME_LIGHTING };
export type { DynamicLightingSystemProps };
