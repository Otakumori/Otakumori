/**
 * Puzzle Reveal - Tile Reveal Puzzle Game
 *
 * Core Fantasy: Clear the fog to reveal the art. Watch your energy.
 *
 * Game Flow: instructions → playing → results
 * Win Condition: Reveal all tiles before energy runs out
 * Lose Condition: Energy reaches 0 before all tiles revealed
 *
 * Progression: Difficulty increases with grid size (easy: 4×3, medium: 6×5, hard: 8×6, expert: 10×8)
 * Scoring: Base points per tile + combo multipliers + speed bonus
 * Petals: Awarded based on final score, combo, difficulty
 */

'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import GlassCard from '../../components/ui/GlassCard';
import { useGameAvatar } from '../_shared/useGameAvatarWithConfig';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { GameOverlay } from '../_shared/GameOverlay';
import { useGameHud } from '../_shared/useGameHud';
import { usePetalEarn } from '../_shared/usePetalEarn';
import { getGameVisualProfile, applyVisualProfile, getGameDisplayName } from '../_shared/gameVisuals';
import { MiniGameFrame } from '../_shared/MiniGameFrame';
import { usePetalBalance } from '@/app/hooks/usePetalBalance';
import { AvatarPresetChoice, type AvatarChoice } from '../_shared/AvatarPresetChoice';
import { getGameAvatarUsage } from '../_shared/miniGameConfigs';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';

const EnhancedTileGame = dynamic(() => import('./EnhancedTileGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pink-200">Loading artwork...</p>
      </div>
    </div>
  ),
});

type GameMode = 'easy' | 'medium' | 'hard' | 'expert';

export default function PuzzleRevealPage() {
  const [mode, setMode] = useState<GameMode>('medium');
  const [key, setKey] = useState(0); // Force remount on mode change
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'win' | 'lose' | 'paused'>('instructions');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [petalReward, setPetalReward] = useState<number | null>(null);
  const [hasAwardedPetals, setHasAwardedPetals] = useState(false);
  
  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [showAvatarChoice, setShowAvatarChoice] = useState(false);
  
  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('puzzle-reveal');
  const { avatarConfig, representationConfig, isLoading: avatarLoading } = useGameAvatar('puzzle-reveal', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile: avatarChoice === 'avatar' ? selectedAvatar : null,
  });

  // Visual profile and HUD
  const visualProfile = getGameVisualProfile('puzzle-reveal');
  const { backgroundStyle } = applyVisualProfile(visualProfile);
  const { Component: HudComponent, isQuakeHud, props: hudProps } = useGameHud('puzzle-reveal');
  const { balance: petalBalance } = usePetalBalance();
  const { earnPetals } = usePetalEarn();

  // Game configuration - reserved for future game logic tuning
  // const GAME_CONFIG = {
  //   BASE_SCORE_PER_TILE: 100,
  //   COMBO_BONUS_PER_LEVEL: 50,
  //   MAX_COMBO: 10,
  //   COMBO_WINDOW_MS: 500,
  //   DIFFICULTY_MULTIPLIERS: {
  //     easy: 1,
  //     medium: 1.5,
  //     hard: 2,
  //     expert: 3,
  //   },
  // } as const;
  
  // Handle avatar choice
  const handleAvatarChoice = useCallback((choice: AvatarChoice, avatar?: AvatarProfile) => {
    setAvatarChoice(choice);
    if (choice === 'avatar' && avatar) {
      setSelectedAvatar(avatar);
    }
    setShowAvatarChoice(false);
    setGameState('instructions');
  }, []);

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    setKey((prev) => prev + 1); // Restart game with new mode
  };

  const handleStart = () => {
    // Check if avatar choice is needed
    if (avatarUsage === 'avatar-or-preset' && avatarChoice === null && isAvatarsEnabled()) {
      setShowAvatarChoice(true);
      return;
    }
    setGameState('playing');
    setPetalReward(null);
    setHasAwardedPetals(false);
  };

  const handleRestart = () => {
    setKey((prev) => prev + 1);
    setGameState('playing');
    setPetalReward(null);
    setHasAwardedPetals(false);
  };

  const handleGameEnd = useCallback(async (finalScoreValue: number, didWin: boolean) => {
    setFinalScore(finalScoreValue);
    setGameState(didWin ? 'win' : 'lose');

    // Award petals using hook
    if (!hasAwardedPetals) {
      setHasAwardedPetals(true);
      const result = await earnPetals({
        gameId: 'puzzle-reveal',
        score: finalScoreValue,
        metadata: {
          mode,
          didWin,
          combo,
        },
      });

      if (result.success) {
        setPetalReward(result.earned);
      }
    }

    // Submit to leaderboard
    try {
      await fetch('/api/v1/leaderboards/puzzle-reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: finalScoreValue,
          metadata: {
            mode,
            didWin,
            combo,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }, [mode, combo, earnPetals, hasAwardedPetals]);

  const displayName = getGameDisplayName('puzzle-reveal');

  return (
    <MiniGameFrame gameId="puzzle-reveal">
      <main className="min-h-screen p-4 page-transition" style={backgroundStyle}>
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Puzzle Reveal
              </h1>
              <p className="text-zinc-300 font-medium">
                Click tiles to reveal breathtaking artwork. Fast clicks build combos!
              </p>
            </div>
            <Link
              href="/mini-games"
              className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
            >
              Back to Arcade
            </Link>
          </div>

          {/* Difficulty Selection */}
          <div className="flex flex-wrap gap-3">
            {(['easy', 'medium', 'hard', 'expert'] as GameMode[]).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => handleModeChange(difficulty)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === difficulty
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50'
                    : 'bg-black/30 border border-white/20 text-zinc-300 hover:bg-black/50 hover:border-white/40'
                }`}
              >
                {difficulty === 'easy' && '🟢 Easy (4×3)'}
                {difficulty === 'medium' && '🟡 Medium (6×5)'}
                {difficulty === 'hard' && '🟠 Hard (8×6)'}
                {difficulty === 'expert' && '🔴 Expert (10×8)'}
              </button>
            ))}
          </div>
        </header>

        {/* Avatar vs Preset Choice */}
        {showAvatarChoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <AvatarPresetChoice
              gameId="puzzle-reveal"
              onChoice={handleAvatarChoice}
              onCancel={() => setShowAvatarChoice(false)}
            />
          </div>
        )}

        {/* Avatar Display (Portrait Mode) */}
        {!showAvatarChoice && isAvatarsEnabled() && avatarConfig && !avatarLoading && (
          <div className="flex justify-center mb-6">
            <AvatarRenderer
              profile={avatarConfig}
              mode={representationConfig.mode}
              size="small"
            />
          </div>
        )}

        {/* Game Canvas */}
        <GlassCard className="overflow-hidden p-4 relative">
          {/* HUD - uses loader for cosmetics */}
          {gameState === 'playing' && (
            <>
              {isQuakeHud ? (
                <HudComponent
                  {...hudProps}
                  petals={petalBalance}
                  gameId="puzzle-reveal"
                />
              ) : (
                <HudComponent
                  {...hudProps}
                  score={score}
                  combo={combo}
                />
              )}
            </>
          )}
          <EnhancedTileGame key={key} mode={mode} onScoreChange={setScore} onComboChange={setCombo} onGameEnd={handleGameEnd} />
        </GlassCard>

        {/* Game Overlay */}
        {!showAvatarChoice && (
          <GameOverlay
            state={gameState}
            instructions={[
              'Click tiles to reveal the hidden artwork',
              'Click tiles quickly (within 0.5s) to build combos',
              'Max combo is 10x for massive score boosts',
              'Watch your energy - each click consumes energy',
              'Reveal all tiles to complete the puzzle',
            ]}
            winMessage="Puzzle Master! You revealed all tiles!"
            loseMessage="Out of energy! Try again and manage your clicks better!"
            score={finalScore || score}
            petalReward={petalReward}
            onRestart={handleRestart}
            onResume={handleStart}
          />
        )}

        {/* Game Instructions */}
        <GlassCard className="mt-6 p-6">
          <h3 className="font-semibold text-white text-lg mb-4">
            How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-pink-300 mb-3 text-lg">Objective</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Click tiles to reveal the hidden artwork beneath</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Reveal all tiles to complete the puzzle</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Higher difficulties have more tiles and better rewards</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-300 mb-3 text-lg">Combo System</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>
                    Click tiles quickly (within 0.5s) to build a <strong>combo multiplier</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Each combo level adds +50 bonus points per tile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Max combo: 10x for massive score boosts!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Combo resets if you wait too long between clicks</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-300 mb-3 text-lg">Scoring</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Base score: 100 points per tile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Combo bonus: Up to +500 points per tile (10x combo)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Speed bonus: Complete faster for extra points</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-300 mb-3 text-lg">Rewards</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Earn petals based on your final score</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Higher difficulties mean more petals per point</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5" aria-hidden="true">
                    *
                  </span>
                  <span>Finish quickly with high combos to maximize rewards</span>
                </li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
      </main>
    </MiniGameFrame>
  );
}
