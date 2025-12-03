'use client';

import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';

interface AvatarForGame {
  config: any;
  bundle: any;
  rendering: string;
  isCustom: boolean;
  fallbackConfig?: any;
  spriteUrl?: string;
}

export function useAvatarForGame(enabled: boolean = true, gameMode?: string) {
  const { user } = useUser();

  const { data, isLoading, error } = useQuery({
    queryKey: ['game-avatar', user?.id, gameMode],
    queryFn: async (): Promise<AvatarForGame> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Try to load user's custom avatar
      try {
        const response = await fetch('/api/v1/avatar/load');
        if (response.ok) {
          const result = await response.json();
          if (result.ok && result.data?.avatarConfig) {
            return {
              config: result.data.avatarConfig,
              bundle: result.data.avatarBundle,
              rendering: result.data.avatarRendering || '3d',
              isCustom: true,
            };
          }
        }
      } catch (error) {
        logger.warn('Failed to load custom avatar:', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
      }

      // Fallback to default avatar based on game mode
      const fallbackConfig = getDefaultAvatarForGame(gameMode);
      return {
        config: fallbackConfig,
        bundle: null,
        rendering: '2d',
        isCustom: false,
        fallbackConfig,
      };
    },
    enabled: enabled && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    enabled,
    avatar: data,
    isLoading,
    error,
    isCustomAvatar: data?.isCustom || false,
  };
}

// Get default avatar configuration based on game mode
function getDefaultAvatarForGame(gameMode?: string): any {
  const defaultAvatars = {
    action: {
      gender: 'female',
      age: 'young-adult',
      hair: { color: '#FF69B4', style: 'long', length: 0.8 },
      face: {
        eyes: { color: '#FFD700', size: 1.0 },
        skin: { tone: 0.7 },
      },
      outfit: {
        primary: { type: 'fantasy', color: '#8B0000' },
        secondary: { type: 'fantasy', color: '#FFD700' },
      },
    },
    puzzle: {
      gender: 'male',
      age: 'young-adult',
      hair: { color: '#4169E1', style: 'short', length: 0.4 },
      face: {
        eyes: { color: '#32CD32', size: 0.9 },
        skin: { tone: 0.6 },
      },
      outfit: {
        primary: { type: 'casual', color: '#2E8B57' },
        secondary: { type: 'casual', color: '#FFFFFF' },
      },
    },
    rhythm: {
      gender: 'female',
      age: 'teen',
      hair: { color: '#FFB6C1', style: 'twintails', length: 0.9 },
      face: {
        eyes: { color: '#9370DB', size: 1.2 },
        skin: { tone: 0.8 },
      },
      outfit: {
        primary: { type: 'kawaii', color: '#FF69B4' },
        secondary: { type: 'kawaii', color: '#FFFFFF' },
      },
    },
    strategy: {
      gender: 'male',
      age: 'adult',
      hair: { color: '#000000', style: 'short', length: 0.3 },
      face: {
        eyes: { color: '#8B4513', size: 0.8 },
        skin: { tone: 0.5 },
      },
      outfit: {
        primary: { type: 'formal', color: '#2F2F2F' },
        secondary: { type: 'formal', color: '#8B0000' },
      },
    },
  };

  return defaultAvatars[gameMode as keyof typeof defaultAvatars] || defaultAvatars.action;
}

// Hook for getting avatar renderer props
export function useAvatarRenderer(gameMode?: string, performance?: 'low' | 'balanced' | 'high') {
  const { avatar, isLoading, isCustomAvatar } = useAvatarForGame(true, gameMode);

  const rendererProps = {
    config: avatar?.config,
    mode: performance === 'low' ? '2d' : performance === 'high' ? '3d' : 'auto',
    interactions: gameMode !== 'puzzle',
    physics: gameMode === 'action' || gameMode === 'rhythm',
    fallbackTo2D: true,
  };

  return {
    ...rendererProps,
    isLoading,
    isCustomAvatar,
    hasAvatar: !!avatar?.config,
  };
}
