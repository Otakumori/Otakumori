/**
 * Memory Match - Complete Implementation
 * "Recall the faces bound by fate."
 *
 * Core Fantasy: Match pairs of anime characters - memory and pattern recognition.
 *
 * Game Flow: menu → instructions → playing → results
 * Win Condition: Match all pairs before time runs out
 * Lose Condition: Time runs out (if time limit enabled)
 *
 * Progression: Difficulty increases with more pairs (easy: 6, normal: 8, hard: 10)
 * Scoring: Base points + time bonus + move efficiency + streak bonuses
 * Petals: Awarded on completion based on score, accuracy, difficulty
 */

'use client';

import { logger } from '@/app/lib/logger';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sessionTracker } from '@/lib/analytics/session-tracker';
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
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import {
  createPetalBurst,
  updatePetalParticles,
  type PetalParticle,
  easingFunctions,
} from '../_shared/vfx';

interface Card {
  id: number;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
}

);
}
export default function MemoryMatchGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameState, setGameState] = useState<
    'menu' | 'instructions' | 'playing' | 'win' | 'lose' | 'paused'
  >('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [streak, setStreak] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const sessionId = useRef<string | null>(null);

  // VFX state
  const [petalParticles, setPetalParticles] = useState<PetalParticle[]>([]);
  const [shakingCardId, setShakingCardId] = useState<number | null>(null);
  const [matchedCardIds, setMatchedCardIds] = useState<Set<number>>(new Set());

  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [showAvatarChoice, setShowAvatarChoice] = useState(false);

  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('memory-match');
  const {
    avatarConfig,
    representationConfig,
    isLoading: avatarLoading,
  } = useGameAvatar('memory-match', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile: avatarChoice === 'creator' ? selectedAvatar : null,
  });

  // Visual profile and HUD
  const visualProfile = getGameVisualProfile('memory-match');
  const { backgroundStyle } = applyVisualProfile(visualProfile);
  const { Component: HudComponent, isQuakeHud, props: hudProps } = useGameHud('memory-match');
  const { balance: petalBalance } = usePetalBalance();
  const { earnPetals } = usePetalEarn();

  // Get Clerk user for avatar display
  const { user } = useUser();

  // Game configuration - difficulty tuning parameters
  const GAME_CONFIG = {
    DIFFICULTY_SETTINGS: {
      easy: { pairs: 6, timeBonus: 2, baseScore: 1000, gridCols: 4, gridRows: 3 }, // 4×3 = 12 cards = 6 pairs
      normal: { pairs: 8, timeBonus: 1.5, baseScore: 1500, gridCols: 4, gridRows: 4 }, // 4×4 = 16 cards = 8 pairs
      hard: { pairs: 18, timeBonus: 1, baseScore: 2000, gridCols: 6, gridRows: 6 }, // 6×6 = 36 cards = 18 pairs
    },
    MOVE_BONUS_MULTIPLIER: 50,
    STREAK_BONUS_MULTIPLIER: 25,
    TIME_BONUS_BASE: 300,
    FLIP_ANIMATION_DURATION: 300, // ms
    MATCH_ANIMATION_DURATION: 1000, // ms
    MISMATCH_ANIMATION_DURATION: 1500, // ms
  } as const;

  const difficultySettings = GAME_CONFIG.DIFFICULTY_SETTINGS;
  const settings = difficultySettings[difficulty];

  // Initialize game
  const initializeGame = useCallback(() => {
    // Generate image paths for the selected number of pairs
    const imagePaths: string[] = [];
    for (let i = 1; i <= settings.pairs; i++) {
      const imagePath = `/assets/memory-cards/kawaii_${i}.svg`;
      imagePaths.push(imagePath);
    }

    // Create pairs of cards with the same imageUrl
    const cardPairs: Card[] = [];
    let idCounter = 0;
    imagePaths.forEach((imageUrl) => {
      cardPairs.push(
        { id: idCounter++, imageUrl, isFlipped: false, isMatched: false },
        { id: idCounter++, imageUrl, isFlipped: false, isMatched: false },
      );
    });

    // Shuffle cards using Fisher-Yates algorithm
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeElapsed(0);
    setStreak(0);
    setFinalScore(0);
    setPetalReward(null);
    setHasAwardedPetals(false);

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

  const [petalReward, setPetalReward] = useState<number | null>(null);
  const [hasAwardedPetals, setHasAwardedPetals] = useState(false);

  // Complete game
  const completeGame = useCallback(async () => {
    setGameState('win');

    // Calculate score
    const timeBonus = Math.max(0, GAME_CONFIG.TIME_BONUS_BASE - timeElapsed) * settings.timeBonus;
    const moveBonus = Math.max(0, settings.pairs * 2 - moves) * GAME_CONFIG.MOVE_BONUS_MULTIPLIER;
    const streakBonus = streak * GAME_CONFIG.STREAK_BONUS_MULTIPLIER;
    const calculatedScore = Math.round(settings.baseScore + timeBonus + moveBonus + streakBonus);
    setFinalScore(calculatedScore);

    // Calculate accuracy
    const accuracy = matches / Math.max(moves, 1);

    // End session tracking
    if (sessionId.current) {
      await sessionTracker.endSession(calculatedScore);
    }

    // Award petals using hook
    if (!hasAwardedPetals) {
      setHasAwardedPetals(true);
      const result = await earnPetals({
        gameId: 'memory-match',
        score: calculatedScore,
        metadata: {
          timeElapsed,
          moves,
          accuracy,
          difficulty,
          streak,
          pairs: settings.pairs,
        },
      });

      if (result.success) {
        setPetalReward(result.earned);
      }
    }

    // Submit to leaderboard
    try {
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
            streak,
            pairs: settings.pairs,
          },
        }),
      });
    } catch (error) {
      logger.error('Failed to submit score:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  }, [timeElapsed, moves, matches, streak, settings, difficulty, earnPetals, hasAwardedPetals]);

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

        if (firstCard.imageUrl === secondCard.imageUrl) {
          // Match found! - Add to matched set for glow effect
          setMatchedCardIds((prev) => new Set([...prev, firstId, secondId]));

          // Create petal burst VFX at card positions
          const card1Element = document.querySelector(`[data-card-id="${firstId}"]`);

          if (card1Element) {
            const rect = card1Element.getBoundingClientRect();
            const burst = createPetalBurst(
              rect.left + rect.width / 2,
              rect.top + rect.height / 2,
              6,
              {
                speed: 2,
                spread: Math.PI * 2,
              },
            );
            setPetalParticles((prev) => [...prev, ...burst]);
          }

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
          }, GAME_CONFIG.MATCH_ANIMATION_DURATION);
        } else {
          // No match - shake animation
          setShakingCardId(firstId);
          setTimeout(() => setShakingCardId(secondId), 50);

          setTimeout(() => {
            setCards((prev) =>
              prev.map((card) =>
                card.id === firstId || card.id === secondId ? { ...card, isFlipped: false } : card,
              ),
            );
            setFlippedCards([]);
            setStreak(0);
            setShakingCardId(null);
          }, GAME_CONFIG.MISMATCH_ANIMATION_DURATION);
        }
      }
    },
    [gameState, flippedCards, cards, settings.pairs, completeGame],
  );

  // Update petal particles
  useEffect(() => {
    if (gameState !== 'playing' || petalParticles.length === 0) {
      if (petalParticles.length > 0) {
        setPetalParticles([]);
      }
      return;
    }

    let animationId: number | null = null;
    let lastTime = performance.now();
    let isRunning = true;

    const updateParticles = () => {
      if (!isRunning) return;

      const now = performance.now();
      const deltaTime = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      setPetalParticles((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        const updated = updatePetalParticles(prev, deltaTime, 0.1);
        if (updated.length > 0 && isRunning) {
          animationId = requestAnimationFrame(updateParticles);
        }
        return updated;
      });
    };

    animationId = requestAnimationFrame(updateParticles);

    return () => {
      isRunning = false;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, petalParticles.length]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Restart handler
  const handleRestart = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle avatar choice
  const handleAvatarChoice = useCallback((choice: AvatarChoice, avatar?: AvatarProfile | any) => {
    setAvatarChoice(choice);
    if (choice === 'creator' && avatar) {
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

  const displayName = getGameDisplayName('memory-match');

  return (
    <MiniGameFrame gameId="memory-match">
      <div className="relative min-h-screen p-4" style={backgroundStyle}>
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-between mb-4">
    <div className="flex-1 flex items-center" >
      {/* Clerk User Avatar */ }
  {
    user?.imageUrl && (
      <Image
                    src={ user.imageUrl }
    alt = { user.fullName || user.firstName || 'User Avatar' }
    width = { 50}
    height = { 50}
    className = "rounded-full border-2 border-pink-400/50"
      />
                )
  }
  </div>
              <div className="flex-1 text-center">
                <h1 className="text-4xl font-bold text-pink-400 mb-2">{displayName}</h1>
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

          {/* Avatar Display (Portrait Mode) - MAIN CHARACTER CENTER STAGE */}
          {isAvatarsEnabled() && avatarConfig && !avatarLoading && (
            <div className="flex justify-center mb-8">
              <div className="relative w-64 h-64">
                <AvatarRenderer
                  profile={avatarConfig}
                  mode={representationConfig.mode}
                  size="large"
                />
              </div>
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
                      <div className="text-sm opacity-75">
                        {difficultySettings[diff].pairs} pairs
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    // Check if avatar choice is needed
                    if (
                      avatarUsage === 'avatar-or-preset' &&
                      avatarChoice === null &&
                      isAvatarsEnabled()
                    ) {
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
              {/* HUD - uses loader for cosmetics */}
              {isQuakeHud ? (
                <HudComponent {...hudProps} petals={petalBalance} gameId="memory-match" />
              ) : (
                <HudComponent {...hudProps} score={finalScore} timer={timeElapsed} combo={streak} />
              )}

              {/* Game Board */}
              <div
                className={`grid gap-4 ${
                  settings.pairs <= 6
                    ? `grid-cols-${settings.gridCols || 4}`
                    : settings.pairs <= 8
                      ? `grid-cols-${settings.gridCols || 4} md:grid-cols-${settings.gridCols || 5}`
                      : `grid-cols-${settings.gridCols || 4} md:grid-cols-${settings.gridCols || 5} lg:grid-cols-${settings.gridCols || 6}`
                }`}
                style={{
                  gridTemplateColumns: `repeat(${settings.gridCols || 4}, minmax(0, 1fr))`,
                }}
              >
                <AnimatePresence>
                  {cards.map((card) => {
                    const isShaking = shakingCardId === card.id;
                    const isMatched = matchedCardIds.has(card.id);

                    return (
                      <motion.div
                        key={card.id}
                        data-card-id={card.id}
                        layoutId={`card-${card.id}`}
                        whileHover={{ scale: gameState === 'playing' ? 1.05 : 1 }}
                        whileTap={{ scale: 0.95 }}
                        animate={
                          isShaking
                            ? {
                                x: [0, -10, 10, -10, 10, 0],
                                transition: { duration: 0.3 },
                              }
                            : {}
                        }
                        className="aspect-square cursor-pointer"
                        onClick={() => handleCardFlip(card.id)}
                      >
                        <motion.div
                          className={`w-full h-full relative preserve-3d ${
                            card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                          }`}
                          transition={{
                            duration: GAME_CONFIG.FLIP_ANIMATION_DURATION / 1000,
                            ease: easingFunctions.easeInOutCubic,
                          }}
                          style={{
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          {/* Card Back */}
  < div className = "absolute inset-0 backface-hidden rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/20 via-pink-900/20 to-purple-900/20" >
    <Image
                              src="/assets/memory-cards/card-back.svg"
alt = "Card back"
fill
className = "object-cover"
sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
  {/* Subtle texture overlay for depth */ }
  < div className = "absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(236,72,153,0.1)_0%,transparent_70%)] opacity-60" />
    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(139,92,246,0.05)_0%,transparent_50%)] opacity-40" />
                          </div>
                          {/* Card Front */}
                          <motion.div
                            className={
  `absolute inset-0 backface-hidden rotate-y-180 rounded-xl border-2 overflow-hidden ${
                              card.isMatched
    ? 'border-green-400'
    : 'border-slate-600'
                            }`}
                            animate={
                              isMatched
                                ? {
                                    boxShadow: [
                                      '0 0 0px rgba(34, 197, 94, 0)',
                                      '0 0 20px rgba(34, 197, 94, 0.8)',
                                      '0 0 10px rgba(34, 197, 94, 0.4)',
                                    ],
                                    transition: { duration: 0.5, times: [0, 0.5, 1] },
                                  }
                                : {}
                            }
                          >
  <Image
                              src={ card.imageUrl }
alt = "Card"
fill
className = "object-cover"
sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  />
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Petal Particles Overlay */}
              {petalParticles.length > 0 && (
                <svg
                  className="absolute inset-0 pointer-events-none z-20"
                  style={{ width: '100%', height: '100%' }}
                >
                  {petalParticles.map((particle) => (
                    <g
                      key={particle.id}
                      transform={`translate(${particle.x}, ${particle.y}) rotate(${(particle.rotation * 180) / Math.PI}) scale(${particle.scale})`}
                      opacity={particle.alpha}
                    >
                      <circle r={4} fill="#ec4899" />
                    </g>
                  ))}
                </svg>
              )}
            </>
          )}

          {/* Game Overlay (Instructions, Win, Lose, Paused) */}
          <GameOverlay
            state={
              gameState === 'instructions'
                ? 'instructions'
                : gameState === 'win'
                  ? 'win'
                  : gameState === 'paused'
                    ? 'paused'
                    : 'playing'
            }
            instructions={[
              'Click cards to flip them',
              'Match pairs of anime characters',
              'Complete all pairs to win',
              'Chain matches for streak bonuses',
              'Complete faster for time bonuses',
            ]}
            winMessage={`Memory Master! You matched all ${settings.pairs} pairs in ${formatTime(timeElapsed)}!`}
            score={finalScore}
            petalReward={petalReward}
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
    </MiniGameFrame>
  );
}
