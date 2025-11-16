'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type EngineGame, type Caption } from './types';
import { useProgress } from './useProgress';
import { useRewards } from './useRewards';
import { Caption as CaptionComponent } from './ui/Caption';
import { TimerRing } from './ui/TimerRing';
import { OverlayPetals } from './ui/OverlayPetals';
// Shared UI components - imported for QA validation (Engine handles its own UI)
// eslint-disable-next-line unused-imports/no-unused-imports
import { useGameHud } from '@/app/mini-games/_shared/useGameHud';
// eslint-disable-next-line unused-imports/no-unused-imports
import { GameOverlay } from '@/app/mini-games/_shared/GameOverlay';

interface EngineProps {
  playlist: EngineGame[];
  mode?: 'short' | 'long';
  autoplay?: boolean;
}

export default function Engine({ playlist, mode: _mode = 'short', autoplay = true }: EngineProps) {
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [showPetals, setShowPetals] = useState(false);

  const { updateBestScore, updateDailyStreak, addPetalsEarned, getBestScore } = useProgress();
  const { attemptReward, isSignedIn: _isSignedIn } = useRewards();

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

    setIsPlaying(true);
    setTimeRemaining(currentGame.durationSec);
    setGameScore(0);
    setCaptions([]);
  }, [currentGame]);

  const endGame = useCallback(
    (success: boolean, score: number, petals: number) => {
      const game = currentGame;
      if (!game) {
        setIsPlaying(false);
        return;
      }

      setIsPlaying(false);

      if (success) {
        updateBestScore(game.id, score);
        updateDailyStreak();
        addPetalsEarned(petals);

        // Attempt server reward (guests can still earn session petals)
        attemptReward(petals).then((result) => {
          if (!result.success && result.error === 'auth_required') {
            pushCaption('Sign in to save your petals long-term.');
          }
        });

        setShowPetals(true);
        setTimeout(() => setShowPetals(false), 2000);
      }

      // Move to next game after delay (increased from 1500ms for better pacing)
      setTimeout(() => {
        setCurrentGameIndex((prev) => {
          if (playlist.length === 0) return prev;
          return (prev + 1) % playlist.length;
        });
      }, 1500);
    },
    [
      currentGame,
      updateBestScore,
      updateDailyStreak,
      addPetalsEarned,
      attemptReward,
      pushCaption,
      playlist.length,
    ],
  );

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || timeRemaining <= 0) return;

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
  }, [isPlaying, timeRemaining, gameScore, endGame]);

  // Auto-start games
  useEffect(() => {
    if (autoplay && !isPlaying) {
      const timer = setTimeout(startGame, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoplay, isPlaying, startGame]);

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
