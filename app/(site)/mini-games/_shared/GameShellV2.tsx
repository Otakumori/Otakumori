/**
 * Enterprise Game Shell V2 - Simplified
 *
 * Production-ready game container with core features
 */

'use client';

import { logger } from '@/app/lib/logger';
import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

// V2 Systems
import GameCubeBootV2 from './GameCubeBootV2';
import { useGameSaveV2, type GameSaveDataV2 } from './SaveSystemV2';
import LeaderboardSystemV2, { type AchievementProgress } from './LeaderboardSystemV2';
import { useGameTelemetry } from './GameTelemetryV2';
import { achievementBus, type AchievementEvent } from '@/lib/events/achievement-bus';

// Shared components
import PauseOverlay from './PauseOverlay';

interface GameShellV2Props {
  gameKey: string;
  title: string;
  children: React.ReactNode;

  // Game configuration
  enableBootAnimation?: boolean;
  enableLeaderboards?: boolean;
  enableAchievements?: boolean;
  enableTelemetry?: boolean;

  // Callbacks
  onGameStart?: () => void;
  onGameEnd?: (score: number, level: number) => void;
  onError?: (error: Error) => void;

  // Custom settings
  className?: string;
  maxPlayers?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface GameState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isComplete: boolean;
  hasError: boolean;
  currentScore: number;
  currentLevel: number;
  startTime: number | null;
  playTime: number;
  }

export default function GameShellV2({
  gameKey,
  title,
  children,
  enableBootAnimation = true,
  enableLeaderboards = true,
  enableAchievements = true,
  enableTelemetry = true,
  onGameStart,
  onGameEnd,
  onError,
  className = '',
  maxPlayers = 1,
  difficulty = 'medium',
}: GameShellV2Props) {
  const { isSignedIn: _isSignedIn, userId } = useAuth();

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    isLoading: true,
    isPlaying: false,
    isPaused: false,
    isComplete: false,
    hasError: false,
    currentScore: 0,
    currentLevel: 1,
    startTime: null,
    playTime: 0,
  });

  const [showBootAnimation, setShowBootAnimation] = useState(enableBootAnimation);
  const [achievements, setAchievements] = useState<AchievementProgress[]>([]);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [latestAchievement, setLatestAchievement] = useState<AchievementEvent | null>(null);
  const [playerSlots, setPlayerSlots] = useState<number[]>(
    Array.from({ length: maxPlayers }, (_, i) => i + 1),
  );

  useEffect(() => {
    setPlayerSlots(Array.from({ length: maxPlayers }, (_, i) => i + 1));
  }, [maxPlayers]);

  // V2 Systems
  const saveSystem = useGameSaveV2(gameKey);
  const telemetry = useGameTelemetry(gameKey);

  // Achievement event bus listener
  useEffect(() => {
    if (!enableAchievements) return;

    const unsubscribe = achievementBus.on((achievement) => {
      // Only show achievements for this game
      if (achievement.gameId === gameKey || !achievement.gameId) {
        setLatestAchievement(achievement);

        // Auto-hide after 5 seconds
        setTimeout(() => {
          setLatestAchievement(null);
        }, 5000);
      }
    });

    return () => unsubscribe();
  }, [enableAchievements, gameKey]);

  // Log game configuration (development only)
  // GameShell initialization tracking removed - use React DevTools for component inspection

  // Error handler
  const handleError = useCallback(
    (error: Error) => {
      logger.error(`[GameShell:${gameKey}] Error:`, undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      setGameState((prev) => ({ ...prev, hasError: true, isPlaying: false }));

      if (onError) {
        onError(error);
      }

      if (enableTelemetry) {
        telemetry.trackError(error, 'GameShell');
      }
    },
    [gameKey, onError, enableTelemetry, telemetry],
  );

  // Boot animation completion
  const handleBootComplete = useCallback(() => {
    try {
      setShowBootAnimation(false);
      setGameState((prev) => ({ ...prev, isLoading: false }));

      if (enableTelemetry) {
        telemetry.startSession(userId || undefined);
      }
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
    }
  }, [userId, enableTelemetry, telemetry, handleError]);

  // Game lifecycle methods
  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      startTime: Date.now(),
      currentScore: 0,
      currentLevel: 1,
    }));

    if (enableTelemetry) {
      telemetry.trackGameStart(difficulty);
    }

    onGameStart?.();
  }, [difficulty, enableTelemetry, telemetry, onGameStart]);

  const pauseGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: true }));
    setShowPauseMenu(true);

    if (enableTelemetry) {
      telemetry.trackAction('pause');
    }
  }, [enableTelemetry, telemetry]);

  const resumeGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, isPaused: false }));
    setShowPauseMenu(false);

    if (enableTelemetry) {
      telemetry.trackAction('resume');
    }
  }, [enableTelemetry, telemetry]);

  const endGame = useCallback(
    (score: number, level: number, result: 'victory' | 'defeat' | 'quit' = 'victory') => {
      const playTime = gameState.startTime ? Date.now() - gameState.startTime : 0;

      setGameState((prev) => ({
        ...prev,
        isPlaying: false,
        isComplete: true,
        currentScore: score,
        currentLevel: level,
        playTime,
      }));

      // Save game data
      const saveData: Partial<GameSaveDataV2> = {
        score,
        level,
        progress: (level / 10) * 100,
        stats: {
          playTime,
          difficulty,
          result,
          timestamp: Date.now(),
        },
      };

      saveSystem.save(saveData);

      if (enableTelemetry) {
        telemetry.trackGameEnd(score, level, result);
      }

      onGameEnd?.(score, level);
    },
    [gameState.startTime, difficulty, saveSystem, enableTelemetry, telemetry, onGameEnd],
  );

  const restartGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      isComplete: false,
      hasError: false,
      currentScore: 0,
      currentLevel: 1,
      startTime: null,
      playTime: 0,
    }));

    if (enableTelemetry) {
      telemetry.trackAction('restart');
    }

    setTimeout(startGame, 100);
  }, [startGame, enableTelemetry, telemetry]);

  // Achievement handler
  const handleAchievementUnlock = useCallback(
    (achievement: AchievementProgress) => {
      setAchievements((prev) => {
        const existing = prev.find((a) => a.id === achievement.id);
        if (existing) return prev;
        return [...prev, achievement];
      });

      if (enableTelemetry) {
        telemetry.trackAction('achievement_unlock', achievement.id, true);
      }
    },
    [enableTelemetry, telemetry],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enableTelemetry) {
        telemetry.endSession(gameState.isComplete ? 'completed' : 'quit');
      }
      saveSystem.cleanup();
    };
  }, [enableTelemetry, telemetry, gameState.isComplete, saveSystem]);

  return (
    <div
      className={`relative min-h-screen bg-gradient-to-b from-purple-900 to-black overflow-hidden ${className}`}
    >
      {/* Boot Animation */}
      <AnimatePresence>
        {showBootAnimation && (
          <GameCubeBootV2 onBootComplete={handleBootComplete} onSkip={handleBootComplete} />
        )}
      </AnimatePresence>

      {/* Main Game Container */}
      {!showBootAnimation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative w-full h-full"
        >
          {/* Game Header */}
          <div className="absolute top-0 left-0 right-0 z-40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white">{title}</h1>

                {gameState.isPlaying && (
                  <div className="flex items-center space-x-4 text-white/80">
                    <span>Score: {gameState.currentScore.toLocaleString()}</span>
                    <span>Level: {gameState.currentLevel}</span>
                    {enableAchievements && <span>Achievements: {achievements.length}</span>}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {gameState.isPlaying && (
                  <button
                    onClick={pauseGame}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    aria-label="Pause game"
                  >
                    <span aria-hidden="true">Pause</span>
                  </button>
                )}

                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  aria-label="Back to games"
                >
                  Back
                </button>
              </div>
            </div>
          </div>

          {/* Game Content */}
          <div className="relative w-full h-full pt-16">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-screen">
                  <div className="animate-spin w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full" />
                </div>
              }
            >
              {React.cloneElement(children as React.ReactElement, {
                ...(children as any).props,
                onScoreUpdate: (score: number) =>
                  setGameState((prev) => ({ ...prev, currentScore: score })),
                onLevelUpdate: (level: number) =>
                  setGameState((prev) => ({ ...prev, currentLevel: level })),
                onGameStart: startGame,
                onGameEnd: endGame,
                isPaused: gameState.isPaused,
                telemetry: enableTelemetry ? telemetry : undefined,
              })}
            </Suspense>
          </div>

          {/* Pause Overlay */}
          <AnimatePresence>
            {showPauseMenu && (
              <PauseOverlay
                gameKey={gameKey}
                onResume={resumeGame}
                onQuit={() => window.history.back()}
              />
            )}
          </AnimatePresence>

          {/* Leaderboard Sidebar */}
          {enableLeaderboards && !gameState.isPaused && !showPauseMenu && (
            <div className="absolute top-20 right-4 w-80 max-h-[calc(100vh-120px)] overflow-y-auto">
              <LeaderboardSystemV2
                gameId={gameKey}
                currentScore={gameState.currentScore}
                onAchievementUnlock={handleAchievementUnlock}
                className="backdrop-blur-lg"
              />
            </div>
          )}

          {/* Game Start Screen */}
          {!gameState.isPlaying && !gameState.isComplete && !gameState.isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-4">{title}</h2>
                <p className="text-xl mb-8 text-white/80">Ready to play?</p>

                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl text-xl font-bold transition-all transform hover:scale-105"
                >
                  Start Game
                </button>

                <div className="mt-8 text-sm text-white/60">
                  <p>Press SPACE to pause - ESC for menu - Ctrl+R to restart</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Game Complete Screen */}
          {gameState.isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-4">Game Complete!</h2>
                <div className="text-2xl mb-8">
                  <p>
                    Final Score:{' '}
                    <span className="text-pink-400">{gameState.currentScore.toLocaleString()}</span>
                  </p>
                  <p>
                    Level Reached: <span className="text-purple-400">{gameState.currentLevel}</span>
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={restartGame}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-xl font-bold transition-all"
                  >
                    Play Again
                  </button>

                  <button
                    onClick={() => window.history.back()}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-bold transition-all"
                  >
                    Back to Games
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Achievement Notifications */}
          {enableAchievements && latestAchievement && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 right-4 z-50"
            >
              <div
                className={`bg-gradient-to-r rounded-xl p-4 shadow-2xl max-w-sm ${
                  latestAchievement.rarity === 'legendary'
                    ? 'from-purple-500 to-pink-500'
                    : latestAchievement.rarity === 'epic'
                      ? 'from-blue-500 to-purple-500'
                      : latestAchievement.rarity === 'rare'
                        ? 'from-green-500 to-blue-500'
                        : latestAchievement.rarity === 'uncommon'
                          ? 'from-gray-500 to-green-500'
                          : 'from-yellow-500 to-orange-500'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-semibold text-white/80" aria-hidden="true">
                    ACH
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Achievement Unlocked!</h4>
                    <p className="text-white font-medium">{latestAchievement.title}</p>
                    {latestAchievement.description && (
                      <p className="text-white/80 text-sm">{latestAchievement.description}</p>
                    )}
                    <p className="text-white/60 text-xs uppercase mt-1">
                      {latestAchievement.rarity}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Multiplayer Player Slots */}
          {maxPlayers > 1 && (
            <div className="absolute top-4 left-4 z-40 flex gap-2">
              {playerSlots.map((slot) => (
                <div
                  key={slot}
                  className={`px-4 py-2 rounded-lg border ${
                    slot === 1
                      ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                      : 'bg-gray-500/20 border-gray-500/40 text-gray-400'
                  }`}
                >
                  <div className="text-xs font-medium">Player {slot}</div>
                  <div className="text-lg font-bold">{`P${slot}`}</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
