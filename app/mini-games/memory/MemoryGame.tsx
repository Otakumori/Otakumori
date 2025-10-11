'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Card {
  id: string;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  emoji: string;
}

interface GameState {
  cards: Card[];
  flippedCards: string[];
  moves: number;
  matches: number;
  timeElapsed: number;
  isGameOver: boolean;
  difficulty: Difficulty;
}

// Kill la Kill themed card emojis with high contrast
const CARD_EMOJIS = {
  easy: ['⚔️', '🔥', '💀', '⭐', '🌟', '💥'],
  medium: ['⚔️', '🔥', '💀', '⭐', '🌟', '💥', '🎭', '🎪', '🎯', '🎨'],
  hard: [
    '⚔️',
    '🔥',
    '💀',
    '⭐',
    '🌟',
    '💥',
    '🎭',
    '🎪',
    '🎯',
    '🎨',
    '🏆',
    '⚡',
    '🎌',
    '🎏',
    '🎐',
    '🎑',
  ],
};

const GRID_SIZES = {
  easy: { cols: 3, rows: 4, pairs: 6 },
  medium: { cols: 4, rows: 5, pairs: 10 },
  hard: { cols: 4, rows: 8, pairs: 16 },
};

interface MemoryGameProps {
  onGameComplete?: (score: number, moves: number, time: number) => void;
}

export default function MemoryGame({ onGameComplete }: MemoryGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    flippedCards: [],
    moves: 0,
    matches: 0,
    timeElapsed: 0,
    isGameOver: false,
    difficulty: 'medium',
  });

  const [bestScore, setBestScore] = useState<{ moves: number; time: number } | null>(null);

  // Initialize game
  const initializeGame = useCallback((difficulty: Difficulty) => {
    const { pairs } = GRID_SIZES[difficulty];
    const emojis = CARD_EMOJIS[difficulty].slice(0, pairs);

    // Create pairs
    const cardPairs = [...emojis, ...emojis];

    // Shuffle
    const shuffled = cardPairs
      .map((emoji, index) => ({
        id: `card-${index}`,
        value: emoji,
        isFlipped: false,
        isMatched: false,
        emoji,
      }))
      .sort(() => Math.random() - 0.5);

    setGameState({
      cards: shuffled,
      flippedCards: [],
      moves: 0,
      matches: 0,
      timeElapsed: 0,
      isGameOver: false,
      difficulty,
    });
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.isGameOver || gameState.cards.length === 0) return;

    const timer = setInterval(() => {
      setGameState((prev) => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isGameOver, gameState.cards.length]);

  // Check for game completion
  useEffect(() => {
    if (gameState.matches === GRID_SIZES[gameState.difficulty].pairs && !gameState.isGameOver) {
      setGameState((prev) => ({ ...prev, isGameOver: true }));

      // Calculate score (lower is better)
      const score = Math.max(1000 - gameState.moves * 10 - gameState.timeElapsed * 5, 0);

      // Update best score
      if (
        !bestScore ||
        gameState.moves < bestScore.moves ||
        gameState.timeElapsed < bestScore.time
      ) {
        setBestScore({ moves: gameState.moves, time: gameState.timeElapsed });
      }

      // Callback for petal rewards
      onGameComplete?.(score, gameState.moves, gameState.timeElapsed);
    }
  }, [
    gameState.matches,
    gameState.moves,
    gameState.timeElapsed,
    gameState.difficulty,
    gameState.isGameOver,
    bestScore,
    onGameComplete,
  ]);

  // Handle card flip
  const handleCardClick = useCallback(
    (cardId: string) => {
      if (gameState.isGameOver) return;

      const card = gameState.cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched || gameState.flippedCards.length >= 2) return;

      // Flip the card
      setGameState((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)),
        flippedCards: [...prev.flippedCards, cardId],
      }));

      // Check for match after second card is flipped
      if (gameState.flippedCards.length === 1) {
        const firstCardId = gameState.flippedCards[0];
        const firstCard = gameState.cards.find((c) => c.id === firstCardId);

        if (firstCard && firstCard.value === card.value) {
          // Match found!
          setTimeout(() => {
            setGameState((prev) => ({
              ...prev,
              cards: prev.cards.map((c) =>
                c.id === firstCardId || c.id === cardId ? { ...c, isMatched: true } : c,
              ),
              flippedCards: [],
              moves: prev.moves + 1,
              matches: prev.matches + 1,
            }));
          }, 500);
        } else {
          // No match - flip back
          setTimeout(() => {
            setGameState((prev) => ({
              ...prev,
              cards: prev.cards.map((c) =>
                c.id === firstCardId || c.id === cardId ? { ...c, isFlipped: false } : c,
              ),
              flippedCards: [],
              moves: prev.moves + 1,
            }));
          }, 1000);
        }
      }
    },
    [gameState],
  );

  // Initialize on mount
  useEffect(() => {
    initializeGame('medium');
  }, [initializeGame]);

  const { cols } = GRID_SIZES[gameState.difficulty];

  return (
    <div className="min-h-screen text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-2 text-pink-400 drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">
            MEMORY MATCH
          </h1>
          <p className="text-pink-200/70 italic">Recall the faces bound by fate</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 justify-center items-center">
          <div className="flex gap-2">
            <button
              onClick={() => initializeGame('easy')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                gameState.difficulty === 'easy'
                  ? 'bg-pink-600 text-white'
                  : 'bg-black/60 backdrop-blur-sm text-pink-200/80 hover:bg-black/80 border border-pink-500/20'
              }`}
            >
              EASY
            </button>
            <button
              onClick={() => initializeGame('medium')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                gameState.difficulty === 'medium'
                  ? 'bg-pink-600 text-white'
                  : 'bg-black/60 backdrop-blur-sm text-pink-200/80 hover:bg-black/80 border border-pink-500/20'
              }`}
            >
              MEDIUM
            </button>
            <button
              onClick={() => initializeGame('hard')}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                gameState.difficulty === 'hard'
                  ? 'bg-pink-600 text-white'
                  : 'bg-black/60 backdrop-blur-sm text-pink-200/80 hover:bg-black/80 border border-pink-500/20'
              }`}
            >
              HARD
            </button>
          </div>

          <button
            onClick={() => initializeGame(gameState.difficulty)}
            className="px-6 py-2 bg-pink-500/20 backdrop-blur-sm border-2 border-pink-500 text-pink-200 rounded-lg hover:bg-pink-500/30 transition-colors font-bold"
          >
            RESTART
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-black/80 backdrop-blur-lg border border-pink-500/30 rounded-lg p-3 text-center">
            <div className="text-pink-200/60 text-sm">MOVES</div>
            <div className="text-3xl font-bold text-pink-400">{gameState.moves}</div>
          </div>
          <div className="bg-black/80 backdrop-blur-lg border border-pink-500/30 rounded-lg p-3 text-center">
            <div className="text-pink-200/60 text-sm">MATCHES</div>
            <div className="text-3xl font-bold text-pink-400">
              {gameState.matches}/{GRID_SIZES[gameState.difficulty].pairs}
            </div>
          </div>
          <div className="bg-black/80 backdrop-blur-lg border border-pink-500/30 rounded-lg p-3 text-center">
            <div className="text-pink-200/60 text-sm">TIME</div>
            <div className="text-3xl font-bold text-pink-400">
              {Math.floor(gameState.timeElapsed / 60)}:
              {(gameState.timeElapsed % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div
          className="grid gap-3 max-w-4xl mx-auto mb-8"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          <AnimatePresence>
            {gameState.cards.map((card) => (
              <motion.button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched || card.isFlipped}
                className={`aspect-square rounded-xl border-2 flex items-center justify-center text-5xl font-bold transition-all relative overflow-hidden ${
                  card.isMatched
                    ? 'bg-pink-900/40 backdrop-blur-sm border-pink-500 cursor-default'
                    : card.isFlipped
                      ? 'bg-pink-600/30 backdrop-blur-lg border-pink-400'
                      : 'bg-black/80 backdrop-blur-sm border-pink-900/50 hover:border-pink-500/50 hover:bg-black/90 cursor-pointer'
                }`}
                initial={{ scale: 0, rotateY: 180 }}
                animate={{
                  scale: 1,
                  rotateY: card.isFlipped || card.isMatched ? 0 : 180,
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={!card.isMatched && !card.isFlipped ? { scale: 1.05 } : {}}
                whileTap={!card.isMatched && !card.isFlipped ? { scale: 0.95 } : {}}
              >
                {/* Card Back (🌸 logo) */}
                {!card.isFlipped && !card.isMatched && (
                  <div className="absolute inset-0 flex items-center justify-center text-pink-400/30">
                    🌸
                  </div>
                )}

                {/* Card Front (emoji) */}
                {(card.isFlipped || card.isMatched) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                  >
                    {card.emoji}
                  </motion.div>
                )}

                {/* Match effect */}
                {card.isMatched && (
                  <motion.div
                    className="absolute inset-0 bg-pink-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Best Score */}
        {bestScore && (
          <div className="text-center text-pink-200/60 mb-4">
            Best: {bestScore.moves} moves in {bestScore.time}s
          </div>
        )}

        {/* Game Over Modal */}
        <AnimatePresence>
          {gameState.isGameOver && (
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-black/95 backdrop-blur-xl border-4 border-pink-500 rounded-2xl p-8 max-w-md mx-4 text-center"
                initial={{ scale: 0.5, rotateY: 180 }}
                animate={{ scale: 1, rotateY: 0 }}
                transition={{ type: 'spring', duration: 0.6 }}
              >
                <h2 className="text-4xl font-bold text-pink-400 mb-6 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]">
                  PERFECT RECALL!
                </h2>
                <div className="space-y-3 mb-6 text-pink-200">
                  <p className="text-xl">
                    <span className="text-pink-400 font-bold">{gameState.moves}</span> moves
                  </p>
                  <p className="text-xl">
                    <span className="text-pink-400 font-bold">
                      {Math.floor(gameState.timeElapsed / 60)}:
                      {(gameState.timeElapsed % 60).toString().padStart(2, '0')}
                    </span>{' '}
                    time
                  </p>
                  <p className="text-2xl text-yellow-400 font-bold">
                    +{Math.max(1000 - gameState.moves * 10 - gameState.timeElapsed * 5, 0)} SCORE
                  </p>
                </div>
                <button
                  onClick={() => initializeGame(gameState.difficulty)}
                  className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition-colors text-lg"
                >
                  PLAY AGAIN
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
