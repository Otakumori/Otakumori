/**
 * Memory Match - Complete Implementation
 * "Recall the faces bound by fate."
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed' | 'paused'>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [streak, setStreak] = useState(0);
  const [finalScore, setFinalScore] = useState(0);

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

    setGameState('playing');
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
    setGameState('completed');

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

  // Handle card flip
  const handleCardFlip = useCallback(
    (cardId: number) => {
      if (gameState !== 'playing') return;
      if (flippedCards.length >= 2) return;
      if (flippedCards.includes(cardId)) return;
      if (cards[cardId].isMatched) return;

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
              console.log(`Match count: ${newMatches} / ${settings.pairs}`);
              
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
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-400 mb-2">Memory Match</h1>
          <p className="text-slate-300 italic">"Recall the faces bound by fate."</p>
        </div>

        {/* Game Menu */}
        {gameState === 'menu' && (
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
                onClick={initializeGame}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-400 hover:to-purple-500 transition-all"
              >
                Start Game
              </button>
            </div>
          </motion.div>
        )}

        {/* Game UI */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <>
            {/* Stats Bar */}
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-4 mb-6 border border-slate-700">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <div className="text-slate-400 text-sm">Time</div>
                  <div className="text-white font-semibold">{formatTime(timeElapsed)}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Moves</div>
                  <div className="text-white font-semibold">{moves}</div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Matches</div>
                  <div className="text-white font-semibold">
                    {matches}/{settings.pairs}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-sm">Streak</div>
                  <div className="text-pink-400 font-semibold">{streak}</div>
                </div>
                <div>
                  <button
                    onClick={togglePause}
                    className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-all"
                  >
                    {gameState === 'playing' ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
            </div>

            {/* Pause Overlay */}
            {gameState === 'paused' && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-slate-800 rounded-2xl p-8 text-center"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">Game Paused</h3>
                  <div className="space-x-4">
                    <button
                      onClick={togglePause}
                      className="bg-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-pink-400 transition-all"
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => setGameState('menu')}
                      className="bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-600 transition-all"
                    >
                      Main Menu
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

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

        {/* Completion Screen */}
        {gameState === 'completed' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700 text-center"
          >
            <h2 className="text-3xl font-bold text-pink-400 mb-4"> Memory Master!</h2>
            <p className="text-slate-300 mb-6">
              "I didn't lose. Just ran out of health." – Edward Elric
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Final Score</div>
                <div className="text-white font-bold text-xl">{finalScore}</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Time</div>
                <div className="text-white font-bold text-xl">{formatTime(timeElapsed)}</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Moves</div>
                <div className="text-white font-bold text-xl">{moves}</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Accuracy</div>
                <div className="text-white font-bold text-xl">
                  {Math.round((matches / Math.max(moves, 1)) * 100)}%
                </div>
              </div>
            </div>
            
            <p className="text-pink-200 text-lg mb-6">
              <span role="img" aria-label="Cherry blossom petal">🌸</span> Petals Earned: <span className="font-bold">{Math.floor(finalScore / 10)}</span>
            </p>

            <div className="space-x-4">
              <button
                onClick={initializeGame}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-400 hover:to-purple-500 transition-all"
              >
                Play Again
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-600 transition-all"
              >
                Main Menu
              </button>
            </div>
          </motion.div>
        )}
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
