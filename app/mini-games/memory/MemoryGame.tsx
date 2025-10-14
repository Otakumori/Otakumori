'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Card {
  id: string;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
  characterName: string;
  characterSet: 'kill-la-kill' | 'studio-ghibli';
  imagePath: string;
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

// Character sets for different difficulties
const CHARACTER_SETS = {
  easy: {
    'kill-la-kill': [
      { name: 'ryuko', path: '/assets/memory/kill-la-kill/ryuko.svg' },
      { name: 'satsuki', path: '/assets/memory/kill-la-kill/satsuki.svg' },
      { name: 'mako', path: '/assets/memory/kill-la-kill/mako.svg' },
    ],
    'studio-ghibli': [
      { name: 'totoro', path: '/assets/memory/studio-ghibli/totoro.svg' },
      { name: 'chihiro', path: '/assets/memory/studio-ghibli/chihiro.svg' },
      { name: 'howl', path: '/assets/memory/studio-ghibli/howl.svg' },
    ],
  },
  medium: {
    'kill-la-kill': [
      { name: 'ryuko', path: '/assets/memory/kill-la-kill/ryuko.svg' },
      { name: 'satsuki', path: '/assets/memory/kill-la-kill/satsuki.svg' },
      { name: 'mako', path: '/assets/memory/kill-la-kill/mako.svg' },
      { name: 'senketsu', path: '/assets/memory/kill-la-kill/senketsu.svg' },
      { name: 'nonon', path: '/assets/memory/kill-la-kill/nonon.svg' },
    ],
    'studio-ghibli': [
      { name: 'totoro', path: '/assets/memory/studio-ghibli/totoro.svg' },
      { name: 'chihiro', path: '/assets/memory/studio-ghibli/chihiro.svg' },
      { name: 'howl', path: '/assets/memory/studio-ghibli/howl.svg' },
      { name: 'sophie', path: '/assets/memory/studio-ghibli/sophie.svg' },
      { name: 'kiki', path: '/assets/memory/studio-ghibli/kiki.svg' },
    ],
  },
  hard: {
    'kill-la-kill': [
      { name: 'ryuko', path: '/assets/memory/kill-la-kill/ryuko.svg' },
      { name: 'satsuki', path: '/assets/memory/kill-la-kill/satsuki.svg' },
      { name: 'mako', path: '/assets/memory/kill-la-kill/mako.svg' },
      { name: 'senketsu', path: '/assets/memory/kill-la-kill/senketsu.svg' },
      { name: 'nonon', path: '/assets/memory/kill-la-kill/nonon.svg' },
      { name: 'gamagoori', path: '/assets/memory/kill-la-kill/gamagoori.svg' },
      { name: 'sanageyama', path: '/assets/memory/kill-la-kill/sanageyama.svg' },
      { name: 'inumuta', path: '/assets/memory/kill-la-kill/inumuta.svg' },
    ],
    'studio-ghibli': [
      { name: 'totoro', path: '/assets/memory/studio-ghibli/totoro.svg' },
      { name: 'chihiro', path: '/assets/memory/studio-ghibli/chihiro.svg' },
      { name: 'howl', path: '/assets/memory/studio-ghibli/howl.svg' },
      { name: 'sophie', path: '/assets/memory/studio-ghibli/sophie.svg' },
      { name: 'kiki', path: '/assets/memory/studio-ghibli/kiki.svg' },
      { name: 'ashitaka', path: '/assets/memory/studio-ghibli/ashitaka.svg' },
      { name: 'san', path: '/assets/memory/studio-ghibli/san.svg' },
      { name: 'calcifer', path: '/assets/memory/studio-ghibli/calcifer.svg' },
    ],
  },
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
    const characterSet = Math.random() > 0.5 ? 'kill-la-kill' : 'studio-ghibli';
    const availableCharacters = CHARACTER_SETS[difficulty][characterSet];

    // Select characters for this game (ensuring we have enough)
    const selectedCharacters = availableCharacters.slice(0, pairs);

    // Create pairs of cards
    const cardPairs: Card[] = [];
    selectedCharacters.forEach((character) => {
      // First card of the pair
      cardPairs.push({
        id: `${character.name}-1`,
        value: character.name,
        isFlipped: false,
        isMatched: false,
        characterName: character.name,
        characterSet,
        imagePath: character.path,
      });

      // Second card of the pair
      cardPairs.push({
        id: `${character.name}-2`,
        value: character.name,
        isFlipped: false,
        isMatched: false,
        characterName: character.name,
        characterSet,
        imagePath: character.path,
      });
    });

    // Shuffle the cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);

    setGameState({
      cards: shuffledCards,
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

      // BUG FIX: Check if this is the first or second card BEFORE updating state
      const isSecondCard = gameState.flippedCards.length === 1;
      const firstCardId = isSecondCard ? gameState.flippedCards[0] : null;

      // Flip the card
      setGameState((prev) => ({
        ...prev,
        cards: prev.cards.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)),
        flippedCards: [...prev.flippedCards, cardId],
      }));

      // Check for match after second card is flipped
      if (isSecondCard && firstCardId) {
        const firstCard = gameState.cards.find((c) => c.id === firstCardId);

        // CRITICAL FIX: Only match if values are equal AND they're not the same card
        if (firstCard && firstCard.value === card.value && firstCardId !== cardId) {
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
                className={`memory-card aspect-square rounded-xl border-2 flex items-center justify-center transition-all relative overflow-hidden ${
                  card.isMatched
                    ? 'bg-pink-900/40 backdrop-blur-sm border-pink-500 cursor-default'
                    : card.isFlipped
                      ? 'bg-pink-600/30 backdrop-blur-lg border-pink-400'
                      : 'bg-black/80 backdrop-blur-sm border-pink-900/50 hover:border-pink-500/50 hover:bg-black/90 cursor-pointer'
                } ${card.isFlipped ? 'flipped' : ''}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={!card.isMatched && !card.isFlipped ? { scale: 1.05 } : {}}
                whileTap={!card.isMatched && !card.isFlipped ? { scale: 0.95 } : {}}
              >
                <div className="memory-card-inner w-full h-full relative">
                  {/* Card Back (Otaku-mori branded) */}
                  <div className="memory-card-back absolute inset-0 flex items-center justify-center">
                    <Image
                      src="/assets/memory/otm-card-back.svg"
                      alt="Otaku-mori Card Back"
                      width={120}
                      height={180}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Card Front (Character) */}
                  <div className="memory-card-front absolute inset-0 flex items-center justify-center">
                    <Image
                      src={card.imagePath}
                      alt={card.characterName}
                      width={120}
                      height={180}
                      className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                    />
                  </div>
                </div>

                {/* Match effect */}
                {card.isMatched && (
                  <motion.div
                    className="absolute inset-0 bg-pink-500/20 rounded-xl"
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
