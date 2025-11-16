/**
 * MiniGameFrame Component
 * 
 * Shared frame component for all mini-games that:
 * - Applies background based on GameVisualProfile
 * - Provides consistent z-index layering for HUD/Overlay
 * - Adds glass border/overlay matching Otakumori aesthetic
 * - Ensures responsive layout (mobile + desktop)
 * - Respects prefers-reduced-motion
 */

'use client';

import { useEffect, useState } from 'react';
import { getGameVisualProfile, type BackgroundStyle } from './gameVisuals';
import StarfieldBackground from '@/app/components/backgrounds/StarfieldBackground';

export interface MiniGameFrameProps {
  gameId: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Get CSS classes for background based on background kind
 */
function getBackgroundClasses(kind: BackgroundStyle, accentColor: string, glowColor?: string): string {
  switch (kind) {
    case 'starfield':
      return 'bg-gradient-to-b from-purple-900 via-purple-800 to-black';
    case 'dojo':
      return 'bg-gradient-to-b from-purple-900/80 via-purple-800/60 to-black';
    case 'arcade':
      return 'bg-gradient-to-b from-indigo-900 via-purple-800 to-black';
    case 'city-abyss':
      return 'bg-gradient-to-b from-indigo-900 via-purple-900 to-black';
    case 'dungeon':
      return 'bg-gradient-to-b from-red-950/80 via-purple-900/60 to-black';
    case 'arena':
      return 'bg-gradient-to-b from-purple-900 via-indigo-900 to-black';
    case 'airy':
      return 'bg-gradient-to-b from-purple-800/60 via-indigo-800/40 to-black';
    case 'chaos':
      return 'bg-gradient-to-b from-purple-900 via-pink-900 to-black';
    case 'bubble':
      return 'bg-gradient-to-b from-purple-800/50 via-pink-800/40 to-black';
    case 'blossom-night':
      return 'bg-gradient-to-b from-purple-900/70 via-pink-900/50 to-black';
    default:
      return 'bg-gradient-to-b from-purple-900 via-purple-800 to-black';
  }
}

/**
 * MiniGameFrame - Wraps game content with consistent visual frame
 */
export function MiniGameFrame({ gameId, children, className = '' }: MiniGameFrameProps) {
  const profile = getGameVisualProfile(gameId);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const bgKind = profile.background.kind;
  const accentColor = profile.background.accentColor;
  const glowColor = profile.background.glowColor;
  const hasVignette = profile.background.vignette ?? false;

  // Use StarfieldBackground for starfield backgrounds
  const useStarfield = bgKind === 'starfield';

  // Get background classes for CSS gradients
  const bgClasses = useStarfield ? '' : getBackgroundClasses(bgKind, accentColor, glowColor);

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden ${bgClasses} ${className}`}
      style={{
        // Apply accent color as CSS variable for potential use in child components
        ['--game-accent-color' as string]: accentColor,
        ['--game-glow-color' as string]: glowColor || accentColor,
      }}
    >
      {/* Starfield background (full-screen, behind everything) */}
      {useStarfield && (
        <StarfieldBackground density={0.72} speed={0.62} zIndex={-10} />
      )}

      {/* Optional inner glow overlay */}
      {glowColor && !useStarfield && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${glowColor}15 0%, transparent 70%)`,
            zIndex: 0,
          }}
        />
      )}

      {/* Optional vignette overlay */}
      {hasVignette && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
            zIndex: 1,
          }}
        />
      )}

      {/* Glass border/overlay matching Otakumori aesthetic */}
      <div
        className="absolute inset-0 pointer-events-none border border-white/10 rounded-none"
        style={{
          boxShadow: 'inset 0 0 60px rgba(236, 72, 153, 0.1)',
          zIndex: 2,
        }}
      />

      {/* Game content (z-index 10 for HUD/Overlay placement) */}
      <div className="relative z-10 min-h-screen w-full">{children}</div>
    </div>
  );
}

