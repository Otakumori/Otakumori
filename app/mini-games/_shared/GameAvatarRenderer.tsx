'use client';

import { logger } from '@/app/lib/logger';
import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import type * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import Avatar3D from '@/app/components/avatar/Avatar3D';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { PerformanceOptimizer } from '@/app/lib/3d/performance-optimization';

interface GameAvatarRendererProps {
  gameId: string;
  gameMode?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  enableControls?: boolean;
  enableAnimations?: boolean;
  animationState?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  fallbackTo2D?: boolean;
  showFallbackSprite?: boolean;
  }

interface GameAvatarData {
  configuration: AvatarConfiguration;
  isCustom: boolean;
  fallbackSpriteUrl?: string;
  defaultCharacterId?: string;
}

// 3D Avatar Component for Games
function GameAvatar3D({
  configuration,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  quality = 'medium',
  enableAnimations = true,
  animationState = 'idle',
  onLoad,
  onError,
}: {
  configuration: AvatarConfiguration;
  position?: [number, number, number];
  scale?: [number, number, number];
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  enableAnimations?: boolean;
  animationState?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const performanceOptimizer = useRef<PerformanceOptimizer | null>(null);

  useEffect(() => {
    // Initialize performance optimizer
    performanceOptimizer.current = new PerformanceOptimizer({
      quality,
      targetFPS: 60,
      enableLOD: true,
      enableInstancing: true,
      enableTextureCompression: true,
      enableProgressiveLoading: true,
      maxTextureSize: quality === 'low' ? 512 : quality === 'medium' ? 1024 : 2048,
      shadowMapSize: 1024,
      maxLights: quality === 'low' ? 2 : quality === 'medium' ? 4 : 8,
      maxParticles: quality === 'low' ? 50 : quality === 'medium' ? 100 : 200,
      enableFrustumCulling: true,
      enableOcclusionCulling: quality !== 'low',
    });
  }, [quality]);

  useFrame((state, _delta) => {
    if (performanceOptimizer.current) {
      performanceOptimizer.current.updateMetrics(state.gl);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={scale}>
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <Avatar3D
          configuration={configuration}
          lighting="studio"
          quality={quality}
          enableAnimations={enableAnimations}
          animationState={animationState}
          enableControls={false}
          showOutline={false}
          onLoad={onLoad}
          onError={onError}
        />
      </Suspense>
    </group>
  );
}

// 2D Fallback Avatar Component
function GameAvatar2D({
  spriteUrl,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = 0,
  className = '',
}: {
  spriteUrl?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: number;
  className?: string;
}) {
  if (!spriteUrl) {
    // Default simple avatar
    return (
      <div
        className={`absolute ${className}`}
        style={{
          left: position[0],
          top: position[1],
          transform: `scale(${scale[0]}) rotate(${rotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white text-2xl font-semibold" aria-hidden="true">
            AV
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute ${className}`}
      style={{
        left: position[0],
        top: position[1],
        transform: `scale(${scale[0]}) rotate(${rotation}deg)`,
        transformOrigin: 'center center',
      }}
    >
      <img
        src={spriteUrl}
        alt="Avatar"
        className="w-16 h-16 object-cover rounded-full shadow-lg"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

// Main Game Avatar Renderer
export default function GameAvatarRenderer({
  gameId,
  gameMode = 'default',
  position = [0, 0, 0],
  scale = [1, 1, 1],
  quality = 'medium',
  enableControls = false,
  enableAnimations = true,
  animationState = 'idle',
  onLoad,
  onError,
  className = '',
  fallbackTo2D = true,
  showFallbackSprite = true,
}: GameAvatarRendererProps) {
  const { user } = useUser();
  const [use3D, setUse3D] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setWebglSupported(!!gl);
    if (!gl && fallbackTo2D) {
      setUse3D(false);
    }
  }, [fallbackTo2D]);

  // Fetch avatar data
  const {
    data: avatarData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['game-avatar', user?.id, gameId, gameMode],
    queryFn: async (): Promise<GameAvatarData> => {
      if (!user?.id) {
        // Return default character
        return {
          configuration: {
            id: 'default-character',
            userId: 'default',
            baseModel: 'female',
            parts: {
              head: 'head_001',
              body: 'body_001',
            },
            morphTargets: {},
            materialOverrides: {},
            contentRating: 'sfw',
            showNsfwContent: false,
            ageVerified: false,
            defaultAnimation: 'idle',
            idleAnimations: ['idle'],
            allowExport: false,
            exportFormat: 'glb',
            // version: 1, // TODO: Add version to AvatarConfiguration interface
            // isPublic: false, // TODO: Add isPublic to AvatarConfiguration interface
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          isCustom: false,
          fallbackSpriteUrl: '/assets/default-avatar.png',
          defaultCharacterId: 'default_female',
        };
      }

      try {
        // Try to fetch user's custom avatar
        const response = await fetch(`/api/v1/character/config?gameId=${gameId}&mode=${gameMode}`);
        if (response.ok) {
          const data = await response.json();
          if (data.ok) {
            return {
              configuration: data.data,
              isCustom: true,
            };
          }
        }

        // Fallback to default character
        return {
          configuration: {
            id: 'default-character',
            userId: user.id,
            baseModel: 'female',
            parts: {
              head: 'head_001',
              body: 'body_001',
            },
            morphTargets: {},
            materialOverrides: {},
            contentRating: 'sfw',
            showNsfwContent: false,
            ageVerified: false,
            defaultAnimation: 'idle',
            idleAnimations: ['idle'],
            allowExport: false,
            exportFormat: 'glb',
            // version: 1, // TODO: Add version to AvatarConfiguration interface
            // isPublic: false, // TODO: Add isPublic to AvatarConfiguration interface
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          isCustom: false,
          fallbackSpriteUrl: '/assets/default-avatar.png',
          defaultCharacterId: 'default_female',
        };
      } catch (error) {
        logger.error('Failed to load avatar:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Handle loading states
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-white text-2xl font-semibold" aria-hidden="true">
            AV
          </span>
        </div>
      </div>
    );
  }

  if (error || !avatarData) {
    if (showFallbackSprite) {
      return (
        <GameAvatar2D
          spriteUrl="/assets/default-avatar.png"
          position={position}
          scale={scale}
          className={className}
        />
      );
    }
    return null;
  }

  // Choose rendering method based on support and preferences
  const shouldUse3D = use3D && webglSupported && avatarData.configuration;

  if (shouldUse3D) {
    return (
      <div className={`relative ${className}`}>
        <Canvas
          camera={{ position: [0, 1.5, 3], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full"
        >
          <Suspense fallback={null}>
            <GameAvatar3D
              configuration={avatarData.configuration}
              position={position}
              scale={scale}
              quality={quality}
              enableAnimations={enableAnimations}
              animationState={animationState}
              onLoad={onLoad}
              onError={(error) => {
                logger.warn('3D avatar failed, falling back to 2D:', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
                if (fallbackTo2D) {
                  setUse3D(false);
                }
                if (onError) {
                  onError(error);
                }
              }}
            />
            {enableControls && (
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                enableRotate={true}
                autoRotate={false}
                minDistance={1}
                maxDistance={5}
              />
            )}
          </Suspense>
        </Canvas>
      </div>
    );
  }

  // Fallback to 2D rendering
  return (
    <GameAvatar2D
      spriteUrl={avatarData.fallbackSpriteUrl}
      position={position}
      scale={scale}
      className={className}
    />
  );
}

// Hook for games to use avatars
export function useGameAvatar(gameId: string, gameMode?: string) {
  const { user } = useUser();

  return useQuery({
    queryKey: ['game-avatar-data', user?.id, gameId, gameMode],
    queryFn: async () => {
      // Return avatar data for games to use in their rendering
      if (!user?.id) return null;

      try {
        const response = await fetch(`/api/v1/character/config?gameId=${gameId}&mode=${gameMode}`);
        if (response.ok) {
          const data = await response.json();
          return data.ok ? data.data : null;
        }
      } catch (error) {
        logger.error('Failed to fetch avatar data:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
      return null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

// Utility function for canvas-based games
export function drawGameAvatar(
  ctx: CanvasRenderingContext2D,
  avatarData: GameAvatarData | null,
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number = 0,
) {
  if (!avatarData?.fallbackSpriteUrl) {
    // Draw default avatar
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(rotation);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, Math.min(width, height) / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8B5CF6';
    ctx.font = `${Math.min(width, height) / 3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('<span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>', 0, 0);
    ctx.restore();
    return;
  }

  // Draw sprite
  const img = new Image();
  img.onload = () => {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(rotation);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
    ctx.restore();
  };
  img.src = avatarData.fallbackSpriteUrl;
}
