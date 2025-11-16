/**
 * Bubble Girl - Physics-Based Interactive Character Game
 *
 * Core Fantasy: Spawn bubbles, float and score. Sandbox or challenge mode.
 *
 * Game Flow: instructions → playing → results
 * Win Condition: Complete challenge objectives (challenge mode) or reach target score
 * Lose Condition: Health reaches 0 (challenge mode)
 *
 * Progression: Sandbox (free play), Stress Relief (relaxing), Challenge (objectives)
 * Scoring: Points for interactions, combos, stress relief
 * Petals: Awarded based on final score and mode completion
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

const InteractiveBuddyGame = dynamic(() => import('./InteractiveBuddyGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pink-200">Loading Interactive Buddy...</p>
      </div>
    </div>
  ),
});

type GameMode = 'sandbox' | 'stress-relief' | 'challenge';

export default function InteractiveBuddyPage() {
  const [mode, setMode] = useState<GameMode>('sandbox');
  const [key, setKey] = useState(0); // Force remount on mode change
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'win' | 'lose' | 'paused'>('instructions');
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [petalReward, setPetalReward] = useState<number | null>(null);
  const [hasAwardedPetals, setHasAwardedPetals] = useState(false);
  const [characterVariant, setCharacterVariant] = useState<'girl' | 'boy'>('girl');
  const [hasUnlockedBubbleBoyAchievement, setHasUnlockedBubbleBoyAchievement] = useState(false);
  
  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [showAvatarChoice, setShowAvatarChoice] = useState(false);
  
  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('bubble-girl');
  const { avatarConfig, representationConfig, isLoading: avatarLoading } = useGameAvatar('bubble-girl', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile: avatarChoice === 'creator' ? selectedAvatar : null,
  });

  // Visual profile and HUD
  const visualProfile = getGameVisualProfile('bubble-girl');
  const { backgroundStyle } = applyVisualProfile(visualProfile);
  const { Component: HudComponent, isQuakeHud, props: hudProps } = useGameHud('bubble-girl');
  const { balance: petalBalance } = usePetalBalance();
  const { earnPetals } = usePetalEarn();

  // Game configuration - reserved for future game logic tuning
  // const GAME_CONFIG = {
  //   SANDBOX_SCORE_MULTIPLIER: 1,
  //   STRESS_RELIEF_SCORE_MULTIPLIER: 1.5,
  //   CHALLENGE_SCORE_MULTIPLIER: 2,
  //   TARGET_SCORE: {
  //     sandbox: 0, // No target in sandbox
  //     'stress-relief': 500,
  //     challenge: 1000,
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
        gameId: 'bubble-girl',
        score: finalScoreValue,
        metadata: {
          mode,
          didWin,
        },
      });

      if (result.success) {
        setPetalReward(result.earned);
      }
    }

    // Submit to leaderboard
    try {
      await fetch('/api/v1/leaderboards/bubble-girl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: finalScoreValue,
          metadata: {
            mode,
            didWin,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }, [mode, earnPetals, hasAwardedPetals]);

  const displayName = getGameDisplayName('bubble-girl');

  return (
    <MiniGameFrame gameId="bubble-girl">
      <main className="min-h-screen p-4 page-transition" style={backgroundStyle}>
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {displayName}
              </h1>
              <p className="text-zinc-300 font-medium">
                Physics-based character interaction. Click, drag, and use tools for satisfying
                ragdoll mayhem!
              </p>
            </div>
            <Link
              href="/mini-games"
              className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
            >
              Back to Arcade
            </Link>
          </div>

          {/* Avatar Display (Chibi Mode) - MAIN CHARACTER CENTER STAGE */}
          {!showAvatarChoice && isAvatarsEnabled() && avatarConfig && !avatarLoading && (
            <div className="flex justify-center mb-8">
              <div className="relative w-80 h-80">
                <AvatarRenderer
                  profile={avatarConfig}
                  mode={representationConfig.mode}
                  size="large"
                />
              </div>
            </div>
          )}

          {/* Mode Selection */}
          <div className="flex flex-wrap gap-3 mb-4">
            {(['sandbox', 'stress-relief', 'challenge'] as GameMode[]).map((gameMode) => (
              <button
                key={gameMode}
                onClick={() => handleModeChange(gameMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  mode === gameMode
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50'
                    : 'bg-black/30 border border-white/20 text-zinc-300 hover:bg-black/50 hover:border-white/40'
                }`}
              >
                {gameMode === 'sandbox' && 'Sandbox (Unlimited Money)'}
                {gameMode === 'stress-relief' && 'Stress Relief (Destructive Tools)'}
                {gameMode === 'challenge' && 'Challenge (Earn Money)'}
              </button>
            ))}
          </div>

          {/* Character Variant Toggle */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-zinc-300 text-sm">Character:</span>
            <button
              onClick={() => {
                const newVariant = characterVariant === 'girl' ? 'boy' : 'girl';
                setCharacterVariant(newVariant);
                
                // Unlock achievement when switching to Bubble Boy for the first time
                if (newVariant === 'boy' && !hasUnlockedBubbleBoyAchievement) {
                  setHasUnlockedBubbleBoyAchievement(true);
                  // Call achievement unlock API
                  fetch('/api/v1/achievements/unlock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      achievementCode: 'bubble....boy????',
                      idempotencyKey: `bubble-boy-${Date.now()}-${Math.random()}`,
                    }),
                  }).catch((error) => {
                    console.error('Failed to unlock Bubble Boy achievement:', error);
                  });
                }
              }}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                characterVariant === 'girl'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
              }`}
            >
              {characterVariant === 'girl' ? 'Bubble Girl' : 'Bubble Boy'}
            </button>
          </div>
        </header>

        {/* Game Canvas */}
        <GlassCard className="overflow-hidden p-4 relative">
          {/* HUD - uses loader for cosmetics */}
          {gameState === 'playing' && (
            <>
              {isQuakeHud ? (
                <HudComponent
                  {...hudProps}
                  petals={petalBalance}
                  gameId="bubble-girl"
                />
              ) : (
                <HudComponent
                  {...hudProps}
                  score={score}
                  combo={0}
                />
              )}
            </>
          )}
          <InteractiveBuddyGame key={key} mode={mode} onScoreChange={setScore} onGameEnd={handleGameEnd} characterVariant={characterVariant} />
        </GlassCard>

        {/* Avatar vs Preset Choice */}
        {showAvatarChoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <AvatarPresetChoice
              gameId="bubble-girl"
              onChoice={handleAvatarChoice}
              onCancel={() => setShowAvatarChoice(false)}
            />
          </div>
        )}

        {/* Game Overlay */}
        {!showAvatarChoice && (
          <GameOverlay
            state={gameState}
            instructions={[
              'Click to use selected tool on character',
              'Click + drag to grab and throw character parts',
              'Select tools from the panel on the right',
              'Build combos with rapid successive hits',
              'Earn money to unlock better tools (Challenge mode)',
            ]}
            winMessage="Great job! You've mastered the Interactive Buddy!"
            loseMessage="Try again! Keep practicing to improve your score!"
            score={finalScore || score}
            petalReward={petalReward}
            onRestart={handleRestart}
            onResume={handleStart}
          />
        )}

        {/* Game Instructions */}
        <GlassCard className="mt-6 p-6">
          <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">ℹ</span> How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-pink-300 mb-3 text-lg">Controls</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>
                    <strong>Click:</strong> Use selected tool on character
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>
                    <strong>Click + Drag:</strong> Grab and throw character parts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>
                    <strong>Tool Selection:</strong> Click tools in the panel to equip
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>
                    <strong>Reset:</strong> Click reset button to restore character
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-purple-300 mb-3 text-lg">Tool Types</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>
                    <strong className="text-red-400">Destructive:</strong> Deal damage with
                    satisfying physics (slap, punch, bat, bomb, laser)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>
                    <strong className="text-green-400">Healing:</strong> Restore health with gentle
                    interactions (compliment, head pat)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong className="text-blue-400">Fun:</strong> Interactive effects and physics
                    modifiers (poke, tickle, gravity, wind)
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-blue-300 mb-3 text-lg">Game Modes</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong>Sandbox:</strong> Unlimited money, all tools available, pure
                    experimentation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong>Stress Relief:</strong> Focus on destructive tools for satisfying stress
                    release
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong>Challenge:</strong> Earn money by interacting, buy better tools,
                    maximize score
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-yellow-300 mb-3 text-lg">Scoring System</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Score increases based on tool damage and effects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Build combos with rapid successive hits (up to 5x multiplier)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Earn money to unlock more powerful tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Realistic ragdoll physics with satisfying particle effects</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <h4 className="font-medium text-purple-300 mb-2 text-lg">Pro Tips</h4>
            <ul className="text-sm text-zinc-300 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span>Drag the character high and drop for maximum physics impact</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span>Combine tools in quick succession to build your combo multiplier</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span>
                  Use healing tools strategically in Challenge mode to keep the character alive
                  longer
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span>
                  Experiment with gravity and wind tools for creative physics interactions
                </span>
              </li>
            </ul>
          </div>
        </GlassCard>
      </div>
      </main>
    </MiniGameFrame>
  );
}
