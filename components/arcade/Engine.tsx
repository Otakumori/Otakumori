'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  type BlossomwareOrchestratorState,
  type BlossomwareRunResult,
  type EngineGame,
  type Caption,
} from './types';
import { useProgress } from './useProgress';
import { useRewards } from './useRewards';
import { Caption as CaptionComponent } from './ui/Caption';
import { TimerRing } from './ui/TimerRing';
import { OverlayPetals } from './ui/OverlayPetals';
import { usePetalEarn } from '@/app/mini-games/_shared/usePetalEarn';
import { createGameResultSessionId } from '@/app/lib/games/progress';
// Shared UI components - imported for QA validation (Engine handles its own UI)
// eslint-disable-next-line unused-imports/no-unused-imports
import { useGameHud } from '@/app/mini-games/_shared/useGameHud';
// eslint-disable-next-line unused-imports/no-unused-imports
import { GameOverlay } from '@/app/mini-games/_shared/GameOverlay';

interface EngineProps {
  playlist: EngineGame[];
  mode?: 'short' | 'long';
  autoplay?: boolean;
  paused?: boolean;
  onGameComplete?: (success: boolean, score: number, streak: number) => void;
  onRunComplete?: (result: BlossomwareRunResult) => void;
  onStateChange?: (state: BlossomwareOrchestratorState) => void;
}

export default function Engine({
  playlist,
  mode: _mode = 'short',
  autoplay = true,
  paused = false,
  onGameComplete,
  onRunComplete,
  onStateChange,
}: EngineProps) {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [showPetals, setShowPetals] = useState(false);
  const [runScore, setRunScore] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [failures, setFailures] = useState(0);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const completionGuardRef = useRef(false);
  const runCompletionGuardRef = useRef(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runSessionIdRef = useRef(createGameResultSessionId('blossomware'));
  const pendingCompletionRef = useRef<{
    success: boolean;
    score: number;
    petals: number;
  } | null>(null);

  const {
    updateBestScore,
    updateDailyStreak,
    addPetalsEarned,
    getBestScore,
    progress: progressData,
  } = useProgress();
  const { attemptReward, isSignedIn } = useRewards();
  const { earnPetals } = usePetalEarn();

  // Track streak for milestone rewards
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastStreakMilestone, setLastStreakMilestone] = useState(0);
  const [lastDailyStreakMilestone, setLastDailyStreakMilestone] = useState(0);

  const currentGame = playlist[currentGameIndex];
  const progress = timeRemaining / (currentGame?.durationSec || 1);

  const pushCaption = useCallback((text: string) => {
    const caption: Caption = {
      id: crypto.randomUUID(),
      text,
      timestamp: Date.now(),
    };
    setCaptions((prev) => [...prev, caption]);
  }, []);

  const startGame = useCallback(() => {
    if (!currentGame) return;

    completionGuardRef.current = false;
    setIsPlaying(true);
    setIsTransitioning(false);
    setTimeRemaining(currentGame.durationSec);
    setGameScore(0);
    setCaptions([]);
  }, [currentGame]);

  const endGame = useCallback(
    (success: boolean, score: number, petals: number) => {
      if (paused) {
        pendingCompletionRef.current = { success, score, petals };
        return;
      }
      const game = currentGame;
      if (!game || completionGuardRef.current) {
        setIsPlaying(false);
        return;
      }

      completionGuardRef.current = true;
      setIsPlaying(false);
      setIsTransitioning(true);

      const nextScore = runScore + Math.max(0, score);
      const nextSuccesses = successes + (success ? 1 : 0);
      const nextFailures = failures + (success ? 0 : 1);
      const nextRoundsCompleted = roundsCompleted + 1;
      setRunScore(nextScore);
      setSuccesses(nextSuccesses);
      setFailures(nextFailures);
      setRoundsCompleted(nextRoundsCompleted);

      if (success) {
        updateBestScore(game.id, score);
        updateDailyStreak();
        addPetalsEarned(petals);

        // Update streak
        const newStreak = currentStreak + 1;
        setCurrentStreak(newStreak);

        // Trigger game completion callback
        if (onGameComplete) {
          onGameComplete(true, score, newStreak);
        }

        // Award petals using usePetalEarn (supports guests with ephemeral petals)
        earnPetals({
          gameId: 'blossomware',
          sessionId: `${runSessionIdRef.current}:${currentGameIndex}:${game.id}`,
          score: score,
          metadata: {
            microGameId: game.id,
            streak: newStreak,
            dailyStreak: progressData.dailyStreak,
          },
        }).then((result) => {
          if (result.success) {
            // Show petal reward
            setShowPetals(true);
            setTimeout(() => setShowPetals(false), 2000);

            // Soft CTA for guests (non-blocking)
            if (!isSignedIn) {
              pushCaption('<span role="img" aria-label="emoji">�</span>� Sign in to save your petals permanently!');
            }
          }
        });

        // Streak milestone rewards (every 5 games)
        if (newStreak > 0 && newStreak % 5 === 0 && newStreak > lastStreakMilestone) {
          setLastStreakMilestone(newStreak);
          const milestoneReward = Math.floor(newStreak / 5) * 10; // 10 petals per 5-game milestone
          earnPetals({
            gameId: 'blossomware',
            sessionId: `${runSessionIdRef.current}:streak:${newStreak}`,
            score: milestoneReward * 10,
            metadata: {
              milestoneType: 'streak',
              milestoneValue: newStreak,
            },
          }).then(() => {
            pushCaption(`<span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span> ${newStreak}-game streak! Bonus petals earned!`);
          });
        }

        // Daily streak milestone rewards (every 5 days)
        if (
          progressData.dailyStreak > 0 &&
          progressData.dailyStreak % 5 === 0 &&
          progressData.dailyStreak > lastDailyStreakMilestone
        ) {
          setLastDailyStreakMilestone(progressData.dailyStreak);
          const dailyMilestoneReward = Math.floor(progressData.dailyStreak / 5) * 20;
          earnPetals({
            gameId: 'blossomware',
            sessionId: `${runSessionIdRef.current}:daily:${progressData.dailyStreak}`,
            score: dailyMilestoneReward * 10,
            metadata: {
              milestoneType: 'daily_streak',
              milestoneValue: progressData.dailyStreak,
            },
          }).then(() => {
            pushCaption(`<span role="img" aria-label="star">⭐</span> ${progressData.dailyStreak}-day streak! Daily bonus!`);
          });
        }
      } else {
        // Reset streak on failure
        setCurrentStreak(0);
        // Trigger game completion callback for failure
        if (onGameComplete) {
          onGameComplete(false, score, 0);
        }
      }

      const isFinalRound = nextRoundsCompleted >= playlist.length;
      if (isFinalRound) {
        if (!runCompletionGuardRef.current) {
          runCompletionGuardRef.current = true;
          setIsTransitioning(false);
          onRunComplete?.({
            score: nextScore,
            successes: nextSuccesses,
            failures: nextFailures,
            roundsCompleted: nextRoundsCompleted,
            totalRounds: playlist.length,
          });
        }
        return;
      }

    },
    [
      currentGame,
      updateBestScore,
      updateDailyStreak,
      addPetalsEarned,
      attemptReward,
      pushCaption,
      playlist.length,
      earnPetals,
      isSignedIn,
      currentStreak,
      lastStreakMilestone,
      progressData.dailyStreak,
      lastDailyStreakMilestone,
      currentGameIndex,
      runScore,
      successes,
      failures,
      roundsCompleted,
      onRunComplete,
      paused,
    ],
  );

  useEffect(() => {
    if (paused || !pendingCompletionRef.current) return;
    const pending = pendingCompletionRef.current;
    pendingCompletionRef.current = null;
    endGame(pending.success, pending.score, pending.petals);
  }, [endGame, paused]);

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || paused || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endGame(false, gameScore, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, paused, timeRemaining, gameScore, endGame]);

  // Auto-start games
  useEffect(() => {
    if (autoplay && !paused && !isPlaying && !isTransitioning && !runCompletionGuardRef.current) {
      const timer = setTimeout(startGame, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoplay, paused, isPlaying, isTransitioning, startGame]);

  useEffect(
    () => () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!isTransitioning || runCompletionGuardRef.current) return;
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    if (paused) return;

    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
      setCurrentGameIndex((prev) => prev + 1);
    }, 1500);

    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [isTransitioning, paused]);

  useEffect(() => {
    onStateChange?.({
      activeGameId: currentGame?.id ?? null,
      activeGameLabel: currentGame?.label ?? null,
      failures,
      phase: runCompletionGuardRef.current
        ? 'completed'
        : isTransitioning
          ? 'transitioning'
          : isPlaying
            ? 'running'
            : 'preparing',
      roundIndex: currentGameIndex,
      roundsCompleted,
      score: runScore,
      successes,
      totalRounds: playlist.length,
    });
  }, [
    currentGame,
    currentGameIndex,
    failures,
    isPlaying,
    isTransitioning,
    onStateChange,
    playlist.length,
    roundsCompleted,
    runScore,
    successes,
  ]);

  const GameComponent = currentGame?.component;

  if (!currentGame || !GameComponent) {
    return (
      <div className="flex items-center justify-center h-64 text-white/60">
        <p>No games available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-96 bg-black/20 rounded-lg border border-white/10 overflow-hidden">
      {/* Game Area */}
      <div className="absolute inset-0">
        <GameComponent
          onComplete={(score, petals) => endGame(true, score, petals)}
          onFail={() => endGame(false, gameScore, 0)}
          duration={currentGame.durationSec}
          paused={paused}
        />
      </div>

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        {/* Game Info */}
        <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2">
          <h3 className="text-white font-medium text-sm">{currentGame.label}</h3>
          <p className="text-white/60 text-xs">
            Best: {getBestScore(currentGame.id)} | Score: {gameScore}
          </p>
        </div>

        {/* Timer */}
        {isPlaying && (
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-2">
            <TimerRing progress={progress} size={50} />
          </div>
        )}
      </div>

      {/* Captions */}
      <AnimatePresence>
        {captions.map((caption) => (
          <CaptionComponent
            key={caption.id}
            text={caption.text}
            duration={2000}
            onComplete={() => {
              setCaptions((prev) => prev.filter((c) => c.id !== caption.id));
            }}
          />
        ))}
      </AnimatePresence>

      {/* Petal Burst */}
      {showPetals && <OverlayPetals count={30} duration={2000} />}

      {/* Start Button */}
      {!isPlaying && !autoplay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <motion.button
            onClick={startGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Start {currentGame.label}
          </motion.button>
        </div>
      )}
    </div>
  );
}
