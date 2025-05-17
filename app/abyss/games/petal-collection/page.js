'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const PETAL_TYPES = [
  { id: 1, color: '#FF69B4', points: 10, rarity: 'common' },
  { id: 2, color: '#FF1493', points: 20, rarity: 'uncommon' },
  { id: 3, color: '#C71585', points: 50, rarity: 'rare' },
  { id: 4, color: '#FFD700', points: 100, rarity: 'legendary' },
];

export default function PetalCollectionGame() {
  const { data: session } = useSession();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(false);
  const [petals, setPetals] = useState([]);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameAreaRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const spawnPetal = () => {
      const type = PETAL_TYPES[Math.floor(Math.random() * PETAL_TYPES.length)];
      const x = Math.random() * (gameAreaRef.current?.clientWidth || 800);

      setPetals(prev => [
        ...prev,
        {
          id: Date.now(),
          type,
          x,
          y: -50,
          rotation: Math.random() * 360,
        },
      ]);
    };

    const spawnInterval = setInterval(spawnPetal, 1000);
    return () => clearInterval(spawnInterval);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const movePetals = () => {
      setPetals(prev =>
        prev
          .map(petal => ({
            ...petal,
            y: petal.y + 2,
            rotation: petal.rotation + 1,
          }))
          .filter(petal => petal.y < (gameAreaRef.current?.clientHeight || 600))
      );
    };

    const moveInterval = setInterval(movePetals, 16);
    return () => clearInterval(moveInterval);
  }, [isPlaying]);

  const handlePetalClick = petal => {
    setScore(prev => prev + petal.type.points);
    setCombo(prev => prev + 1);
    setPetals(prev => prev.filter(p => p.id !== petal.id));

    // Check for high score
    if (score + petal.type.points > highScore) {
      setHighScore(score + petal.type.points);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    setPetals([]);
    setCombo(0);
    setIsPlaying(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 px-4 py-20">
      <div className="container mx-auto max-w-4xl">
        {/* Game Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-pink-400">Cherry Blossom Collection</h1>
          <p className="text-gray-300">Collect falling petals to earn points and rewards!</p>
        </div>

        {/* Game Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-gray-800/50 p-4 text-center backdrop-blur-lg">
            <h3 className="text-sm text-gray-400">Score</h3>
            <p className="text-2xl font-bold text-pink-400">{score}</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4 text-center backdrop-blur-lg">
            <h3 className="text-sm text-gray-400">Time Left</h3>
            <p className="text-2xl font-bold text-pink-400">{timeLeft}s</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4 text-center backdrop-blur-lg">
            <h3 className="text-sm text-gray-400">Combo</h3>
            <p className="text-2xl font-bold text-pink-400">x{combo}</p>
          </div>
          <div className="rounded-lg bg-gray-800/50 p-4 text-center backdrop-blur-lg">
            <h3 className="text-sm text-gray-400">High Score</h3>
            <p className="text-2xl font-bold text-pink-400">{highScore}</p>
          </div>
        </div>

        {/* Game Area */}
        <div
          ref={gameAreaRef}
          className="relative h-[600px] overflow-hidden rounded-lg bg-gray-800/30 backdrop-blur-lg"
        >
          {!isPlaying ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="rounded-full bg-pink-500 px-8 py-3 text-lg font-semibold text-white hover:bg-pink-600"
              >
                Start Game
              </motion.button>
            </div>
          ) : (
            <AnimatePresence>
              {petals.map(petal => (
                <motion.div
                  key={petal.id}
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: petal.y }}
                  exit={{ opacity: 0, scale: 0 }}
                  style={{
                    position: 'absolute',
                    left: petal.x,
                    transform: `rotate(${petal.rotation}deg)`,
                  }}
                  onClick={() => handlePetalClick(petal)}
                  className="cursor-pointer"
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill={petal.type.color}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  </svg>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Petal Types Legend */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {PETAL_TYPES.map(type => (
            <div
              key={type.id}
              className="flex items-center space-x-3 rounded-lg bg-gray-800/50 p-4 backdrop-blur-lg"
            >
              <div className="h-8 w-8 rounded-full" style={{ backgroundColor: type.color }} />
              <div>
                <h4 className="font-semibold capitalize text-pink-300">{type.rarity}</h4>
                <p className="text-gray-400">{type.points} points</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rewards Info */}
        <div className="mt-8 rounded-lg bg-gray-800/50 p-6 backdrop-blur-lg">
          <h3 className="mb-4 text-xl font-bold text-pink-400">Rewards</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <h4 className="font-semibold text-pink-300">100 Points</h4>
              <p className="text-gray-400">Basic Coupon</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-pink-300">500 Points</h4>
              <p className="text-gray-400">Premium Content Access</p>
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-pink-300">1000 Points</h4>
              <p className="text-gray-400">Exclusive Merchandise</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
