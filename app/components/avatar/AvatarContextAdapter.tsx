/**
 * Avatar Context Adapter
 * Dynamically modifies avatar appearance based on game environment
 */

'use client';

import React, { useEffect, useMemo } from 'react';
import { useAvatarStore } from '@/app/stores/avatarStore';
import { useProceduralAsset, PREDEFINED_PALETTES } from '@/app/hooks/useProceduralAssets';

export type GameContext =
  | 'default'
  | 'game'
  | 'combat'
  | 'social'
  | 'memory-match'
  | 'petal-samurai'
  | 'puzzle-reveal';

interface ContextModifiers {
  brightness: number;
  saturation: number;
  scale: number;
  rotation: number;
  effects: string[];
  }

const CONTEXT_MODIFIERS: Record<GameContext, ContextModifiers> = {
  default: {
    brightness: 1,
    saturation: 1,
    scale: 1,
    rotation: 0,
    effects: [],
  },
  game: {
    brightness: 1.1,
    saturation: 1.2,
    scale: 1.05,
    rotation: 0,
    effects: ['glow'],
  },
  combat: {
    brightness: 0.9,
    saturation: 1.3,
    scale: 1.1,
    rotation: 5,
    effects: ['battle-aura', 'speed-lines'],
  },
  social: {
    brightness: 1.2,
    saturation: 0.9,
    scale: 1,
    rotation: 0,
    effects: ['sparkles'],
  },
  'memory-match': {
    brightness: 1,
    saturation: 1.1,
    scale: 0.95,
    rotation: 0,
    effects: ['card-particles'],
  },
  'petal-samurai': {
    brightness: 1.1,
    saturation: 1.4,
    scale: 1.15,
    rotation: 10,
    effects: ['petal-trail', 'katana-glow'],
  },
  'puzzle-reveal': {
    brightness: 1.05,
    saturation: 1,
    scale: 1,
    rotation: 0,
    effects: ['puzzle-pieces'],
  },
};

interface AvatarContextAdapterProps {
  context: GameContext;
  children: React.ReactNode;
  enableEffects?: boolean;
}

export default function AvatarContextAdapter({
  context,
  children,
  enableEffects = true,
}: AvatarContextAdapterProps) {
  const { avatar, setContextAdaptation } = useAvatarStore();
  const modifiers = CONTEXT_MODIFIERS[context];

  // Update store context
  useEffect(() => {
    if (avatar.contextAdaptation.enabled) {
      setContextAdaptation(
        context === 'default'
          ? 'default'
          : context === 'combat'
            ? 'combat'
            : context === 'social'
              ? 'social'
              : 'game',
      );
    }
  }, [context, avatar.contextAdaptation.enabled, setContextAdaptation]);

  // Generate context-specific procedural effects
  const { asset: contextEffect } = useProceduralAsset(
    useMemo(() => {
      if (!enableEffects || modifiers.effects.length === 0) return null;

      return {
        type: 'noise' as const,
        width: 128,
        height: 128,
        seed: `context-${context}`,
        palette:
          PREDEFINED_PALETTES[
            context === 'combat' ? 'fire' : context === 'social' ? 'sakura' : 'cyberpunk'
          ],
        config: { scale: 0.1, octaves: 3 },
      };
    }, [context, enableEffects, modifiers.effects.length]),
  );

  const containerStyle: React.CSSProperties = {
    transform: `scale(${modifiers.scale}) rotate(${modifiers.rotation}deg)`,
    filter: `brightness(${modifiers.brightness}) saturate(${modifiers.saturation})`,
    transition: 'all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  };

  return (
    <div className="relative" style={containerStyle}>
      {children}

      {/* Context Effects Overlay */}
      {enableEffects && modifiers.effects.length > 0 && (
        <div className="pointer-events-none absolute inset-0">
          {modifiers.effects.includes('glow') && (
            <div className="absolute inset-0 animate-pulse rounded-full bg-pink-500/20 blur-xl" />
          )}

          {modifiers.effects.includes('battle-aura') && (
            <div className="absolute inset-0 animate-pulse rounded-full bg-red-500/30 blur-2xl" />
          )}

          {modifiers.effects.includes('speed-lines') && (
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute h-full w-1 animate-speed-line-1 bg-gradient-to-b from-transparent via-white/50 to-transparent"
                style={{ left: '20%' }}
              />
              <div
                className="absolute h-full w-1 animate-speed-line-2 bg-gradient-to-b from-transparent via-white/50 to-transparent"
                style={{ left: '50%' }}
              />
              <div
                className="absolute h-full w-1 animate-speed-line-3 bg-gradient-to-b from-transparent via-white/50 to-transparent"
                style={{ left: '80%' }}
              />
            </div>
          )}

          {modifiers.effects.includes('sparkles') && (
            <div className="absolute inset-0">
              <div className="absolute animate-sparkle-1" style={{ top: '10%', left: '20%' }}>
                <span role="img" aria-label="sparkle">
                  <span role="img" aria-label="sparkles">✨</span>
                </span>
              </div>
              <div className="absolute animate-sparkle-2" style={{ top: '60%', left: '70%' }}>
                <span role="img" aria-label="sparkle">
                  <span role="img" aria-label="sparkles">✨</span>
                </span>
              </div>
              <div className="absolute animate-sparkle-3" style={{ top: '30%', left: '90%' }}>
                <span role="img" aria-label="sparkle">
                  <span role="img" aria-label="sparkles">✨</span>
                </span>
              </div>
            </div>
          )}

          {modifiers.effects.includes('petal-trail') && (
            <div className="absolute inset-0 opacity-50">
              <div className="absolute animate-petal-float" style={{ top: '10%', left: '30%' }}>
                <span role="img" aria-label="floating petal">
                  <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
                </span>
              </div>
              <div
                className="absolute animate-petal-float-delayed"
                style={{ top: '50%', left: '60%' }}
              >
                <span role="img" aria-label="floating petal">
                  <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
                </span>
              </div>
            </div>
          )}

          {contextEffect && modifiers.effects.includes('puzzle-pieces') && (
            <div className="absolute inset-0 opacity-20">
              <img
                src={contextEffect.dataUrl}
                alt=""
                className="h-full w-full object-cover mix-blend-overlay"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Add these animations to globals.css:
/*
@keyframes speed-line-1 {
  0%, 100% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
}

@keyframes speed-line-2 {
  0%, 100% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  animation-delay: 0.1s;
}

@keyframes speed-line-3 {
  0%, 100% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  animation-delay: 0.2s;
}

@keyframes sparkle-1 {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes sparkle-2 {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
  animation-delay: 0.3s;
}

@keyframes sparkle-3 {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
  animation-delay: 0.6s;
}

@keyframes petal-float {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-100px) rotate(360deg); }
}

@keyframes petal-float-delayed {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-100px) rotate(-360deg); }
  animation-delay: 0.5s;
}
*/
