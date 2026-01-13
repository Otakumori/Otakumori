/**
 * Enhanced Game Avatar Renderer
 * Uses high-quality procedural meshes and GLB assets for mini-games
 * Supports proper scaling, animation, and performance optimization
 */

'use client';

import React, { useRef, useEffect, useState, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import type * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { logger } from '@/app/lib/logger';
import { AvatarRenderer } from '@/app/adults/_components/AvatarRenderer.safe';
import { assetRegistry } from '@/app/lib/3d/asset-registry';
import { PerformanceOptimizer } from '@/app/lib/3d/performance-optimization';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

interface EnhancedGameAvatarRendererProps {
  gameId: string;
  gameMode?: string;
  position?: [number, number, number];
  scale?: [number, number, number] | number;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  enableControls?: boolean;
  enableAnimations?: boolean;
  animationState?: 'idle' | 'walk' | 'run' | 'jump' | 'attack' | 'hit' | 'victory';
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  fallbackTo2D?: boolean;
  showFallbackSprite?: boolean;
  // Game-specific scaling presets
  sizePreset?: 'small' | 'medium' | 'large' | 'fullscreen';
  // Animation speed multiplier
  animationSpeed?: number;
}

interface GameAvatarData {
  configuration: any; // CREATOR format config
  isCustom: boolean;
  fallbackSpriteUrl?: string;
  defaultCharacterId?: string;
}

// Size presets for different game contexts
const SIZE_PRESETS = {
  small: { scale: [0.5, 0.5, 0.5] as [number, number, number], position: [0, 0, 0] as [number, number, number] },
  medium: { scale: [0.75, 0.75, 0.75] as [number, number, number], position: [0, 0, 0] as [number, number, number] },
  large: { scale: [1.0, 1.0, 1.0] as [number, number, number], position: [0, 0, 0] as [number, number, number] },
  fullscreen: { scale: [1.5, 1.5, 1.5] as [number, number, number], position: [0, 0, 0] as [number, number, number] },
};

// Convert AvatarConfiguration to CREATOR format
function convertToCreatorFormat(config: AvatarConfiguration | any): any {
  // If already in CREATOR format, return as-is
  if ((config as any).format === 'CREATOR' || (config as any).body?.height !== undefined) {
    return config;
  }

  // Convert from AvatarConfiguration to CREATOR format
  return {
    format: 'CREATOR',
    gender: config.baseModel || 'female',
    age: 'young-adult',
    body: {
      height: 1.0,
      weight: 1.0,
      proportions: {
        headSize: 1.0,
        neckLength: 1.0,
        shoulderWidth: 1.0,
        chestSize: 1.0,
        waistSize: 0.8,
        hipWidth: 1.0,
        armLength: 1.0,
        legLength: 1.0,
      },
      genderFeatures: {
        breastSize: config.baseModel === 'female' ? 0.8 : 0,
        thighGap: config.baseModel === 'female' ? 0.3 : 0,
      },
    },
    face: {
      faceShape: {
        jawline: 0.5,
        cheekbones: 0.5,
        chin: 0.5,
      },
      eyes: {
        size: 1.0,
        spacing: 0.5,
        height: 0.5,
      },
    },
    hair: {
      style: 'medium',
      color: {
        primary: '#3d2817',
      },
    },
    outfit: {
      primary: {
        color: '#FF6B9D',
      },
    },
    materials: {
      parameters: {
        colorA: '#FFDBAC',
        metallic: 0.05,
        roughness: 0.7,
        rimColor: '#FFD700',
        rimStrength: 0.1,
      },
    },
    physics: {
      softBody: {
        enable: false,
        stiffness: 0.4,
        damping: 0.2,
        maxDisplacement: 0.06,
      },
    },
  };
}

// Enhanced 3D Avatar Component with animation support
function EnhancedGameAvatar3D({
  config,
  position = [0, 0, 0],
  scale = [1, 1, 1],
  quality = 'medium',
  enableAnimations = true,
  animationState = 'idle',
  animationSpeed = 1.0,
  onLoad,
  onError,
}: {
  config: any;
  position?: [number, number, number];
  scale?: [number, number, number] | number;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  enableAnimations?: boolean;
  animationState?: string;
  animationSpeed?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const performanceOptimizer = useRef<PerformanceOptimizer | null>(null);
  const animationTimeRef = useRef(0);

  // Normalize scale
  const normalizedScale = useMemo(() => {
    if (typeof scale === 'number') {
      return [scale, scale, scale] as [number, number, number];
    }
    return scale;
  }, [scale]);

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
      shadowMapSize: quality === 'low' ? 512 : quality === 'medium' ? 1024 : 2048,
      maxLights: quality === 'low' ? 2 : quality === 'medium' ? 4 : 8,
      maxParticles: quality === 'low' ? 50 : quality === 'medium' ? 100 : 200,
      enableFrustumCulling: true,
      enableOcclusionCulling: quality !== 'low',
    });
  }, [quality]);

  // Animation loop
  useFrame((state, delta) => {
    if (performanceOptimizer.current) {
      performanceOptimizer.current.updateMetrics(state.gl);
    }

    if (groupRef.current && enableAnimations) {
      animationTimeRef.current += delta * animationSpeed;

      // Apply animation based on state
      switch (animationState) {
        case 'idle':
          // Subtle breathing animation
          groupRef.current.position.y = Math.sin(animationTimeRef.current * 2) * 0.02;
          groupRef.current.rotation.y = Math.sin(animationTimeRef.current * 0.5) * 0.05;
          break;
        case 'walk':
          // Walking animation
          groupRef.current.position.y = Math.sin(animationTimeRef.current * 4) * 0.05;
          groupRef.current.rotation.y = Math.sin(animationTimeRef.current * 2) * 0.1;
          break;
        case 'run':
          // Running animation
          groupRef.current.position.y = Math.sin(animationTimeRef.current * 6) * 0.08;
          groupRef.current.rotation.y = Math.sin(animationTimeRef.current * 3) * 0.15;
          break;
        case 'jump':
          // Jump animation
          const jumpPhase = (animationTimeRef.current * 2) % (Math.PI * 2);
          groupRef.current.position.y = Math.sin(jumpPhase) * 0.3;
          break;
        case 'attack':
          // Attack animation
          groupRef.current.rotation.y = Math.sin(animationTimeRef.current * 10) * 0.2;
          groupRef.current.position.x = Math.sin(animationTimeRef.current * 10) * 0.1;
          break;
        case 'hit':
          // Hit reaction
          groupRef.current.rotation.z = Math.sin(animationTimeRef.current * 20) * 0.1;
          break;
        case 'victory':
          // Victory pose
          groupRef.current.rotation.y = Math.sin(animationTimeRef.current * 1) * 0.2;
          groupRef.current.position.y = Math.sin(animationTimeRef.current * 2) * 0.05;
          break;
        default:
          // Default idle
          groupRef.current.position.y = Math.sin(animationTimeRef.current * 2) * 0.02;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} scale={normalizedScale}>
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <AvatarRenderer
          config={config}
          size="lg"
          showInteractions={false}
          physicsEnabled={enableAnimations}
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
  scale?: [number, number, number] | number;
  rotation?: number;
  className?: string;
}) {
  const normalizedScale = typeof scale === 'number' ? scale : scale[0];

  if (!spriteUrl) {
    return (
      <div
        className={`absolute ${className}`}
        style={{
          left: position[0],
          top: position[1],
          transform: `scale(${normalizedScale}) rotate(${rotation}deg)`,
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
        transform: `scale(${normalizedScale}) rotate(${rotation}deg)`,
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

// Main Enhanced Game Avatar Renderer
export default function EnhancedGameAvatarRenderer({
  gameId,
  gameMode = 'default',
  position,
  scale,
  quality = 'medium',
  enableControls = false,
  enableAnimations = true,
  animationState = 'idle',
  onLoad,
  onError,
  className = '',
  fallbackTo2D = true,
  showFallbackSprite = true,
  sizePreset,
  animationSpeed = 1.0,
}: EnhancedGameAvatarRendererProps) {
  const { user } = useUser();
  const [use3D, setUse3D] = useState(true);
  const [webglSupported, setWebglSupported] = useState(true);

  // Apply size preset if provided
  const finalScale = useMemo((): [number, number, number] => {
    if (sizePreset && SIZE_PRESETS[sizePreset]) {
      return SIZE_PRESETS[sizePreset].scale;
    }
    if (typeof scale === 'number') {
      return [scale, scale, scale];
    }
    return (scale as [number, number, number]) || [1, 1, 1];
  }, [sizePreset, scale]);

  const finalPosition = useMemo((): [number, number, number] => {
    if (sizePreset && SIZE_PRESETS[sizePreset]) {
      return SIZE_PRESETS[sizePreset].position;
    }
    return (position as [number, number, number]) || [0, 0, 0];
  }, [sizePreset, position]);

  // Check WebGL support
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setWebglSupported(!!gl);
    if (!gl && fallbackTo2D) {
      setUse3D(false);
    }
  }, [fallbackTo2D]);

  // Preload assets for the game
  useEffect(() => {
    if (use3D && webglSupported) {
      // Preload common assets
      assetRegistry.preloadAssets('hair', 'female').catch((error) => {
        logger.warn('Failed to preload hair assets:', undefined, { error });
      });
      assetRegistry.preloadAssets('clothing', 'female').catch((error) => {
        logger.warn('Failed to preload clothing assets:', undefined, { error });
      });
    }
  }, [use3D, webglSupported]);

  // Fetch avatar data
  const {
    data: avatarData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['game-avatar', user?.id, gameId, gameMode],
    queryFn: async (): Promise<GameAvatarData> => {
      if (!user?.id) {
        // Return default character in CREATOR format
        return {
          configuration: {
            format: 'CREATOR',
            gender: 'female',
            age: 'young-adult',
            body: {
              height: 1.0,
              weight: 1.0,
              proportions: {
                headSize: 1.0,
                neckLength: 1.0,
                shoulderWidth: 1.0,
                chestSize: 1.0,
                waistSize: 0.8,
                hipWidth: 1.0,
                armLength: 1.0,
                legLength: 1.0,
              },
              genderFeatures: {
                breastSize: 0.8,
                thighGap: 0.3,
              },
            },
            face: {
              faceShape: {
                jawline: 0.5,
                cheekbones: 0.5,
                chin: 0.5,
              },
              eyes: {
                size: 1.0,
                spacing: 0.5,
                height: 0.5,
              },
            },
            hair: {
              style: 'medium',
              color: {
                primary: '#3d2817',
              },
            },
            outfit: {
              primary: {
                color: '#FF6B9D',
              },
            },
            materials: {
              parameters: {
                colorA: '#FFDBAC',
                metallic: 0.05,
                roughness: 0.7,
                rimColor: '#FFD700',
                rimStrength: 0.1,
              },
            },
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
            // Convert to CREATOR format
            const creatorConfig = convertToCreatorFormat(data.data);
            return {
              configuration: creatorConfig,
              isCustom: data.isCustom !== undefined ? data.isCustom : true,
              fallbackSpriteUrl: data.fallbackSpriteUrl || '/assets/default-avatar.png',
            };
          }
        }
      } catch (error) {
        logger.error('Failed to load avatar:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }

      // Fallback to default
      return {
        configuration: {
          format: 'CREATOR',
          gender: 'female',
          age: 'young-adult',
          body: {
            height: 1.0,
            weight: 1.0,
            proportions: {
              headSize: 1.0,
              neckLength: 1.0,
              shoulderWidth: 1.0,
              chestSize: 1.0,
              waistSize: 0.8,
              hipWidth: 1.0,
              armLength: 1.0,
              legLength: 1.0,
            },
            genderFeatures: {
              breastSize: 0.8,
              thighGap: 0.3,
            },
          },
          face: {
            faceShape: {
              jawline: 0.5,
              cheekbones: 0.5,
              chin: 0.5,
            },
            eyes: {
              size: 1.0,
              spacing: 0.5,
              height: 0.5,
            },
          },
          hair: {
            style: 'medium',
            color: {
              primary: '#3d2817',
            },
          },
          outfit: {
            primary: {
              color: '#FF6B9D',
            },
          },
          materials: {
            parameters: {
              colorA: '#FFDBAC',
              metallic: 0.05,
              roughness: 0.7,
              rimColor: '#FFD700',
              rimStrength: 0.1,
            },
          },
        },
        isCustom: false,
        fallbackSpriteUrl: '/assets/default-avatar.png',
        defaultCharacterId: 'default_female',
      };
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
          position={finalPosition as [number, number, number]}
          scale={finalScale as [number, number, number]}
          className={className}
        />
      );
    }
    return null;
  }

  // Choose rendering method
  const shouldUse3D = use3D && webglSupported && avatarData?.configuration;

  if (shouldUse3D) {
    return (
      <div className={`relative ${className}`}>
        <Canvas
          camera={{ position: [0, 1.5, 3], fov: 50 }}
          gl={{
            antialias: quality !== 'low',
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
            logarithmicDepthBuffer: false,
            precision: quality === 'ultra' ? 'highp' : 'mediump',
            preserveDrawingBuffer: false,
            premultipliedAlpha: false,
          }}
          dpr={quality === 'ultra' ? [1, 2] : [1, 1.5]}
          performance={{ min: 0.5 }}
          className="w-full h-full"
        >
          <Suspense fallback={null}>
            <EnhancedGameAvatar3D
              config={avatarData.configuration}
              position={finalPosition}
              scale={finalScale}
              quality={quality}
              enableAnimations={enableAnimations}
              animationState={animationState}
              animationSpeed={animationSpeed}
              onLoad={onLoad}
              onError={(error) => {
                logger.warn('3D avatar failed, falling back to 2D:', undefined, { error });
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
      position={finalPosition as [number, number, number]}
      scale={finalScale as [number, number, number]}
      className={className}
    />
  );
}

