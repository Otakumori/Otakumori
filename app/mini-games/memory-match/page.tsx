/**
 * Memory Match - Complete Implementation
 * "Recall the faces bound by fate."
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionTracker } from '@/lib/analytics/session-tracker';
import { useGameAvatar } from '../_shared/useGameAvatarWithConfig';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { GameHUD } from '../_shared/GameHUD';
import { GameOverlay } from '../_shared/GameOverlay';
import { AvatarPresetChoice, type AvatarChoice } from '../_shared/AvatarPresetChoice';
import { getGameAvatarUsage } from '../_shared/miniGameConfigs';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';
import Link from 'next/link';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  character: string;
  series: string;
}

const CHARACTERS = [
  { value: 'senku', character: 'Senku Ishigami', series: 'Dr. Stone' },
  { value: 'edward', character: 'Edward Elric', series: 'Fullmetal Alchemist' },
  { value: 'tanjiro', character: 'Tanjiro Kamado', series: 'Demon Slayer' },
  { value: 'rimuru', character: 'Rimuru Tempest', series: 'Tensura' },
  { value: 'ainz', character: 'Ainz Ooal Gown', series: 'Overlord' },
  { value: 'saitama', character: 'Saitama', series: 'One Punch Man' },
  { value: 'natsu', character: 'Natsu Dragneel', series: 'Fairy Tail' },
  { value: 'ichigo', character: 'Ichigo Kurosaki', series: 'Bleach' },
];

export default function MemoryMatchGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'instructions' | 'playing' | 'win' | 'lose' | 'paused'>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [streak, setStreak] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const sessionId = useRef<string | null>(null);
  
  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [showAvatarChoice, setShowAvatarChoice] = useState(false);
  
  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('memory-match');
  const { avatarConfig, representationConfig, isLoading: avatarLoading } = useGameAvatar('memory-match', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile: avatarChoice === 'avatar' ? selectedAvatar : null,
  });

  // Difficulty settings
  const difficultySettings = {
    easy: { pairs: 6, timeBonus: 2 },
    normal: { pairs: 8, timeBonus: 1.5 },
    hard: { pairs: 10, timeBonus: 1 },
  };

  const settings = difficultySettings[difficulty];

  // Initialize game
  const initializeGame = useCallback(() => {
    const selectedChars = CHARACTERS.slice(0, settings.pairs);
    const cardPairs = [...selectedChars, ...selectedChars];

    const shuffledCards = cardPairs
      .map((char, index) => ({
        id: index,
        value: char.value,
        character: char.character,
        series: char.series,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeElapsed(0);
    setStreak(0);
    setFinalScore(0);

    // Start session tracking
    sessionTracker
      .startSession('memory-match', undefined, {
        difficulty,
        pairs: settings.pairs,
      })
      .then((id) => {
        sessionId.current = id;
      });

    // Don't set gameState here - let handleStart do it after instructions
  }, [difficulty, settings.pairs]);

  // No saved game loading for now - simplified implementation

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Auto-save removed for simplified implementation

  // Complete game
  const completeGame = useCallback(async () => {
    setGameState('win');

    // Calculate score
    const timeBonus = Math.max(0, 300 - timeElapsed) * settings.timeBonus;
    const moveBonus = Math.max(0, settings.pairs * 2 - moves) * 50;
    const streakBonus = streak * 25;
    const calculatedScore = Math.round(1000 + timeBonus + moveBonus + streakBonus);
    setFinalScore(calculatedScore);

    // Calculate accuracy
    const accuracy = matches / Math.max(moves, 1);

    // Calculate petal reward
    const petalReward = Math.floor(calculatedScore / 10);

    // End session tracking
    if (sessionId.current) {
      await sessionTracker.endSession(calculatedScore);
    }

    try {
      // Award petals
      if (petalReward > 0) {
        await fetch('/api/v1/petals/collect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: petalReward,
            source: 'game_reward',
          }),
        });
      }

      // Submit to leaderboard
      await fetch('/api/v1/leaderboards/memory-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: calculatedScore,
          metadata: {
            timeElapsed,
            moves,
            accuracy,
            difficulty,
            streakBonus,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }, [timeElapsed, moves, matches, streak, settings, difficulty]);

  // Handle card flip (with double-click prevention)
  const handleCardFlip = useCallback(
    (cardId: number) => {
      if (gameState !== 'playing') return;
      if (flippedCards.length >= 2) return; // Prevent more than 2 cards flipped
      if (flippedCards.includes(cardId)) return; // Prevent double-click
      if (cards[cardId].isMatched) return; // Prevent clicking matched cards
      if (cards[cardId].isFlipped) return; // Additional double-click prevention

      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);

      // Update card state
      setCards((prev) =>
        prev.map((card) => (card.id === cardId ? { ...card, isFlipped: true } : card)),
      );

      // Check for match when two cards are flipped
      if (newFlippedCards.length === 2) {
        setMoves((prev) => prev + 1);

        const [firstId, secondId] = newFlippedCards;
        const firstCard = cards[firstId];
        const secondCard = cards[secondId];

        if (firstCard.value === secondCard.value) {
          // Match found!
          setTimeout(() => {
            setCards((prev) =>
              prev.map((card) =>
                card.id === firstId || card.id === secondId ? { ...card, isMatched: true } : card,
              ),
            );
            setMatches((prev) => {
              const newMatches = prev + 1;
              // Match count tracked: ${newMatches} / ${settings.pairs}

              // Check for completion with new value
              if (newMatches === settings.pairs) {
                setTimeout(() => completeGame(), 100);
              }

              return newMatches;
            });
            setStreak((prev) => prev + 1);
            setFlippedCards([]);
          }, 1000);
        } else {
          // No match
          setTimeout(() => {
            setCards((prev) =>
              prev.map((card) =>
                card.id === firstId || card.id === secondId ? { ...card, isFlipped: false } : card,
              ),
            );
            setFlippedCards([]);
            setStreak(0);
          }, 1500);
        }
      }
    },
    [gameState, flippedCards, cards, settings.pairs, completeGame],
  );

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Pause/Resume
  const _togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  // Restart handler
  const handleRestart = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle avatar choice
  const handleAvatarChoice = useCallback((choice: AvatarChoice, avatar?: AvatarProfile) => {
    setAvatarChoice(choice);
    if (choice === 'avatar' && avatar) {
      setSelectedAvatar(avatar);
    }
    setShowAvatarChoice(false);
    // Show instructions after choice
    setGameState('instructions');
  }, []);
  
  // Start game handler (from instructions overlay)
  const handleStart = useCallback(() => {
    initializeGame(); // Initialize game state
    setGameState('playing'); // Start playing after instructions
  }, [initializeGame]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold text-pink-400 mb-2">Memory Match</h1>
              <p className="text-slate-300 italic">"Recall the faces bound by fate."</p>
            </div>
            <div className="flex-1 flex justify-end">
              <Link
                href="/mini-games"
                className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
              >
                Back to Arcade
              </Link>
            </div>
          </div>
        </div>

        {/* Avatar Display (Portrait Mode) */}
        {isAvatarsEnabled() && avatarConfig && !avatarLoading && (
          <div className="flex justify-center mb-6">
            <AvatarRenderer
              profile={avatarConfig}
              mode={representationConfig.mode}
              size="small"
            />
          </div>
        )}

        {/* Avatar vs Preset Choice */}
        {showAvatarChoice && (
          <AvatarPresetChoice
            gameId="memory-match"
            onChoice={handleAvatarChoice}
            onCancel={() => setShowAvatarChoice(false)}
          />
        )}
        
        {/* Difficulty Selection Menu */}
        {gameState === 'menu' && !showAvatarChoice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700"
          >
            <div className="text-center space-y-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Choose Difficulty</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['easy', 'normal', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      difficulty === diff
                        ? 'border-pink-400 bg-pink-400/20 text-pink-300'
                        : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-semibold capitalize">{diff}</div>
                    <div className="text-sm opacity-75">{difficultySettings[diff].pairs} pairs</div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  // Check if avatar choice is needed
                  if (avatarUsage === 'avatar-or-preset' && avatarChoice === null && isAvatarsEnabled()) {
                    setShowAvatarChoice(true);
                  } else {
                    setGameState('instructions');
                  }
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-400 hover:to-purple-500 transition-all"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Game UI */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <>
            {/* Game HUD */}
            <GameHUD
              score={finalScore}
              timer={timeElapsed}
              combo={streak}
            />

            {/* Game Board */}
            <div
              className={`grid gap-4 ${
                settings.pairs <= 6
                  ? 'grid-cols-4'
                  : settings.pairs <= 8
                    ? 'grid-cols-4 md:grid-cols-5'
                    : 'grid-cols-4 md:grid-cols-5 lg:grid-cols-6'
              }`}
            >
              <AnimatePresence>
                {cards.map((card) => (
                  <motion.div
                    key={card.id}
                    layoutId={`card-${card.id}`}
                    whileHover={{ scale: gameState === 'playing' ? 1.05 : 1 }}
                    whileTap={{ scale: 0.95 }}
                    className="aspect-square cursor-pointer"
                    onClick={() => handleCardFlip(card.id)}
                  >
                    <div
                      className={`w-full h-full relative preserve-3d transition-transform duration-500 ${
                        card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                      }`}
                    >
                      {/* Card Back */}
                      <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl border-2 border-pink-400/50 flex items-center justify-center">
                        <div className="text-4xl"></div>
                      </div>
                      {/* Card Front */}
                      <div
                        className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 p-2 flex flex-col items-center justify-center text-center ${
                          card.isMatched
                            ? 'bg-green-600/80 border-green-400'
                            : 'bg-slate-800/90 border-slate-600'
                        }`}
                      >
                        <div className="text-2xl mb-1">
                          {card.character === 'Senku Ishigami'
                            ? ''
                            : card.character === 'Edward Elric'
                              ? ''
                              : card.character === 'Tanjiro Kamado'
                                ? ''
                                : card.character === 'Rimuru Tempest'
                                  ? ''
                                  : card.character === 'Ainz Ooal Gown'
                                    ? ''
                                    : card.character === 'Saitama'
                                      ? ''
                                      : card.character === 'Natsu Dragneel'
                                        ? ''
                                        : card.character === 'Ichigo Kurosaki'
                                          ? '†'
                                          : ''}
                        </div>
                        <div className="text-xs text-white font-medium">{card.character}</div>
                        <div className="text-xs text-slate-400">{card.series}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Game Overlay (Instructions, Win, Lose, Paused) */}
        <GameOverlay
          state={gameState === 'instructions' ? 'instructions' : gameState === 'win' ? 'win' : gameState === 'paused' ? 'paused' : 'playing'}
          instructions={[
            'Click cards to flip them',
            'Match pairs of anime characters',
            'Complete all pairs to win',
            'Chain matches for streak bonuses',
            'Complete faster for time bonuses',
          ]}
          winMessage={`Memory Master! You matched all ${settings.pairs} pairs in ${formatTime(timeElapsed)}!`}
          score={finalScore}
          onRestart={handleRestart}
          onResume={handleStart}
        />
      </div>

      <style>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
