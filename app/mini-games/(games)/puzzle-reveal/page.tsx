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
import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GlassCard from '@/app/components/ui/GlassCard';
import { useGameAvatar } from '../../_shared/useGameAvatarWithConfig';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import {
  PhysicsAvatarCanvas,
  type PhysicsAvatarCanvasRef,
} from '../../_shared/PhysicsAvatarCanvas';
import { GameOverlay } from '../../_shared/GameOverlay';
import { useGameHud } from '../../_shared/useGameHud';
import {
  GamePlatformControls,
  GamePlatformPause,
  GameSessionAnnouncement,
} from '../../_shared/GamePlatform';
import { useGameSession, type GameSessionResult } from '../../_shared/GameSession';
import { useGameProgress } from '@/app/lib/games/progress';
import {
  getGameVisualProfile,
  applyVisualProfile,
  getGameDisplayName,
} from '../../_shared/gameVisuals';
import { MiniGameFrame } from '../../_shared/MiniGameFrame';
import { usePetalBalance } from '@/app/hooks/usePetalBalance';
import { AvatarPresetChoice, type AvatarChoice } from '../../_shared/AvatarPresetChoice';
import { getGameAvatarUsage } from '../../_shared/miniGameConfigs';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';
import type { PersonalBestResult } from '@/app/lib/games/progress';
import { nextPuzzleContentIndex } from '../../_shared/secondaryGameContracts';
import { PUZZLE_REVEAL_CONTENT } from './puzzleRevealContent';

const EnhancedTileGame = dynamic(() => import('./EnhancedTileGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-amber-700/70 border-t-transparent motion-reduce:animate-none" />
        <p className="text-amber-100">Preparing recovered memory...</p>
      </div>
    </div>
  ),
});

type GameMode = 'easy' | 'medium' | 'hard' | 'expert';

const DIFFICULTY_LABELS: Record<GameMode, string> = {
  easy: 'Easy (4×3)',
  medium: 'Medium (6×5)',
  hard: 'Hard (8×6)',
  expert: 'Expert (10×8)',
};

export default function PuzzleRevealPage() {
  const router = useRouter();
  const [mode, setMode] = useState<GameMode>('medium');
  const [key, setKey] = useState(0); // Force remount on mode change
  const [gameState, setGameState] = useState<
    'instructions' | 'playing' | 'win' | 'lose' | 'paused'
  >('instructions');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [petalReward, setPetalReward] = useState<number | null>(null);
  const [personalBest, setPersonalBest] = useState<PersonalBestResult | null>(null);
  const [contentIndex, setContentIndex] = useState(0);
  const resultSubmittedRef = useRef(false);
  const gameStartedAtRef = useRef(Date.now());
  const session = useGameSession<GameSessionResult>({
    initialPhase: 'idle',
    onExit: () => router.push('/mini-games'),
  });

  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [showAvatarChoice, setShowAvatarChoice] = useState(false);
  const physicsAvatarRef = useRef<PhysicsAvatarCanvasRef>(null);

  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('puzzle-reveal');
  const {
    avatarConfig,
    representationConfig,
    isLoading: avatarLoading,
  } = useGameAvatar('puzzle-reveal', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile: avatarChoice === 'creator' ? selectedAvatar : null,
  });

  // Visual profile and HUD
  const visualProfile = getGameVisualProfile('puzzle-reveal');
  const { backgroundStyle } = applyVisualProfile(visualProfile);
  const { Component: HudComponent, isQuakeHud, props: hudProps } = useGameHud('puzzle-reveal');
  const { balance: petalBalance } = usePetalBalance();
  const { beginResultSession, recordResult } = useGameProgress();

  useEffect(() => {
    const unregister = session.registerLifecycle({
      pause: () => setGameState('paused'),
      resume: () => setGameState('playing'),
    });
    return () => {
      unregister();
    };
  }, [session.registerLifecycle]);

  useEffect(() => {
    if (gameState === 'playing' && session.phase === 'idle') session.start();
  }, [gameState, session.phase, session.start]);

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
  const handleAvatarChoice = useCallback((choice: AvatarChoice, avatar?: AvatarProfile | any) => {
    setAvatarChoice(choice);
    if (choice === 'creator' && avatar) {
      setSelectedAvatar(avatar);
    }
    setShowAvatarChoice(false);
    setGameState('instructions');
  }, []);

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    setContentIndex(
      (current) => nextPuzzleContentIndex(current, key + 1, PUZZLE_REVEAL_CONTENT.length) ?? 0,
    );
    setKey((prev) => prev + 1); // Restart game with new mode
  };

  const handleStart = () => {
    // Check if avatar choice is needed
    if (avatarUsage === 'avatar-or-preset' && avatarChoice === null && isAvatarsEnabled()) {
      setShowAvatarChoice(true);
      return;
    }
    beginResultSession('puzzle-reveal');
    gameStartedAtRef.current = Date.now();
    resultSubmittedRef.current = false;
    setGameState('playing');
    setPetalReward(null);
    setPersonalBest(null);
  };

  const handleRestart = () => {
    setKey((prev) => prev + 1);
    session.restart();
    beginResultSession('puzzle-reveal');
    gameStartedAtRef.current = Date.now();
    resultSubmittedRef.current = false;
    setGameState('playing');
    setPetalReward(null);
    setPersonalBest(null);
    setContentIndex(
      (current) => nextPuzzleContentIndex(current, key + 1, PUZZLE_REVEAL_CONTENT.length) ?? 0,
    );
  };

  const handleGameEnd = useCallback(
    async (finalScoreValue: number, didWin: boolean) => {
      setFinalScore(finalScoreValue);
      setGameState(didWin ? 'win' : 'lose');
      session.complete({
        outcome: didWin ? 'completed' : 'failed',
        score: finalScoreValue,
        stats: [
          { label: 'Difficulty', value: mode },
          { label: 'Best combo', value: combo },
        ],
      });

      if (!resultSubmittedRef.current) {
        resultSubmittedRef.current = true;
        const result = await recordResult({
          gameId: 'puzzle-reveal',
          resultKey: mode,
          score: finalScoreValue,
          difficulty: mode,
          durationMs: Math.max(0, Date.now() - gameStartedAtRef.current),
          didWin,
          metadata: {
            mode,
            didWin,
            combo,
          },
        });

        if (result.success) setPetalReward(result.petalReward?.earned ?? null);
        setPersonalBest(result.personalBest ?? null);
      }
    },
    [combo, mode, recordResult, session.complete],
  );

  const displayName = getGameDisplayName('puzzle-reveal');

  return (
    <MiniGameFrame gameId="puzzle-reveal">
      <main className="min-h-screen p-4 page-transition" style={backgroundStyle}>
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="mb-2 bg-gradient-to-r from-amber-200 via-rose-200 to-amber-500 bg-clip-text font-serif text-4xl font-bold text-transparent">
                  {displayName}
                </h1>
                <p className="text-zinc-300 font-medium">
                  Click tiles to reveal breathtaking artwork. Fast clicks build combos!
                </p>
              </div>
              <Link
                href="/mini-games"
                className="rounded-lg border border-amber-700/40 bg-stone-950/75 px-4 py-2 text-amber-100 backdrop-blur transition-colors hover:border-amber-500/60 hover:bg-stone-900"
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
                      ? 'border border-amber-500/70 bg-gradient-to-r from-stone-900 to-amber-950 text-amber-100 shadow-lg shadow-black/40'
                      : 'border border-stone-600/70 bg-stone-950/55 text-zinc-300 hover:border-amber-700/60 hover:bg-stone-900/75'
                  }`}
                >
                  {DIFFICULTY_LABELS[difficulty]}
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

          {/* Avatar Display (Portrait Mode) - MAIN CHARACTER CENTER STAGE */}
          {!showAvatarChoice && isAvatarsEnabled() && avatarConfig && !avatarLoading && (
            <div className="flex justify-center mb-8">
              <div className="relative w-64 h-64">
                <AvatarRenderer
                  profile={avatarConfig}
                  mode={representationConfig.mode}
                  size="large"
                />
                {/* Physics Avatar Overlay */}
                {gameState === 'playing' && (
                  <div className="absolute top-0 right-0 w-32 h-40">
                    <PhysicsAvatarCanvas
                      ref={physicsAvatarRef}
                      characterType="player"
                      quality="high"
                      width={128}
                      height={160}
                      className="rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Physics Avatar Standalone (when no avatar config) */}
          {!showAvatarChoice &&
            (!isAvatarsEnabled() || !avatarConfig) &&
            gameState === 'playing' && (
              <div className="flex justify-center mb-8">
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <PhysicsAvatarCanvas
                    ref={physicsAvatarRef}
                    characterType="player"
                    quality="high"
                    width={160}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
              </div>
            )}

          {/* Game Canvas */}
          <GlassCard className="overflow-hidden p-4 relative">
            {/* HUD - uses loader for cosmetics */}
            {gameState === 'playing' && (
              <>
                {isQuakeHud ? (
                  <HudComponent {...hudProps} petals={petalBalance} gameId="puzzle-reveal" />
                ) : (
                  <HudComponent {...hudProps} score={score} combo={combo} />
                )}
              </>
            )}
            <EnhancedTileGame
              key={key}
              mode={mode}
              contentIndex={contentIndex}
              onScoreChange={setScore}
              onComboChange={setCombo}
              onGameEnd={handleGameEnd}
              onReplay={handleRestart}
              onBack={session.exit}
              personalBest={personalBest}
              petalReward={petalReward}
              paused={session.phase === 'paused'}
              physicsAvatarRef={physicsAvatarRef}
            />
            {(session.phase === 'running' || session.phase === 'paused') && (
              <GamePlatformControls session={session} showPause={session.phase === 'running'} />
            )}
          </GlassCard>

          {/* Game Overlay */}
          {!showAvatarChoice && (
            <GameOverlay
              state={gameState === 'paused' || gameState === 'win' ? 'playing' : gameState}
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
              personalBest={personalBest}
              onRestart={handleRestart}
              onResume={handleStart}
              onBack={session.exit}
            />
          )}
          <GamePlatformPause session={session} title={displayName} />
          <GameSessionAnnouncement session={session} />

          {/* Game Instructions */}
          <GlassCard className="mt-6 p-6">
            <h3 className="font-semibold text-white text-lg mb-4">How to Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="mb-3 text-lg font-medium text-amber-200">Objective</h4>
                <ul className="text-sm text-zinc-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-rose-300" aria-hidden="true">
                      *
                    </span>
                    <span>Click tiles to reveal the hidden artwork beneath</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-rose-300" aria-hidden="true">
                      *
                    </span>
                    <span>Reveal all tiles to complete the puzzle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-rose-300" aria-hidden="true">
                      *
                    </span>
                    <span>Higher difficulties have more tiles and better rewards</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3 text-lg font-medium text-amber-200">Combo System</h4>
                <ul className="text-sm text-zinc-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-rose-300" aria-hidden="true">
                      *
                    </span>
                    <span>
                      Click tiles quickly (within 0.5s) to build a <strong>combo multiplier</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-rose-300" aria-hidden="true">
                      *
                    </span>
                    <span>Each combo level adds +50 bonus points per tile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-rose-300" aria-hidden="true">
                      *
                    </span>
                    <span>Max combo: 10x for massive score boosts!</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-rose-300" aria-hidden="true">
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
