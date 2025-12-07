'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { PetalPhysicsEngine, type Vector2D } from '@/lib/physics/petal-physics';

interface UseAdvancedPetalsOptions {
  maxPetals?: number;
  windStrength?: number;
  enableMouseInteraction?: boolean;
  enableScrollWind?: boolean;
  spawnRate?: number;
  }

export function useAdvancedPetals({
  maxPetals = 50,
  windStrength = 0.02,
  enableMouseInteraction = true,
  enableScrollWind = true,
  spawnRate = 1,
}: UseAdvancedPetalsOptions = {}) {
  const engineRef = useRef<PetalPhysicsEngine | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastScrollY = useRef(0);

  // Initialize engine
  useEffect(() => {
    if (typeof window === 'undefined') return;

    engineRef.current = new PetalPhysicsEngine(
      { width: window.innerWidth, height: window.innerHeight },
      maxPetals,
    );

    engineRef.current.setWind(windStrength, { x: 1, y: 0.1 }, 0.01);
    setIsInitialized(true);

    // Handle window resize
    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.setBounds(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [maxPetals, windStrength]);

  // Mouse interaction
  useEffect(() => {
    if (!enableMouseInteraction || !engineRef.current) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (engineRef.current) {
        engineRef.current.setMousePosition(event.clientX, event.clientY, 0.15);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableMouseInteraction]);

  // Scroll-based wind
  useEffect(() => {
    if (!enableScrollWind || !engineRef.current) return;

    const handleScroll = () => {
      if (!engineRef.current) return;

      const scrollDelta = window.scrollY - lastScrollY.current;
      const windInfluence = Math.abs(scrollDelta) * 0.002;

      engineRef.current.setWind(
        windStrength + windInfluence,
        { x: 1, y: scrollDelta > 0 ? 0.3 : -0.3 },
        0.02 + windInfluence,
      );

      lastScrollY.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enableScrollWind, windStrength]);

  // API methods
  const spawnPetal = useCallback((x?: number, y?: number) => {
    if (!engineRef.current) return;

    const spawnX = x ?? Math.random() * window.innerWidth;
    const spawnY = y ?? -20;

    engineRef.current.spawnPetal(spawnX, spawnY);
  }, []);

  useEffect(() => {
    if (!engineRef.current || spawnRate <= 0) {
      return;
    }

    let frameId: number;
    let lastSpawn = performance.now();

    const tick = (time: number) => {
      if (!engineRef.current) {
        return;
      }

      const interval = 1000 / spawnRate;
      if (time - lastSpawn >= interval) {
        spawnPetal();
        lastSpawn = time;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [spawnRate, spawnPetal]);

  const setWind = (strength: number, direction: Vector2D) => {
    if (engineRef.current) {
      engineRef.current.setWind(strength, direction);
    }
  };

  const clearPetals = () => {
    if (engineRef.current) {
      engineRef.current.clearPetals();
    }
  };

  const getPetals = () => {
    return engineRef.current?.getPetals() || [];
  };

  const createWindBurst = (x: number, y: number, strength: number = 0.5) => {
    if (!engineRef.current) return;

    // Create temporary strong wind at position
    engineRef.current.setMousePosition(x, y, strength);

    // Reset after short duration
    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.setMousePosition(x, y, 0);
      }
    }, 500);
  };

  const addCollisionBox = (
    x: number,
    y: number,
    width: number,
    height: number,
    type: 'solid' | 'bouncy' | 'absorb' = 'bouncy',
  ) => {
    if (engineRef.current) {
      engineRef.current.addCollisionBox({
        x,
        y,
        width,
        height,
        type,
        restitution: type === 'bouncy' ? 0.8 : 0.3,
      });
    }
  };

  return {
    engine: engineRef.current,
    isInitialized,
    spawnPetal,
    setWind,
    clearPetals,
    getPetals,
    createWindBurst,
    addCollisionBox,
  };
}

// Seasonal wind patterns
export const SEASONAL_WINDS = {
  spring: { strength: 0.015, direction: { x: 0.8, y: 0.2 }, turbulence: 0.008 },
  summer: { strength: 0.008, direction: { x: 0.5, y: 0.1 }, turbulence: 0.005 },
  autumn: { strength: 0.025, direction: { x: 1.2, y: 0.3 }, turbulence: 0.015 },
  winter: { strength: 0.035, direction: { x: 1.5, y: 0.1 }, turbulence: 0.02 },
} as const;

// Preset configurations for different scenarios
export const PETAL_PRESETS = {
  subtle: {
    maxPetals: 20,
    windStrength: 0.01,
    spawnRate: 0.5,
  },
  normal: {
    maxPetals: 50,
    windStrength: 0.02,
    spawnRate: 1,
  },
  intense: {
    maxPetals: 100,
    windStrength: 0.04,
    spawnRate: 3,
  },
  storm: {
    maxPetals: 200,
    windStrength: 0.08,
    spawnRate: 8,
  },
} as const;
