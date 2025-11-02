'use client';

import React from 'react';
import { useGameAvatar, drawGameAvatar } from './GameAvatarRenderer';

interface GameAvatarIntegrationProps {
  gameId: string;
  gameMode?: string;
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  className?: string;
  style?: React.CSSProperties;
  enable3D?: boolean;
  enableAnimations?: boolean;
  animationState?: string;
  position?: [number, number, number];
  scale?: [number, number, number];
}

// Hook for canvas-based games to get avatar data
export function useGameAvatarData(gameId: string, gameMode?: string) {
  const { data: avatarData, isLoading, error } = useGameAvatar(gameId, gameMode);

  return {
    avatarData,
    isLoading,
    error,
    // Helper function for canvas rendering
    drawAvatar: (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      rotation: number = 0,
    ) => {
      if (avatarData) {
        drawGameAvatar(ctx, avatarData, x, y, width, height, rotation);
      }
    },
  };
}

// Component for games that want to render avatars in DOM
export function GameAvatarIntegration({
  gameId,
  gameMode = 'default',
  quality = 'medium',
  className = '',
  style = {},
  enable3D = true,
  enableAnimations = true,
  animationState = 'idle',
  position = [0, 0, 0],
  scale = [1, 1, 1],
}: GameAvatarIntegrationProps) {
  const { data: avatarData, isLoading, error } = useGameAvatar(gameId, gameMode);
  const [posX, posY, posZ] = position;
  const [scaleX, scaleY, scaleZ] = scale;
  const containerClassName = `flex items-center justify-center ${className}`.trim();
  const sharedAttributes = {
    'data-quality': quality,
    'data-enable-3d': enable3D,
    'data-enable-animations': enableAnimations,
    'data-animation-state': animationState,
  } as const;

  if (isLoading) {
    return (
      <div
        className={containerClassName}
        style={style}
        aria-busy="true"
        aria-live="polite"
        {...sharedAttributes}
      >
        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <span role="img" aria-label="Loading avatar" className="text-white text-lg">
            ⏳
          </span>
        </div>
      </div>
    );
  }

  if (error || !avatarData) {
    return (
      <div
        className={containerClassName}
        style={style}
        role="alert"
        aria-live="assertive"
        {...sharedAttributes}
      >
        <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
          <span role="img" aria-label="Avatar unavailable" className="text-white text-lg">
            🚫
          </span>
        </div>
      </div>
    );
  }

  // For now, render a simple 2D avatar
  // In the future, this could render a 3D avatar based on enable3D prop
  return (
    <div className={containerClassName} style={style} {...sharedAttributes}>
      <div
        className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
        style={{
          transform: `translate3d(${posX}px, ${posY}px, ${posZ}px) scale3d(${scaleX}, ${scaleY}, ${scaleZ})`,
          transformOrigin: 'center center',
        }}
        data-enable-3d={enable3D}
        data-enable-animations={enableAnimations}
      >
        {avatarData.fallbackSpriteUrl ? (
          <img
            src={avatarData.fallbackSpriteUrl}
            alt="Avatar"
            className="w-10 h-10 object-cover rounded-full"
            style={{ imageRendering: 'pixelated' }}
            data-animation-state={animationState}
          />
        ) : (
          <span role="img" aria-label="Avatar placeholder" className="text-white text-lg">
            🎮
          </span>
        )}
      </div>
    </div>
  );
}

// Utility functions for game developers
export const GameAvatarUtils = {
  // Get avatar configuration for a specific game
  getAvatarConfig: async (gameId: string, gameMode?: string, userId?: string) => {
    try {
      const params = new URLSearchParams({
        gameId,
        mode: gameMode || 'default',
      });

      if (userId) {
        params.set('userId', userId);
      }

      const response = await fetch(`/api/v1/character/config?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        return data.ok ? data.data : null;
      }
    } catch (fetchError) {
      console.error('Failed to fetch avatar config:', fetchError);
    }
    return null;
  },

  // Save avatar configuration
  saveAvatarConfig: async (config: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/v1/character/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const data = await response.json();
        return data.ok ? data.data : null;
      }
    } catch (saveError) {
      console.error('Failed to save avatar config:', saveError);
    }
    return null;
  },

  // Generate sprite from 3D model (placeholder for future implementation)
  generateSpriteFrom3D: async (
    config: Record<string, unknown>,
    options: { width: number; height: number; angle?: number },
  ) => {
    // This would use the 3D avatar system to render a sprite
    // For now, return a default sprite URL with the requested parameters encoded
    const { width, height, angle = 0 } = options;
    const configSignature = JSON.stringify(config ?? {});
    const params = new URLSearchParams({
      width: String(width),
      height: String(height),
      angle: String(angle),
      signature: String(configSignature.length),
    });

    return `/assets/default-avatar.png?${params.toString()}`;
  },

  // Get performance settings based on device capabilities
  getPerformanceSettings: () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
      return { quality: 'low', enable3D: false, enableAnimations: false };
    }

    // Check for high-end GPU
    const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      if (
        renderer.includes('RTX') ||
        renderer.includes('GTX 1080') ||
        renderer.includes('RX 580')
      ) {
        return { quality: 'high', enable3D: true, enableAnimations: true };
      }
      if (renderer.includes('Intel')) {
        return { quality: 'low', enable3D: false, enableAnimations: false };
      }
    }

    // Default settings
    return { quality: 'medium', enable3D: true, enableAnimations: true };
  },
};

// Game-specific avatar presets
export const GameAvatarPresets = {
  // Bubble Ragdoll specific settings
  bubbleRagdoll: {
    quality: 'medium' as const,
    enable3D: false, // Canvas-based game
    enableAnimations: true,
    animationState: 'idle',
  },

  // Petal Samurai specific settings
  petalSamurai: {
    quality: 'high' as const,
    enable3D: true,
    enableAnimations: true,
    animationState: 'idle',
  },

  // Memory Match specific settings
  memoryMatch: {
    quality: 'low' as const,
    enable3D: false,
    enableAnimations: false,
    animationState: 'idle',
  },

  // Puzzle Reveal specific settings
  puzzleReveal: {
    quality: 'medium' as const,
    enable3D: false,
    enableAnimations: false,
    animationState: 'idle',
  },
};
