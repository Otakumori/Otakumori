'use client';
import { useState, useEffect, useCallback } from 'react';
import { useGameSave } from '../_shared/SaveSystem';
import { GameAvatarIntegration } from '../_shared/GameAvatarIntegration';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchGameProps {
  deck: 'anime' | 'gaming' | 'runes';
  pairs: number;
  timeLimit: number; // seconds
}

export default function MemoryMatchGame({ deck, pairs, timeLimit }: MemoryMatchGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'won' | 'lost'>('setup');
  const [matchedPairs, setMatchedPairs] = useState(0);

  const { saveOnExit, autoSave } = useGameSave('memory-match');

  // Card symbols for different decks
  const deckSymbols = {
    anime: ['‍', '‍', '‍', '', '', '‍️', '‍️', '‍️', '‍️', '', '', ''],
    gaming: ['', '️', '', '', '', '', '️', '️', '️', '️', '🃝', ''],
    runes: ['', '', '', '️', '', '', '️', '️', '', '◆', '', ''],
  };

  // Initialize game
  const initializeGame = useCallback(() => {
    const symbols = deckSymbols[deck].slice(0, pairs);
    const gameCards: Card[] = [];

    // Create pairs
    symbols.forEach((symbol, index) => {
      gameCards.push(
        { id: index * 2, value: symbol, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, value: symbol, isFlipped: false, isMatched: false },
      );
    });

    // Shuffle cards
    for (let i = gameCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [gameCards[i], gameCards[j]] = [gameCards[j], gameCards[i]];
    }

    setCards(gameCards);
    setFlippedCards([]);
    setMoves(0);
    setScore(0);
    setTimeLeft(timeLimit);
    setMatchedPairs(0);
    setGameState('playing');
  }, [deck, pairs, timeLimit]);

  // Start game
  useEffect(() => {
    if (gameState === 'setup') {
      initializeGame();
    }
  }, [gameState, initializeGame]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Check for matches
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true, isFlipped: true }
                : card,
            ),
          );
          setMatchedPairs((prev) => prev + 1);
          setScore((prev) => prev + 100 + timeLeft * 5); // Bonus for remaining time
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second ? { ...card, isFlipped: false } : card,
            ),
          );
          setFlippedCards([]);
        }, 1000);
      }
      setMoves((prev) => prev + 1);
    }
  }, [flippedCards, cards, timeLeft]);

  // Check win condition
  useEffect(() => {
    if (matchedPairs === pairs && gameState === 'playing') {
      setGameState('won');

      // Calculate final score with bonuses
      const timeBonus = timeLeft * 10;
      const moveBonus = Math.max(0, pairs * 2 - moves) * 50;
      const perfectBonus = moves === pairs ? 500 : 0;
      const finalScore = score + timeBonus + moveBonus + perfectBonus;

      setScore(finalScore);

      // Save game results
      saveOnExit({
        score: finalScore,
        level: pairs,
        progress: 1.0,
        stats: {
          deck,
          pairs,
          moves,
          timeLeft,
          perfectGame: moves === pairs,
          lastPlayed: Date.now(),
        },
      }).catch(console.error);
    }
  }, [matchedPairs, pairs, gameState, timeLeft, moves, score, deck, saveOnExit]);

  // Auto-save progress
  useEffect(() => {
    if (gameState === 'playing' && matchedPairs > 0 && matchedPairs % 3 === 0) {
      autoSave({
        score,
        level: pairs,
        progress: matchedPairs / pairs,
        stats: { deck, moves, timeLeft },
      }).catch(() => {}); // Ignore save errors during gameplay
    }
  }, [matchedPairs, pairs, score, deck, moves, timeLeft, autoSave, gameState]);

  const handleCardClick = (cardId: number) => {
    if (gameState !== 'playing') return;
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isMatched) return;

    setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c)));
    setFlippedCards((prev) => [...prev, cardId]);
  };

  const getGridCols = () => {
    if (pairs <= 6) return 'grid-cols-3'; // 3x4
    if (pairs <= 8) return 'grid-cols-4'; // 4x4
    return 'grid-cols-4'; // 4x6 for 12 pairs
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'won' || gameState === 'lost') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">{gameState === 'won' ? '' : '⏰'}</div>
          <h2 className="text-3xl font-bold mb-4">
            {gameState === 'won' ? 'Victory!' : "Time's Up!"}
          </h2>
          {gameState === 'won' && (
            <div className="space-y-2 mb-6">
              <div className="text-xl">Score: {score.toLocaleString()}</div>
              <div className="text-lg text-gray-300">Moves: {moves}</div>
              <div className="text-lg text-gray-300">Time Left: {formatTime(timeLeft)}</div>
              {moves === pairs && (
                <div className="text-yellow-400 font-bold">Perfect Game Bonus! </div>
              )}
            </div>
          )}
          <div className="space-x-4">
            <button
              onClick={() => setGameState('setup')}
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-xl transition-colors"
            >
              Play Again
            </button>
            <a
              href="/mini-games"
              className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-colors"
            >
              Back to Hub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4 relative">
      {/* Avatar Integration */}
      <GameAvatarIntegration
        gameMode="puzzle"
        performance="balanced"
        showSelector={true}
        position="top-right"
        size="medium"
        interactive={true}
      />

      {/* Game Stats */}
      <div className="flex justify-between items-center mb-4 text-white">
        <div className="flex gap-6">
          <div>Score: {score.toLocaleString()}</div>
          <div>Moves: {moves}</div>
          <div>
            Pairs: {matchedPairs}/{pairs}
          </div>
        </div>
        <div className={`text-lg font-bold ${timeLeft < 30 ? 'text-red-400' : 'text-white'}`}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Card Grid */}
      <div className={`grid ${getGridCols()} gap-3 flex-1 max-h-full place-items-center`}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`
              w-16 h-20 rounded-lg border-2 cursor-pointer transition-all duration-300 flex items-center justify-center text-2xl
              ${
                card.isFlipped || card.isMatched
                  ? 'bg-white border-pink-300 transform rotate-y-180'
                  : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-600 hover:border-pink-500'
              }
              ${card.isMatched ? 'opacity-60' : ''}
            `}
            style={{
              backfaceVisibility: 'hidden',
              transformStyle: 'preserve-3d',
            }}
          >
            {card.isFlipped || card.isMatched ? (
              card.value
            ) : (
              <div className="text-pink-400 text-lg font-bold"></div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(matchedPairs / pairs) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
