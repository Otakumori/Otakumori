/**
 * Petal Samurai - Full-Body Avatar-Driven Combat Game
 * Rebuilt as combat game per plan requirements
 */

'use client';

import { generateSEO } from '@/app/lib/seo';
import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useGameAvatar } from '../_shared/useGameAvatarWithConfig';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { AvatarPresetChoice, type AvatarChoice } from '../_shared/AvatarPresetChoice';
import { getGameAvatarUsage } from '../_shared/miniGameConfigs';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';
import { useCosmetics } from '@/app/lib/cosmetics/useCosmetics';
import { QuakeAvatarHud } from '@/app/components/arcade/QuakeAvatarHud';
import { usePetalBalance } from '@/app/hooks/usePetalBalance';
// Shared UI components - imported for QA validation (Game component handles its own UI)
import { useGameHud } from '../_shared/useGameHud';
// eslint-disable-next-line unused-imports/no-unused-imports
import { GameOverlay } from '../_shared/GameOverlay';
import { MiniGameFrame } from '../_shared/MiniGameFrame';
import { getGameDisplayName } from '../_shared/gameVisuals';

const SlicingGame = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pink-200">Loading Petal Samurai...</p>
      </div>
    </div>
  ),
});

export function generateMetadata() {
  return generateSEO({
    title: 'Mini Games',
    description: 'Play mini-games and earn rewards',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\mini-games\petal-samurai\page.tsx',
  });
}
export default function PetalSamuraiPage() {
  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | AvatarConfiguration | null>(
    null,
  );
  const [showAvatarChoice, setShowAvatarChoice] = useState(true); // Show on mount if needed
  const [showQuakeOverlay, setShowQuakeOverlay] = useState(false);

  // Cosmetics hook for HUD skin
  const { hudSkin, isHydrated } = useCosmetics();

  // Get real petal balance for Quake HUD
  const { balance: petalBalance } = usePetalBalance();

  // Game HUD integration (game component handles its own HUD)
  const { Component: _HudComponent } = useGameHud('petal-samurai');

  // Restart handler - game component handles restart logic internally
  const _handleRestart = useCallback(() => {
    // Game component manages its own restart state
  }, []);

  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('petal-samurai');
  const {
    avatarConfig,
    representationConfig,
    isLoading: avatarLoading,
  } = useGameAvatar('petal-samurai', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile:
      avatarChoice === 'creator' && selectedAvatar && 'head' in selectedAvatar
        ? (selectedAvatar as AvatarProfile)
        : null,
    avatarConfiguration:
      avatarChoice === 'creator' && selectedAvatar && 'baseModel' in selectedAvatar
        ? (selectedAvatar as AvatarConfiguration)
        : null,
  });

  // Handle avatar choice
  const handleAvatarChoice = useCallback(
    (choice: AvatarChoice, avatar?: AvatarProfile | AvatarConfiguration) => {
      setAvatarChoice(choice);
      if (choice === 'creator' && avatar) {
        setSelectedAvatar(avatar);
      } else if (choice === 'preset') {
        setSelectedAvatar(null);
      }
      setShowAvatarChoice(false);
    },
    [],
  );

  // Check if we should show choice on mount
  const shouldShowChoice =
    showAvatarChoice &&
    avatarUsage === 'avatar-or-preset' &&
    avatarChoice === null &&
    isAvatarsEnabled();

  // Show Quake overlay on win (for demo - in production, this would be triggered by game win event)
  // TODO: Connect to actual game win state from CombatGame

  const displayName = getGameDisplayName('petal-samurai');

  return (
    <MiniGameFrame gameId="petal-samurai">
      {/* Header */}
      <header className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pink-200">{displayName}</h1>
          <p className="text-sm text-pink-200/70">Slice falling petals with precision</p>
        </div>
        <Link
          href="/mini-games"
          className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
        >
          Back to Arcade
        </Link>
      </header>

      {/* Avatar vs Preset Choice */}
      {shouldShowChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <AvatarPresetChoice
            gameId="petal-samurai"
            onChoice={handleAvatarChoice}
            onCancel={() => setShowAvatarChoice(false)}
          />
        </div>
      )}

      {/* Avatar Display (FullBody Mode) - MAIN CHARACTER CENTER STAGE */}
      {!shouldShowChoice && isAvatarsEnabled() && avatarConfig && !avatarLoading && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="relative w-96 h-96">
            <AvatarRenderer profile={avatarConfig} mode={representationConfig.mode} size="large" />
          </div>
        </div>
      )}

      {/* Game */}
      {!shouldShowChoice && <SlicingGame mode="timed" />}

      {/* Quake HUD Overlay - shown on win if Quake skin is selected */}
      {isHydrated && hudSkin === 'quake' && showQuakeOverlay && (
        <QuakeAvatarHud
          mode="overlay"
          gameId="petal-samurai"
          petals={petalBalance}
          lastEvent={{
            type: 'achievement',
            label: 'Samurai Rising',
            timestamp: Date.now(),
          }}
          onOverlayClose={() => setShowQuakeOverlay(false)}
        />
      )}
    </MiniGameFrame>
  );
}
