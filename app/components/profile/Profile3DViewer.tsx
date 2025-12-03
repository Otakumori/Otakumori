'use client';

import { logger } from '@/app/lib/logger';
import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html } from '@react-three/drei';
import type * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import Avatar3D from '@/app/components/avatar/Avatar3D';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { PerformanceOptimizer } from '@/app/lib/3d/performance-optimization';

interface Profile3DViewerProps {
  userId?: string;
  configuration?: AvatarConfiguration;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  interactive?: boolean;
  showControls?: boolean;
  animationState?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface Profile3DSceneProps {
  configuration: AvatarConfiguration;
  interactive: boolean;
  showControls: boolean;
  animationState: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

function Profile3DScene({
  configuration,
  interactive,
  showControls,
  animationState,
  quality,
  onLoad,
  onError,
}: Profile3DSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const performanceOptimizer = useRef<PerformanceOptimizer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initialize performance optimizer based on quality
    performanceOptimizer.current = new PerformanceOptimizer({
      quality,
      targetFPS: interactive ? 60 : 30,
      enableLOD: true,
      enableInstancing: true,
      enableTextureCompression: true,
      enableProgressiveLoading: true,
      maxTextureSize: quality === 'low' ? 512 : quality === 'medium' ? 1024 : 2048,
      shadowMapSize: quality === 'low' ? 512 : quality === 'medium' ? 1024 : 2048,
      maxLights: quality === 'low' ? 2 : quality === 'medium' ? 3 : 4,
      maxParticles: quality === 'low' ? 50 : quality === 'medium' ? 100 : 200,
      enableFrustumCulling: true,
      enableOcclusionCulling: quality !== 'low',
    });
  }, [quality, interactive]);

  useFrame((state, delta) => {
    if (performanceOptimizer.current) {
      performanceOptimizer.current.updateMetrics(state.gl);

      // Use delta for performance monitoring
      const fps = 1 / delta;
      if (fps < 30 && performanceOptimizer.current) {
        // Check if performance tier is high (assuming it has a tier property)
        const currentTier = (performanceOptimizer.current as any).currentTier || 'medium';
        if (currentTier === 'high') {
          logger.warn(`Performance warning: FPS dropped to ${fps.toFixed(1)}`);
        }
      }
    }
  });

  const handleAvatarLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleAvatarError = (error: Error) => {
    logger.error('Profile 3D Avatar load error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    onError?.(error);
  };

  return (
    <group ref={groupRef}>
      {/* Environment */}
      <Environment preset="studio" />

      {/* Camera controls */}
      {showControls && interactive && (
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={5}
          target={[0, 1.2, 0]}
          autoRotate={!interactive}
          autoRotateSpeed={0.5}
        />
      )}

      {/* Avatar */}
      <Avatar3D
        configuration={{
          ...configuration,
          defaultAnimation: animationState, // Apply animation state to configuration
        }}
        lighting="studio"
        quality={quality}
        enableAnimations={true}
        enableControls={false}
        onLoad={handleAvatarLoad}
        onError={handleAvatarError}
      />

      {/* Loading indicator */}
      {!isLoaded && (
        <Html center>
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
          </div>
        </Html>
      )}
    </group>
  );
}

// Hook to fetch user's avatar configuration
function useProfileAvatar(userId?: string) {
  const { user } = useUser();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['profile-avatar', targetUserId],
    queryFn: async (): Promise<AvatarConfiguration | null> => {
      if (!targetUserId) return null;

      try {
        const response = await fetch(`/api/v1/character/config?userId=${targetUserId}`);
        if (response.ok) {
          const data = await response.json();
          return data.ok ? data.data : null;
        }
      } catch (error) {
        logger.error('Failed to fetch profile avatar:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
      return null;
    },
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export default function Profile3DViewer({
  userId,
  configuration,
  size = 'medium',
  interactive = true,
  showControls = true,
  animationState = 'idle',
  quality = 'medium',
  className = '',
  onLoad,
  onError,
}: Profile3DViewerProps) {
  const { data: avatarConfig, isLoading, error } = useProfileAvatar(userId);
  const [viewerError, setViewerError] = useState<Error | null>(null);

  // Use provided configuration or fetched one
  const finalConfiguration = configuration || avatarConfig;

  // Size configurations
  const sizeConfigs = {
    small: {
      width: 120,
      height: 160,
      camera: { position: [0, 1.5, 3] as [number, number, number], fov: 50 },
    },
    medium: {
      width: 240,
      height: 320,
      camera: { position: [0, 1.5, 3] as [number, number, number], fov: 50 },
    },
    large: {
      width: 400,
      height: 500,
      camera: { position: [0, 1.5, 3] as [number, number, number], fov: 50 },
    },
    fullscreen: {
      width: '100%',
      height: '100%',
      camera: { position: [0, 1.5, 3] as [number, number, number], fov: 50 },
    },
  };

  const sizeConfig = sizeConfigs[size];

  const handleLoad = () => {
    setViewerError(null);
    onLoad?.();
  };

  const handleError = (error: Error) => {
    setViewerError(error);
    onError?.(error);
  };

  if (isLoading) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}
        style={{ width: sizeConfig.width, height: sizeConfig.height }}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="w-8 h-8 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Loading avatar...</span>
        </div>
      </div>
    );
  }

  if (error || viewerError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}
        style={{ width: sizeConfig.width, height: sizeConfig.height }}
      >
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg" role="img" aria-label="User avatar">
              <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
            </span>
          </div>
          <span className="text-sm text-gray-400">Avatar unavailable</span>
        </div>
      </div>
    );
  }

  if (!finalConfiguration) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 rounded-lg ${className}`}
        style={{ width: sizeConfig.width, height: sizeConfig.height }}
      >
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg" role="img" aria-label="User avatar">
              <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
            </span>
          </div>
          <span className="text-sm text-gray-400">No avatar configured</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-900 rounded-lg overflow-hidden ${className}`}
      style={{ width: sizeConfig.width, height: sizeConfig.height }}
    >
      <Canvas
        camera={sizeConfig.camera}
        shadows={quality !== 'low'}
        gl={{ antialias: quality !== 'low', alpha: true }}
        dpr={quality === 'ultra' ? [1, 2] : [0.5, 1]}
      >
        <Suspense fallback={null}>
          <Profile3DScene
            configuration={finalConfiguration}
            interactive={interactive}
            showControls={showControls}
            animationState={animationState}
            quality={quality}
            onLoad={handleLoad}
            onError={handleError}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Compact version for lists/grids
export function Profile3DThumbnail({
  userId,
  configuration,
  className = '',
}: {
  userId?: string;
  configuration?: AvatarConfiguration;
  className?: string;
}) {
  return (
    <Profile3DViewer
      userId={userId}
      configuration={configuration}
      size="small"
      interactive={false}
      showControls={false}
      quality="low"
      className={className}
    />
  );
}

// Fullscreen version for detailed viewing
export function Profile3DFullscreen({
  userId,
  configuration,
  onClose,
  className = '',
}: {
  userId?: string;
  configuration?: AvatarConfiguration;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center ${className}`}
    >
      <div className="w-full h-full max-w-4xl max-h-4xl relative">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
            aria-label="Close viewer"
          >
            ×
          </button>
        )}

        {/* 3D Viewer */}
        <Profile3DViewer
          userId={userId}
          configuration={configuration}
          size="fullscreen"
          interactive={true}
          showControls={true}
          quality="high"
        />
      </div>
    </div>
  );
}
