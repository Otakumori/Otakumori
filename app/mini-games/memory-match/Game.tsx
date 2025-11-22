// @ts-nocheck
// DEPRECATED: This component is a duplicate. Use app\mini-games\bubble-girl\Game.tsx instead.
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GameAvatarIntegration } from '../_shared/GameAvatarIntegration';

type Props = {
  mode: 'classic' | 'daily' | 'challenge';
};

interface GameState {
  score: number;
  timeLeft: number;
  moves: number;
  matches: number;
  isRunning: boolean;
  isGameOver: boolean;
  isComplete: boolean;
  boardSize: number;
  runeSet: string;
}

interface Card {
  id: string;
  rune: string;
  isFlipped: boolean;
  isMatched: boolean;
  position: number;
}

interface RuneSet {
  name: string;
  runes: string[];
  theme: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export default function Game({ mode }: Props) {
  const gameRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: mode === 'challenge' ? 60 : 120,
    moves: 0,
    matches: 0,
    isRunning: true,
    isGameOver: false,
    isComplete: false,
    boardSize: 4,
    runeSet: 'cherry-blossom',
  });

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  // Initialize game engine
  useEffect(() => {
    const game = new GameEngine(mode);
    gameRef.current = game;

    const initialCards = game.generateBoard();
    setCards(initialCards);

    // Start game loop
    let animationId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min(0.033, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (gameState.isRunning) {
        game.update(deltaTime);

        // Update game state
        setGameState((prev) => ({
          ...prev,
          score: game.getScore(),
          timeLeft: Math.max(0, game.getTimeLeft()),
          moves: game.getMoves(),
          matches: game.getMatches(),
          boardSize: game.getBoardSize(),
          runeSet: game.getRuneSet(),
        }));

        // Check game over conditions
        if (game.getTimeLeft() <= 0 || game.isComplete()) {
          setGameState((prev) => ({
            ...prev,
            isRunning: false,
            isGameOver: true,
            isComplete: game.isComplete(),
          }));
          game.endGame();
        }
      }

      if (gameState.isRunning) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      game.destroy();
    };
  }, [mode]); // Remove gameState.isRunning to prevent infinite re-renders

  // Handle card click
  const handleCardClick = useCallback(
    (index: number) => {
      if (
        !gameRef.current ||
        flippedCards.length >= 2 ||
        cards[index].isFlipped ||
        cards[index].isMatched
      )
        return;

      const newFlippedCards = [...flippedCards, index];
      setFlippedCards(newFlippedCards);

      // Update card state
      setCards((prev) =>
        prev.map((card, i) => (i === index ? { ...card, isFlipped: true } : card)),
      );

      // Check for match if two cards are flipped
      if (newFlippedCards.length === 2) {
        setTimeout(() => {
          const [firstIndex, secondIndex] = newFlippedCards;
          const firstCard = cards[firstIndex];
          const secondCard = cards[secondIndex];

          if (!firstCard || !secondCard) return;

          if (firstCard.rune === secondCard.rune) {
            // Match found
            setCards((prev) =>
              prev.map((card, i) =>
                i === firstIndex || i === secondIndex ? { ...card, isMatched: true } : card,
              ),
            );
            gameRef.current?.recordMatch();
          } else {
            // No match, flip back
            setCards((prev) =>
              prev.map((card, i) =>
                i === firstIndex || i === secondIndex ? { ...card, isFlipped: false } : card,
              ),
            );
          }

          gameRef.current?.recordMove();
          setFlippedCards([]);
        }, 1000);
      }
    },
    [flippedCards, cards],
  );

  // Handle power-up usage
  const handlePowerUp = useCallback((powerUp: string) => {
    if (gameRef.current) {
      gameRef.current.usePowerUp(powerUp);
    }
  }, []);

  // Submit score when game ends
  useEffect(() => {
    if (gameState.isGameOver) {
      const submitScore = async () => {
        try {
          await fetch('/api/v1/leaderboard/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gameCode: 'memory-match',
              score: Math.max(0, Math.round(gameState.score)),
              meta: { moves: gameState.moves, matches: gameState.matches, mode },
            }),
          });
        } catch (error) {
          console.error('Failed to submit score:', error);
        }
      };
      submitScore();
    }
  }, [gameState.isGameOver, gameState.score, gameState.moves, gameState.matches, mode]);

  return (
    <div className="relative">
      {/* Avatar Display */}
      <GameAvatarIntegration
        gameId="memory-match"
        gameMode={mode}
        className="absolute top-4 right-4 z-10"
        quality="low"
        enable3D={false}
        enableAnimations={false}
      />

      {/* Game Board */}
      <div
        className="grid gap-2 p-4"
        style={{
          gridTemplateColumns: `repeat(${gameState.boardSize}, 1fr)`,
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className={`aspect-square rounded-lg border-2 cursor-pointer flex items-center justify-center text-2xl font-bold transition-all duration-300 relative overflow-hidden ${
              card.isMatched
                ? 'bg-gradient-to-br from-emerald-400/30 to-emerald-600/30 border-emerald-400/50 text-emerald-100 shadow-lg shadow-emerald-500/30'
                : card.isFlipped
                  ? 'bg-gradient-to-br from-white/95 to-gray-100/95 border-white/40 text-gray-800 shadow-lg'
                  : 'bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-pink-600/20 border-pink-400/40 text-pink-200 hover:from-pink-500/30 hover:via-purple-500/30 hover:to-pink-600/30 hover:border-pink-400/60 hover:shadow-lg hover:shadow-pink-500/20'
            }`}
            style={{
              backdropFilter: 'blur(8px)',
              boxShadow: card.isMatched
                ? '0 0 20px rgba(16, 185, 129, 0.4)'
                : card.isFlipped
                  ? '0 4px 12px rgba(0, 0, 0, 0.2)'
                  : '0 2px 8px rgba(236, 72, 153, 0.2)',
            }}
            onClick={() => handleCardClick(index)}
            whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: card.isFlipped || card.isMatched ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {/* Card back pattern (cherry blossom texture) when not flipped */}
            {!card.isFlipped && !card.isMatched && (
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.3) 0%, transparent 70%), repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(167, 139, 250, 0.1) 10px, rgba(167, 139, 250, 0.1) 20px)',
                  backgroundSize: '100% 100%, 20px 20px',
                }}
              />
            )}
            {/* Card content */}
            <span className={`relative z-10 ${card.isMatched ? 'animate-pulse' : ''}`}>
              {card.isFlipped || card.isMatched ? card.rune : ''}
            </span>
            {/* Glow effect for matched cards */}
            {card.isMatched && (
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-transparent animate-pulse" />
            )}
          </motion.div>
        ))}
      </div>

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 flex gap-4">
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Score: {gameState.score}
        </div>
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Time: {Math.ceil(gameState.timeLeft)}s
        </div>
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Moves: {gameState.moves}
        </div>
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Matches: {gameState.matches}/{(gameState.boardSize * gameState.boardSize) / 2}
        </div>
      </div>

      {/* Power-ups */}
      <div className="absolute top-4 right-4 flex gap-2">
        <motion.button
          className="px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded text-blue-200 text-xs hover:bg-blue-500/30 transition-colors"
          onClick={() => handlePowerUp('hint')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Hint
        </motion.button>
        <motion.button
          className="px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded text-green-200 text-xs hover:bg-green-500/30 transition-colors"
          onClick={() => handlePowerUp('shuffle')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Shuffle
        </motion.button>
      </div>

      {/* Rune Set Info */}
      <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
        Rune Set: {gameState.runeSet}
      </div>

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl p-8 text-center max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {gameState.isComplete ? 'Puzzle Complete!' : "Time's Up!"}
            </h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-600">Final Score: {gameState.score}</p>
              <p className="text-gray-600">Moves: {gameState.moves}</p>
              <p className="text-gray-600">Matches: {gameState.matches}</p>
              <p className="text-gray-600">Mode: {mode}</p>
            </div>
            <motion.button
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Again
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Enhanced Game Engine Class
class GameEngine {
  private mode: string;
  private score: number = 0;
  private timeLeft: number;
  private moves: number = 0;
  private matches: number = 0;
  private boardSize: number = 4;
  private runeSet: string = 'cherry-blossom';
  private animationId: number | null = null;
  private gameComplete: boolean = false;

  private runeSets: RuneSet[] = [
    {
      name: 'cherry-blossom',
      runes: ['', '', '', '', '', '', '', ''],
      theme: 'Spring Flowers',
      rarity: 'common',
    },
    {
      name: 'eternal-rune',
      runes: ['', '', '️', '', '️', '', '', '️'],
      theme: 'Elemental Forces',
      rarity: 'rare',
    },
    {
      name: 'guardian-rune',
      runes: ['', '', '', '†', '', '', '', '◆'],
      theme: 'Guardian Symbols',
      rarity: 'legendary',
    },
  ];

  constructor(mode: string) {
    this.mode = mode;
    this.timeLeft = mode === 'challenge' ? 60 : 120;
    this.selectDailyRuneSet();
  }

  private selectDailyRuneSet() {
    // Simple daily rotation based on date
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
    );
    const setIndex = dayOfYear % this.runeSets.length;
    this.runeSet = this.runeSets[setIndex].name;
  }

  generateBoard(): Card[] {
    const selectedSet = this.runeSets.find((set) => set.name === this.runeSet);
    if (!selectedSet) return [];

    const totalCards = this.boardSize * this.boardSize;
    const pairsNeeded = totalCards / 2;
    const runesToUse = selectedSet.runes.slice(0, pairsNeeded);

    // Create pairs
    const cardRunes: string[] = [];
    runesToUse.forEach((rune) => {
      if (rune) {
        cardRunes.push(rune, rune);
      }
    });

    // Shuffle
    for (let i = cardRunes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = cardRunes[i];
      const swap = cardRunes[j];
      if (temp !== undefined && swap !== undefined) {
        cardRunes[i] = swap;
        cardRunes[j] = temp;
      }
    }

    // Create card objects
    return cardRunes.map((rune, index) => ({
      id: `card-${index}`,
      rune,
      isFlipped: false,
      isMatched: false,
      position: index,
    }));
  }

  update(deltaTime: number) {
    this.timeLeft -= deltaTime;
  }

  recordMove() {
    this.moves++;
    // Score based on efficiency (fewer moves = higher score)
    this.score = Math.max(0, 1000 - this.moves * 10 + this.matches * 100);
  }

  recordMatch() {
    this.matches++;
    this.score += 100;

    // Check if game is complete
    const totalPairs = (this.boardSize * this.boardSize) / 2;
    if (this.matches >= totalPairs) {
      this.gameComplete = true;
      this.score += 500; // Completion bonus
    }
  }

  usePowerUp(powerUp: string) {
    switch (powerUp) {
      case 'hint':
        // Reveal two random unmatched cards briefly
        this.score -= 50; // Cost
        break;
      case 'shuffle':
        // Shuffle unmatched cards
        this.score -= 100; // Cost
        break;
    }
  }

  endGame() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  getScore(): number {
    return this.score;
  }
  getTimeLeft(): number {
    return this.timeLeft;
  }
  getMoves(): number {
    return this.moves;
  }
  getMatches(): number {
    return this.matches;
  }
  getBoardSize(): number {
    return this.boardSize;
  }
  getRuneSet(): string {
    return this.runeSet;
  }
  isComplete(): boolean {
    return this.gameComplete;
  }
}
