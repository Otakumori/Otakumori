/**
 * Optimized Game Canvas Wrapper
 * High-performance 3D canvas with DREI enhancements
 * Professional lighting, shadows, and performance optimization
 */

'use client';

import * as THREE from 'three';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import {
  PerformanceMonitor,
  AdaptiveDpr,
  AdaptiveEvents,
  Stage,
  AccumulativeShadows,
  Stats,
  Preload,
  PerspectiveCamera,
  OrbitControls,
} from '@react-three/drei';
import { Suspense, ReactNode, useState, useEffect } from 'react';
import { clientEnv } from '@/env/client';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

export interface OptimizedGameCanvasProps
  extends Omit<CanvasProps, 'children'> {
  children: ReactNode;
  showStats?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  enableShadows?: boolean;
  enablePostProcessing?: boolean;
  lightingPreset?: 'studio' | 'sunset' | 'dawn' | 'night' | 'warehouse';
  performanceTarget?: number; // FPS target (default 60)
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  enableControls?: boolean;
  controlsConfig?: {
    enablePan?: boolean;
    enableZoom?: boolean;
    enableRotate?: boolean;
    minDistance?: number;
    maxDistance?: number;
    minPolarAngle?: number;
    maxPolarAngle?: number;
    autoRotate?: boolean;
    autoRotateSpeed?: number;
  };
  onPerformanceChange?: (fps: number) => void;
  className?: string;
}

/**
 * Optimized Game Canvas Component
 * Wraps Three.js Canvas with performance optimizations and professional lighting
 */
export function OptimizedGameCanvas({
  children,
  showStats = false,
  quality = 'high',
  enableShadows = true,
  enablePostProcessing = false,
  lightingPreset = 'studio',
  performanceTarget = 60,
  cameraPosition = [0, 1.5, 3],
  cameraFov = 50,
  enableControls = false,
  controlsConfig = {},
  onPerformanceChange,
  className = '',
  ...canvasProps
}: OptimizedGameCanvasProps) {
  const [dpr, setDpr] = useState<[number, number]>([1, 2]);
  const [currentFps, setCurrentFps] = useState(60);

  // Adjust DPR based on quality preset
  useEffect(() => {
    const qualityDpr = {
      low: [1, 1] as [number, number],
      medium: [1, 1.25] as [number, number],
      high: [1, 1.5] as [number, number],
      ultra: [1, 2] as [number, number],
    };
    setDpr(qualityDpr[quality]);
  }, [quality]);

  // Shadow map size based on quality
  const shadowMapSize = {
    low: 1024,
    medium: 2048,
    high: 2048,
    ultra: 4096,
  }[quality];

  // Handle performance changes
  const handlePerformanceChange = (fps: number) => {
    setCurrentFps(fps);
    if (onPerformanceChange) {
      onPerformanceChange(fps);
    }
  };

  return (
    <Canvas
      shadows={enableShadows}
      dpr={dpr}
      gl={{
        antialias: quality !== 'low',
        alpha: false,
        powerPreference: 'high-performance',
        toneMappingExposure: 1.0,
        ...canvasProps.gl,
      }}
      className={className}
      {...canvasProps}
    >
      {/* Performance optimization */}
      <PerformanceMonitor
        factor={1}
        bounds={(refreshrate: number) => [performanceTarget - 10, performanceTarget + 10] as [number, number]}
        onIncline={async () => {
          // Lower quality if needed
          if (currentFps < performanceTarget - 10) {
            const logger = await getLogger();
            logger.debug('Lowering quality due to performance', undefined, {});
          }
        }}
        onDecline={async () => {
          // Raise quality if possible
          if (currentFps > performanceTarget + 10) {
            const logger = await getLogger();
            logger.debug('Raising quality', undefined, {});
          }
        }}
        onChange={({ fps }) => handlePerformanceChange(fps || 60)}
      />
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />

      {/* Professional lighting setup */}
      <Stage
        preset="portrait"
        intensity={quality === 'ultra' ? 1.0 : quality === 'high' ? 0.8 : quality === 'medium' ? 0.6 : 0.5}
        shadows={{
          type: 'contact',
          bias: -0.000001,
          size: shadowMapSize,
        }}
        environment="city"
        adjustCamera={false}
      />

      {/* Enhanced shadows */}
      {enableShadows && quality !== 'low' && (
        <AccumulativeShadows
          frames={quality === 'ultra' ? 60 : quality === 'high' ? 30 : 20}
          color="#000000"
          alphaTest={0.9}
          scale={20}
          position={[0, -0.1, 0]}
        />
      )}

      {/* Camera */}
      <PerspectiveCamera
        makeDefault
        position={cameraPosition}
        fov={cameraFov}
        near={0.1}
        far={100}
      />

      {/* Controls */}
      {enableControls && (
        <OrbitControls
          enablePan={controlsConfig.enablePan ?? false}
          enableZoom={controlsConfig.enableZoom ?? true}
          enableRotate={controlsConfig.enableRotate ?? true}
          minDistance={controlsConfig.minDistance ?? 1}
          maxDistance={controlsConfig.maxDistance ?? 10}
          minPolarAngle={controlsConfig.minPolarAngle ?? Math.PI / 6}
          maxPolarAngle={controlsConfig.maxPolarAngle ?? Math.PI - Math.PI / 8}
          autoRotate={controlsConfig.autoRotate ?? false}
          autoRotateSpeed={controlsConfig.autoRotateSpeed ?? 1}
          dampingFactor={0.05}
        />
      )}

      {/* Scene content */}
      <Suspense
        fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ec4899" wireframe />
          </mesh>
        }
      >
        {children}
      </Suspense>

      {/* Preload critical assets */}
      <Preload all />

      {/* Debug stats */}
      {showStats && clientEnv.NODE_ENV === 'development' && <Stats />}
    </Canvas>
  );
}

