/**
 * Game HUD Loader Hook
 * 
 * Centralized HUD selection based on cosmetics state
 * Games should use this hook instead of manually choosing HUD components
 */

'use client';

import { useCosmetics } from '@/app/lib/cosmetics/useCosmetics';
import { getHudForGame } from './gameVisuals';
import { GameHUD } from './GameHUD';
import { QuakeAvatarHud } from '@/app/components/arcade/QuakeAvatarHud';
import type { GameHUDProps } from './GameHUD';
import type { QuakeAvatarHudProps } from '@/app/components/arcade/QuakeAvatarHud';

/**
 * Hook to get the appropriate HUD component for a game
 * Returns the HUD component and props based on cosmetics state
 */
export function useGameHud(gameId: string) {
  const cosmetics = useCosmetics();
  
  const hudSkin = getHudForGame(gameId, {
    hudSkin: cosmetics.hudSkin,
    isUnlocked: cosmetics.isUnlocked,
  });

  // Return the appropriate HUD component
  if (hudSkin === 'quake') {
    return {
      Component: QuakeAvatarHud,
      isQuakeHud: true,
      props: {
        gameId,
        mode: 'passive' as const,
        petals: 0, // Will be updated by parent with real balance
      } satisfies Partial<QuakeAvatarHudProps>,
    };
  }

  return {
    Component: GameHUD,
    isQuakeHud: false,
    props: {} as GameHUDProps,
  };
}

/**
 * Render the appropriate HUD for a game
 * Convenience component that handles HUD selection automatically
 */
export function GameHudLoader({
  gameId,
  hudProps,
  quakeHudProps,
}: {
  gameId: string;
  hudProps?: GameHUDProps;
  quakeHudProps?: Partial<QuakeAvatarHudProps>;
}) {
  const { Component, props: defaultProps } = useGameHud(gameId);

  if (Component === QuakeAvatarHud) {
    return <Component {...defaultProps} {...quakeHudProps} />;
  }

  return <Component {...defaultProps} {...hudProps} />;
}

