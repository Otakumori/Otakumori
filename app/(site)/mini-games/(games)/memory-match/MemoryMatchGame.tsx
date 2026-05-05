'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameSave } from '../../_shared/SaveSystem';
import { GameAvatarIntegration } from '../../_shared/GameAvatarIntegration';
import { PhysicsAvatarCanvas, type PhysicsAvatarCanvasRef } from '../../_shared/PhysicsAvatarCanvas';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchGameProps {
  deck?: 'anime' | 'gaming' | 'runes';
  pairs?: number;
  timeLimit?: number; // seconds
  onGameEnd?: (results: { score: number; matches: number; moves: number; timeElapsed: number; didWin: boolean }) => void;
  onStatsUpdate?: (stats: { score: number; combo: number; timer?: number; progress: number }) => void;
}

export default function MemoryMatchGame({ deck = 'anime', pairs = 8, timeLimit = 120, onGameEnd, onStatsUpdate }: MemoryMatchGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'won' | 'lost'>('setup');
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [combo, setCombo] = useState(0);
  const physicsAvatarRef = useRef<PhysicsAvatarCanvasRef>(null);

  const { saveOnExit, autoSave } = useGameSave('memory-match');

  // Card symbols for different decks
  const deckSymbols = {
    anime: ['‍', '‍', '‍', '', '', '‍<span role="img" aria-label="emoji">️</span>', '‍<span role="img" aria-label="emoji">️</span>', '‍<span role="img" aria-label="emoji">️</span>', '‍<span role="img" aria-label="emoji">️</span>', '', '', ''],
    gaming: ['', '<span role="img" aria-label="emoji">️</span>', '', '', '', '', '<span role="img" aria-label="emoji">️</span>', '<span role="img" aria-label="emoji">️</span>', '<span role="img" aria-label="emoji">️</span>', '<span role="img" aria-label="emoji">️</span>', '<span role="img" aria-label="emoji">�</span>�', ''],
    runes: ['', '', '', '<span role="img" aria-label="emoji">️</span>', '', '', '<span role="img" aria-label="emoji">️</span>', '<span role="img" aria-label="emoji">️</span>', '', '◆', '', ''],
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
        // Match found - apply physics impact
        const newCombo = combo + 1;
        setCombo(newCombo);
        const impactForce = {
          x: (Math.random() - 0.5) * 2,
          y: -3 - Math.min(newCombo * 0.5, 2), // Stronger impact for combos
        };
        if (physicsAvatarRef.current) {
          physicsAvatarRef.current.applyImpact(impactForce, 'chest');
        }

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
        // No match - reset combo and apply slight negative impact
        setCombo(0);
        if (physicsAvatarRef.current) {
          physicsAvatarRef.current.applyImpact({ x: 0, y: 1 }, 'chest');
        }
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

  // Update stats via callback
  useEffect(() => {
    if (gameState === 'playing' && onStatsUpdate) {
      const progress = matchedPairs / pairs;
      const timeElapsed = timeLimit - timeLeft;
      onStatsUpdate({
        score,
        combo,
        timer: timeLeft,
        progress,
      });
    }
  }, [gameState, score, combo, timeLeft, matchedPairs, pairs, timeLimit, onStatsUpdate]);

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

      // Notify parent component
      if (onGameEnd) {
        const timeElapsed = timeLimit - timeLeft;
        onGameEnd({
          score: finalScore,
          matches: matchedPairs,
          moves,
          timeElapsed,
          didWin: true,
        });
      }

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
    
    if (gameState === 'lost' && onGameEnd) {
      const timeElapsed = timeLimit - timeLeft;
      onGameEnd({
        score,
        matches: matchedPairs,
        moves,
        timeElapsed,
        didWin: false,
      });
    }
  }, [matchedPairs, pairs, gameState, timeLeft, moves, score, deck, saveOnExit, onGameEnd, timeLimit]);

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

  // Results screen removed - handled by GameStateMachine wrapper
  if (gameState === 'won' || gameState === 'lost') {
    return null;
  }

  return (
    <div className="h-full flex flex-col p-4 relative">
      {/* Physics Avatar Integration */}
      <div className="absolute top-4 right-4 z-10">
        <PhysicsAvatarCanvas
          ref={physicsAvatarRef}
          characterType="player"
          quality="high"
          width={120}
          height={160}
          className="rounded-lg"
        />
      </div>
      {/* Fallback Avatar Integration */}
      <div className="absolute top-4 left-4 z-10 opacity-0 pointer-events-none">
        <GameAvatarIntegration gameId="memory-match" gameMode="puzzle" position={[0, 0, 0]} />
      </div>

      {/* Card Grid */}
      <div className={`grid ${getGridCols()} gap-3 flex-1 max-h-full place-items-center`}>
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(card.id)}
            role="button"
            tabIndex={0}
            aria-label={`Flip card ${card.id}`}
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
    </div>
  );
}
