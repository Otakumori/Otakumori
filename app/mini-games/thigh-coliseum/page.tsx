/**
 * Thigh Coliseum - Arena Combat Game
 *
 * Core Fantasy: Enter the arena. Win rounds and advance the bracket.
 *
 * Game Flow: instructions → playing → results
 * Win Condition: Win all rounds in bracket
 * Lose Condition: Lose all lives
 *
 * Progression: Bracket-style tournament with increasing difficulty
 * Scoring: Base points per round + win streak + bracket position
 * Petals: Awarded based on final score, rounds won, bracket position
 */

'use client';

import { generateSEO } from '@/app/lib/seo';
import { logger } from '@/app/lib/logger';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import GameShell from '../_shared/GameShell';
import ThighChaseGame from './ThighChaseGame';
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
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\mini-games\thigh-coliseum\page.tsx',
  });
}
export default function ThighColiseumPage() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [stage, setStage] = useState(1);
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
  const avatarUsage = getGameAvatarUsage('thigh-coliseum');
  const {
    avatarConfig,
    representationConfig,
    isLoading: avatarLoading,
  } = useGameAvatar('thigh-coliseum', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile: avatarChoice === 'creator' ? selectedAvatar : null,
  });

  // Visual profile and HUD
  const visualProfile = getGameVisualProfile('thigh-coliseum');
  const { backgroundStyle } = applyVisualProfile(visualProfile);
  const { Component: HudComponent, isQuakeHud, props: hudProps } = useGameHud('thigh-coliseum');
  const { balance: petalBalance } = usePetalBalance();
  const { earnPetals } = usePetalEarn();

  // Game configuration - reserved for future game logic tuning
  // const GAME_CONFIG = {
  //   INITIAL_LIVES: 3,
  //   BASE_SCORE_PER_ROUND: 100,
  //   STAGE_BONUS_MULTIPLIER: 50,
  // } as const;

  // Handle avatar choice
  const handleAvatarChoice = useCallback((choice: AvatarChoice, avatar?: AvatarProfile | any) => {
    setAvatarChoice(choice);
    if (choice === 'creator' && avatar) {
      setSelectedAvatar(avatar);
    }
    setShowAvatarChoice(false);
    setGameState('instructions');
  }, []);

  // Handle stage progression - award milestone petals
  const handleStageChange = useCallback(
    async (newStage: number) => {
      setStage(newStage);

      // Award petals for stage milestones (every 5 stages)
      if (newStage > 1 && newStage % 5 === 0) {
        const milestoneReward = Math.floor(newStage * 5); // 25 petals for stage 5, 50 for stage 10, etc.
        await earnPetals({
          gameId: 'thigh-coliseum',
          score: milestoneReward * 10,
          metadata: {
            milestoneType: 'stage',
            milestoneValue: newStage,
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
          gameId: 'thigh-coliseum',
          score: finalScoreValue,
          metadata: {
            didWin,
            stage,
            lives,
          },
        });

        if (result.success) {
          setPetalReward(result.earned);
        }
      }

      // Submit to leaderboard
      try {
        await fetch('/api/v1/leaderboards/thigh-coliseum', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: finalScoreValue,
            metadata: {
              didWin,
              stage,
              lives,
            },
          }),
        });
      } catch (error) {
        logger.error('Failed to submit score:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    },
    [stage, lives, earnPetals, hasAwardedPetals],
  );

  // Check if we should show choice
  const shouldShowChoice =
    showAvatarChoice &&
    avatarUsage === 'avatar-or-preset' &&
    avatarChoice === null &&
    isAvatarsEnabled();

  const displayName = getGameDisplayName('thigh-coliseum');

  return (
    <MiniGameFrame gameId="thigh-coliseum">
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
              Enter the arena. Win rounds and advance the bracket.
            </p>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Avatar vs Preset Choice */}
        {shouldShowChoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <AvatarPresetChoice
              gameId="thigh-coliseum"
              onChoice={handleAvatarChoice}
              onCancel={() => setShowAvatarChoice(false)}
            />
          </div>
        )}

        {/* Avatar Display (FullBody Mode) - MAIN CHARACTER CENTER STAGE */}
        {!shouldShowChoice && isAvatarsEnabled() && avatarConfig && !avatarLoading && (
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="relative w-96 h-96">
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
          <HudComponent {...hudProps} petals={petalBalance} gameId="thigh-coliseum" />
        ) : (
          <HudComponent {...hudProps} score={score} lives={lives} />
        )}

        <GameShell title="Thigh Colosseum" gameKey="thigh-coliseum">
          <ThighChaseGame
            onScoreChange={setScore}
            onLivesChange={setLives}
            onStageChange={handleStageChange}
            onGameEnd={handleGameEnd}
          />
        </GameShell>

        {/* Game Overlay */}
        <GameOverlay
          state={gameState}
          instructions={[
            'Win rounds to advance in the bracket',
            'Defeat opponents to progress',
            'Use strategy and timing',
            'Survive with your lives',
            'Reach the final round to win!',
          ]}
          winMessage={`Arena Champion! You won stage ${stage}!`}
          loseMessage="All lives lost. Try again!"
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
