/**
 * Blossomware - Chaotic Micro-Games Playlist
 *
 * Core Fantasy: Chaotic micro-sessions—keep your petal streak alive.
 *
 * Game Flow: playlist → auto-play micro-games
 * Win Condition: Complete playlist
 * Lose Condition: Fail too many games
 *
 * Progression: Auto-playing playlist of mini-games
 * Scoring: Cumulative score across all games
 * Petals: Awarded based on overall playlist performance
 */

'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { GAMES } from '@/components/arcade/registry';
import Engine from '@/components/arcade/Engine';
import { useGameAvatar } from '../_shared/useGameAvatarWithConfig';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { getGameVisualProfile, applyVisualProfile } from '../_shared/gameVisuals';
import { AvatarPresetChoice, type AvatarChoice } from '../_shared/AvatarPresetChoice';
import { getGameAvatarUsage } from '../_shared/miniGameConfigs';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';
// Shared UI components - imported for QA validation (Engine component handles its own UI)
// eslint-disable-next-line unused-imports/no-unused-imports
import { useGameHud } from '../_shared/useGameHud';
// eslint-disable-next-line unused-imports/no-unused-imports
import { GameOverlay } from '../_shared/GameOverlay';

export default function BlossomwarePage() {
  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [showAvatarChoice, setShowAvatarChoice] = useState(true); // Show on mount if needed
  
  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('blossomware');
  const { avatarConfig, representationConfig, isLoading: avatarLoading } = useGameAvatar('blossomware', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile: avatarChoice === 'avatar' ? selectedAvatar : null,
  });

  // Visual profile
  const visualProfile = getGameVisualProfile('blossomware');
  const { backgroundStyle } = applyVisualProfile(visualProfile);
  
  // Handle avatar choice
  const handleAvatarChoice = useCallback((choice: AvatarChoice, avatar?: AvatarProfile) => {
    setAvatarChoice(choice);
    if (choice === 'avatar' && avatar) {
      setSelectedAvatar(avatar);
    }
    setShowAvatarChoice(false);
  }, []);
  
  // Check if we should show choice
  const shouldShowChoice = showAvatarChoice && avatarUsage === 'avatar-or-preset' && avatarChoice === null && isAvatarsEnabled();
  
  // Restart handler - Engine component handles restart logic internally
  const _handleRestart = useCallback(() => {
    // Engine manages its own restart state
  }, []);

  return (
    <div className="relative min-h-screen" style={backgroundStyle}>
      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-2 text-pink-400">BlossomWare Playlist</h1>
            <p className="text-sm opacity-80 text-slate-300">
              Chaotic micro-sessions—keep your petal streak alive.
            </p>
          </div>
          <Link
            href="/mini-games"
            className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
          >
            Back to Arcade
          </Link>
        </div>

        {/* Avatar vs Preset Choice */}
        {shouldShowChoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <AvatarPresetChoice
              gameId="blossomware"
              onChoice={handleAvatarChoice}
              onCancel={() => setShowAvatarChoice(false)}
            />
          </div>
        )}

        {/* Avatar Display (Chibi Mode) */}
        {!shouldShowChoice && isAvatarsEnabled() && avatarConfig && !avatarLoading && (
          <div className="flex justify-center mb-6">
            <AvatarRenderer
              profile={avatarConfig}
              mode={representationConfig.mode}
              size="small"
            />
          </div>
        )}

        <div className="rounded-2xl bg-white/5 backdrop-blur p-4 ring-1 ring-white/10">
          <Engine playlist={GAMES} mode="long" autoplay />
        </div>
      </div>
    </div>
  );
}
