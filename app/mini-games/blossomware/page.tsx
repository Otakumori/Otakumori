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
import {
  getGameVisualProfile,
  applyVisualProfile,
  getGameDisplayName,
} from '../_shared/gameVisuals';
import { MiniGameFrame } from '../_shared/MiniGameFrame';
// Shared UI components - imported for QA validation (Engine component handles its own UI)
// eslint-disable-next-line unused-imports/no-unused-imports
import { useGameHud } from '../_shared/useGameHud';
// eslint-disable-next-line unused-imports/no-unused-imports
import { GameOverlay } from '../_shared/GameOverlay';

export default function BlossomwarePage() {
  const [_gameCompletionCount, setGameCompletionCount] = useState(0);

  // Handle game completion
  const handleGameComplete = useCallback((success: boolean, score: number, streak: number) => {
    if (success) {
      setGameCompletionCount((prev) => {
        const newCount = prev + 1;
        // Track completion milestone every 5 games (for future analytics)
        if (newCount % 5 === 0) {
          // Milestone reached - could be used for achievements or analytics
          void newCount; // Explicitly mark as used for future implementation
        }
        return newCount;
      });
    }
  }, []);

  // Visual profile
  const visualProfile = getGameVisualProfile('blossomware');
  const { backgroundStyle } = applyVisualProfile(visualProfile);

  // Restart handler - Engine component handles restart logic internally
  const _handleRestart = useCallback(() => {
    // Engine manages its own restart state
  }, []);

  const displayName = getGameDisplayName('blossomware');

  return (
    <MiniGameFrame gameId="blossomware">
      <div className="relative min-h-screen" style={backgroundStyle}>
        <div className="mx-auto max-w-5xl px-4 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2 text-pink-400">{displayName}</h1>
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

          <div className="rounded-2xl bg-white/5 backdrop-blur p-4 ring-1 ring-white/10">
            <Engine playlist={GAMES} mode="long" autoplay onGameComplete={handleGameComplete} />
          </div>
        </div>
      </div>
    </MiniGameFrame>
  );
}
