/**
 * Dungeon of Desire - Roguelike Dungeon Crawler
 *
 * Core Fantasy: Descend into the dungeon. Survive rooms and claim rewards.
 *
 * Game Flow: instructions → playing → results
 * Win Condition: Complete dungeon floors
 * Lose Condition: Health reaches 0
 *
 * Progression: Procedural dungeon floors with increasing difficulty
 * Scoring: Base points per room + floor bonus + survival bonus
 * Petals: Awarded based on final score, floors cleared, rooms survived
 */

'use client';

import { generateSEO } from '@/app/lib/seo';
import { logger } from '@/app/lib/logger';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import GameShell from '../_shared/GameShell';
import DungeonGame from './DungeonGame';
import { useGameAvatar } from '../_shared/useGameAvatarWithConfig';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { GameOverlay } from '../_shared/GameOverlay';
import { useGameHud } from '../_shared/useGameHud';
import { usePetalEarn } from '../_shared/usePetalEarn';
import {
  getGameVisualProfile,
  applyVisualProfile,
  getGameDisplayName,
} from '../_shared/gameVisuals';
import { MiniGameFrame } from '../_shared/MiniGameFrame';
import { usePetalBalance } from '@/app/hooks/usePetalBalance';
import { AvatarPresetChoice, type AvatarChoice } from '../_shared/AvatarPresetChoice';
import { getGameAvatarUsage } from '../_shared/miniGameConfigs';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';

export function generateMetadata() {
  return generateSEO({
    title: 'Mini Games',
    description: 'Play mini-games and earn rewards',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\mini-games\dungeon-of-desire\page.tsx',
  });
}
export default function DungeonOfDesirePage() {
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [floor, setFloor] = useState(1);
  const [gameState, setGameState] = useState<
    'instructions' | 'playing' | 'win' | 'lose' | 'paused'
  >('instructions');
  const [finalScore, setFinalScore] = useState(0);
  const [petalReward, setPetalReward] = useState<number | null>(null);
  const [hasAwardedPetals, setHasAwardedPetals] = useState(false);

  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [showAvatarChoice, setShowAvatarChoice] = useState(true); // Show on mount if needed

  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('dungeon-of-desire');
  const {
    avatarConfig,
    representationConfig,
    isLoading: avatarLoading,
  } = useGameAvatar('dungeon-of-desire', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile: avatarChoice === 'creator' ? selectedAvatar : null,
  });

  // Visual profile and HUD
  const visualProfile = getGameVisualProfile('dungeon-of-desire');
  const { backgroundStyle } = applyVisualProfile(visualProfile);
  const { Component: HudComponent, isQuakeHud, props: hudProps } = useGameHud('dungeon-of-desire');
  const { balance: petalBalance } = usePetalBalance();
  const { earnPetals } = usePetalEarn();

  // Game configuration
  const GAME_CONFIG = {
    MAX_HEALTH: 100,
    BASE_SCORE_PER_ROOM: 50,
    FLOOR_BONUS_MULTIPLIER: 100,
  } as const;

  // Handle avatar choice
  const handleAvatarChoice = useCallback((choice: AvatarChoice, avatar?: AvatarProfile | any) => {
    setAvatarChoice(choice);
    if (choice === 'creator' && avatar) {
      setSelectedAvatar(avatar);
    }
    setShowAvatarChoice(false);
    setGameState('instructions');
  }, []);

  // Handle floor progression - award petals per floor cleared
  const handleFloorChange = useCallback(
    async (newFloor: number) => {
      setFloor(newFloor);

      // Award petals for floor completion (except floor 1, which is the starting floor)
      if (newFloor > 1) {
        const floorReward = Math.floor(newFloor * 10); // 20 petals for floor 2, 30 for floor 3, etc.
        await earnPetals({
          gameId: 'dungeon-of-desire',
          score: floorReward * 10, // Convert to score equivalent
          metadata: {
            floorCleared: newFloor - 1, // Previous floor that was cleared
            rewardType: 'floor_completion',
          },
        });
      }
    },
    [earnPetals],
  );

  const handleGameEnd = useCallback(
    async (finalScoreValue: number, didWin: boolean) => {
      setFinalScore(finalScoreValue);
      setGameState(didWin ? 'win' : 'lose');

      // Award petals using hook
      if (!hasAwardedPetals) {
        setHasAwardedPetals(true);
        const result = await earnPetals({
          gameId: 'dungeon-of-desire',
          score: finalScoreValue,
          metadata: {
            didWin,
            floor,
          },
        });

        if (result.success) {
          setPetalReward(result.earned);
        }
      }

      // Submit to leaderboard
      try {
        await fetch('/api/v1/leaderboards/dungeon-of-desire', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: finalScoreValue,
            metadata: {
              didWin,
              floor,
            },
          }),
        });
      } catch (error) {
        logger.error('Failed to submit score:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    },
    [floor, earnPetals, hasAwardedPetals],
  );

  // Check if we should show choice
  const shouldShowChoice =
    showAvatarChoice &&
    avatarUsage === 'avatar-or-preset' &&
    avatarChoice === null &&
    isAvatarsEnabled();

  const displayName = getGameDisplayName('dungeon-of-desire');

  return (
    <MiniGameFrame gameId="dungeon-of-desire">
      <div className="relative min-h-screen" style={backgroundStyle}>
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between">
          <Link
            href="/mini-games"
            className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
          >
            Back to Arcade
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-pink-200">{displayName}</h1>
            <p className="text-sm text-pink-200/70">
              Descend into the dungeon. Survive rooms and claim rewards.
            </p>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Avatar vs Preset Choice */}
        {shouldShowChoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <AvatarPresetChoice
              gameId="dungeon-of-desire"
              onChoice={handleAvatarChoice}
              onCancel={() => setShowAvatarChoice(false)}
            />
          </div>
        )}

        {/* Avatar Display (Bust Mode) - MAIN CHARACTER CENTER STAGE */}
        {!shouldShowChoice && isAvatarsEnabled() && avatarConfig && !avatarLoading && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="relative w-80 h-80">
              <AvatarRenderer
                profile={avatarConfig}
                mode={representationConfig.mode}
                size="large"
              />
            </div>
          </div>
        )}

        {/* HUD - uses loader for cosmetics */}
        {isQuakeHud ? (
          <HudComponent {...hudProps} petals={petalBalance} gameId="dungeon-of-desire" />
        ) : (
          <HudComponent
            {...hudProps}
            score={score}
            health={health}
            maxHealth={GAME_CONFIG.MAX_HEALTH}
          />
        )}

        <GameShell title="Dungeon of Desire" gameKey="dungeon-of-desire">
          <DungeonGame
            onScoreChange={setScore}
            onHealthChange={setHealth}
            onFloorChange={handleFloorChange}
            onGameEnd={handleGameEnd}
          />
        </GameShell>

        {/* Game Overlay */}
        <GameOverlay
          state={gameState}
          instructions={[
            'Navigate through dungeon rooms',
            'Defeat enemies to progress',
            'Collect items and power-ups',
            'Survive to reach deeper floors',
            'Each floor increases difficulty',
          ]}
          winMessage={`Dungeon Master! You cleared floor ${floor}!`}
          loseMessage="Your health reached zero. Try again!"
          score={finalScore || score}
          petalReward={petalReward}
          onRestart={() => {
            setGameState('playing');
            setPetalReward(null);
            setHasAwardedPetals(false);
          }}
          onResume={() => {
            setGameState('playing');
            setPetalReward(null);
            setHasAwardedPetals(false);
          }}
        />
      </div>
    </MiniGameFrame>
  );
}
