/**
 * Enterprise Game Shell V2 - Simplified
 *
 * Production-ready game container with core features
 */

'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useAuth } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

// V2 Systems
import GameCubeBootV2 from './GameCubeBootV2';
import { useGameSaveV2, type GameSaveDataV2 } from './SaveSystemV2';
import LeaderboardSystemV2, { type AchievementProgress } from './LeaderboardSystemV2';
import { useGameTelemetry } from './GameTelemetryV2';

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
  const { isSignedIn, userId } = useAuth();

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

  // V2 Systems
  const saveSystem = useGameSaveV2(gameKey);
  const telemetry = useGameTelemetry(gameKey);

  // Boot animation completion
  const handleBootComplete = useCallback(() => {
    setShowBootAnimation(false);
    setGameState((prev) => ({ ...prev, isLoading: false }));

    if (enableTelemetry) {
      telemetry.startSession(userId || undefined);
    }
  }, [userId, enableTelemetry, telemetry]);

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
                    ⏸️
                  </button>
                )}

                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  aria-label="Back to games"
                >
                  ← Back
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
                  <p>Press SPACE to pause • ESC for menu • Ctrl+R to restart</p>
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
          <div className="fixed bottom-4 left-4 z-50 space-y-2">
            <AnimatePresence>
              {achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -100, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, scale: 0.8 }}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 shadow-2xl max-w-sm"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">🏆</div>
                    <div>
                      <h4 className="font-bold text-white">Achievement Unlocked!</h4>
                      <p className="text-white/90 text-sm">{achievement.name}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
}
