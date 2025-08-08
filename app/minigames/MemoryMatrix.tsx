'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAchievements } from '@/lib/hooks/useAchievements';
import Image from 'next/image';

interface Card {
  id: number;
  value: string;
  imageSrc: string;
  isFlipped: boolean;
  isMatched: boolean;
  isWhispering: boolean;
}

interface Whisper {
  id: number;
  message: string;
  cardId: number;
}

// Use real images instead of emojis
const CARD_IMAGES = [
  '/assets/images/cherryblossom.jpg',
  '/assets/images/gamecubelogo.png',
  '/assets/images/circlelogo.png',
  '/assets/images/logo.png',
  '/assets/images/background.PNG',
  '/assets/images/cherry.jpg',
  '/assets/images/tier-1-fallen-leaf.png',
  '/assets/images/tier-2-budding-warden.png',
];

const WHISPER_MESSAGES = [
  'Psst... I know where the other one is!',
  'The answer lies in the shadows...',
  'Look closer, mortal...',
  'Time is running out...',
  'The secrets of Otaku-mori await...',
  'NSFW content detected...',
  'Your waifu is watching...',
  'The matrix glitches for those who seek...',
];

export default function MemoryMatrix() {
  const { unlockAchievement } = useAchievements();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const [combo, setCombo] = useState(0);

  // Initialize game
  const initializeGame = useCallback(() => {
    const shuffledCards = [...CARD_IMAGES, ...CARD_IMAGES]
      .sort(() => Math.random() - 0.5)
      .map((imageSrc, index) => ({
        id: index,
        value: imageSrc.split('/').pop()?.split('.')[0] || 'card',
        imageSrc,
        isFlipped: false,
        isMatched: false,
        isWhispering: Math.random() < 0.3, // 30% chance to whisper
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeLeft(120);
    setScore(0);
    setCombo(0);
    setWhispers([]);
    setIsGameActive(true);
    setIsGameOver(false);
  }, []);

  // Game timer
  useEffect(() => {
    if (!isGameActive || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameOver(true);
          setIsGameActive(false);
          if (matchedPairs >= 6) unlockAchievement('memory_matrix_survivor');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameActive, isGameOver, matchedPairs, unlockAchievement]);

  // Handle card flip
  const handleCardFlip = useCallback(
    (cardId: number) => {
      if (!isGameActive || isGameOver) return;

      const card = cards.find(c => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;

      // Add whisper effect for whispering cards
      if (card.isWhispering) {
        const whisperMessage =
          WHISPER_MESSAGES[Math.floor(Math.random() * WHISPER_MESSAGES.length)];
        const newWhisper: Whisper = {
          id: Date.now(),
          message: whisperMessage,
          cardId,
        };
        setWhispers(prev => [...prev, newWhisper]);

        // Remove whisper after 3 seconds
        setTimeout(() => {
          setWhispers(prev => prev.filter(w => w.id !== newWhisper.id));
        }, 3000);
      }

      const newFlippedCards = [...flippedCards, cardId];
      setFlippedCards(newFlippedCards);

      // Flip the card
      setCards(prev => prev.map(c => (c.id === cardId ? { ...c, isFlipped: true } : c)));

      // Check for match if two cards are flipped
      if (newFlippedCards.length === 2) {
        setMoves(prev => prev + 1);

        const [firstId, secondId] = newFlippedCards;
        const firstCard = cards.find(c => c.id === firstId);
        const secondCard = cards.find(c => c.id === secondId);

        if (firstCard && secondCard && firstCard.imageSrc === secondCard.imageSrc) {
          // Match found!
          setMatchedPairs(prev => prev + 1);
          setCombo(prev => prev + 1);
          setScore(prev => prev + 100 + combo * 50);

          // Mark cards as matched
          setCards(prev =>
            prev.map(c => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c))
          );

          // Check for achievements
          if (matchedPairs + 1 >= 8) {
            unlockAchievement('memory_matrix_master');
            setIsGameOver(true);
            setIsGameActive(false);
          }
          if (combo + 1 >= 3) unlockAchievement('memory_matrix_combo');
          if (score + 100 + combo * 50 >= 1000) unlockAchievement('memory_matrix_scorer');

          setFlippedCards([]);
        } else {
          // No match, flip cards back after delay
          setTimeout(() => {
            setCards(prev =>
              prev.map(c =>
                c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
              )
            );
            setFlippedCards([]);
            setCombo(0);
          }, 1000);
        }
      }
    },
    [cards, flippedCards, isGameActive, isGameOver, matchedPairs, combo, score, unlockAchievement]
  );

  // Auto-start game
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const restartGame = () => {
    initializeGame();
  };

  return (
    <div
      style={{
        background: '#181818',
        minHeight: '100vh',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* GameCube-style header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '24px',
          border: '2px solid #F59E0B',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: '#F59E0B',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#000',
            }}
          >
            GC
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Memory Matrix</h1>
          <div
            style={{
              fontSize: '12px',
              color: '#F59E0B',
              fontFamily: 'monospace',
            }}
          >
            GAME CUBE
          </div>
        </div>
      </div>

      <p style={{ fontSize: 18, marginBottom: 32, textAlign: 'center' }}>
        Match the cards before time runs out! Some cards whisper secrets...
      </p>

      {/* Game Stats */}
      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: 'bold',
          background: 'rgba(139, 92, 246, 0.1)',
          padding: '12px 20px',
          borderRadius: '8px',
          border: '1px solid #8B5CF6',
        }}
      >
        <div>Time: {formatTime(timeLeft)}</div>
        <div>Score: {score}</div>
        <div>Moves: {moves}</div>
        <div>Matches: {matchedPairs}/8</div>
        <div>Combo: {combo}</div>
      </div>

      {/* Game Board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '10px',
          marginBottom: '20px',
          position: 'relative',
          background: 'rgba(139, 92, 246, 0.05)',
          padding: '20px',
          borderRadius: '12px',
          border: '2px solid #8B5CF6',
        }}
      >
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardFlip(card.id)}
            style={{
              width: '80px',
              height: '80px',
              border: '2px solid #8B5CF6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: card.isMatched ? 'default' : 'pointer',
              background:
                card.isFlipped || card.isMatched
                  ? 'linear-gradient(135deg, #8B5CF6, #3B82F6)'
                  : '#333',
              transition: 'all 0.3s ease',
              transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {card.isFlipped || card.isMatched ? (
              <Image
                src={card.imageSrc}
                alt={card.value}
                width={60}
                height={60}
                style={{
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
            ) : (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #6B7280, #4B5563)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: '#9CA3AF',
                }}
              >
                ?
              </div>
            )}
            {card.isWhispering && !card.isMatched && (
              <div
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '10px',
                  height: '10px',
                  background: '#F59E0B',
                  borderRadius: '50%',
                  animation: 'pulse 1s infinite',
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Whisper Messages */}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          maxWidth: '300px',
        }}
      >
        {whispers.map(whisper => (
          <div
            key={whisper.id}
            style={{
              background: 'rgba(139, 92, 246, 0.9)',
              color: '#fff',
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '8px',
              fontSize: '14px',
              animation: 'slideIn 0.3s ease',
              border: '1px solid #F59E0B',
            }}
          >
            💬 {whisper.message}
          </div>
        ))}
      </div>

      {/* Game Over Screen */}
      {isGameOver && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#333',
              padding: '40px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '2px solid #8B5CF6',
            }}
          >
            <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>
              {matchedPairs >= 8 ? '🎉 Victory! 🎉' : "⏰ Time's Up! ⏰"}
            </h2>
            <p style={{ fontSize: '18px', marginBottom: '20px' }}>Final Score: {score}</p>
            <p style={{ fontSize: '16px', marginBottom: '30px' }}>
              Matches: {matchedPairs}/8 | Moves: {moves}
            </p>
            <button
              onClick={restartGame}
              style={{
                fontSize: '18px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginRight: '10px',
                fontWeight: 'bold',
              }}
            >
              Play Again
            </button>
            <button
              onClick={() => window.history.back()}
              style={{
                fontSize: '18px',
                padding: '12px 24px',
                background: '#6B7280',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Back to Menu
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <button
          onClick={restartGame}
          style={{
            fontSize: '16px',
            padding: '10px 20px',
            background: '#10B981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Restart Game
        </button>

        <button
          onClick={() => window.history.back()}
          style={{
            fontSize: '16px',
            padding: '10px 20px',
            background: '#6B7280',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Back to Menu
        </button>
      </div>

      {/* Instructions */}
      <div style={{ fontSize: '14px', textAlign: 'center', maxWidth: '600px' }}>
        <p>
          <strong>How to play:</strong>
        </p>
        <p>• Click cards to flip them and find matching pairs</p>
        <p>• Complete all 8 matches before time runs out</p>
        <p>• Cards with golden dots whisper helpful hints</p>
        <p>• Build combos for bonus points!</p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
