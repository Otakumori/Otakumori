'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Petal } from '../../app/types/index';

interface LeaderboardEntry {
  username: string;
  petals: number;
  rank: number;
}

export default function InteractiveCherryBlossom() {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [_communityProgress, _setCommunityProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [_leaderboard, _setLeaderboard] = useState<LeaderboardEntry[]>([
    { username: 'SakuraMaster', petals: 1500, rank: 1 },
    { username: 'PetalWhisperer', petals: 1200, rank: 2 },
    { username: 'BlossomSeeker', petals: 900, rank: 3 },
  ]);

  // Get current season based on date
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  };

  // Get petal color based on season
  const getPetalColor = () => {
    const season = getCurrentSeason();
    switch (season) {
      case 'spring':
        return 'text-pink-300';
      case 'summer':
        return 'text-pink-400';
      case 'autumn':
        return 'text-pink-500';
      case 'winter':
        return 'text-pink-200';
      default:
        return 'text-pink-300';
    }
  };

  useEffect(() => {
    const createPetal = () => {
      const petal: Petal = {
        id: Date.now(),
        x: Math.random() * window.innerWidth,
        y: -20,
        size: Math.random() * 10 + 10,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 2,
        collected: false,
        isSpecial: Math.random() < 0.05, // 5% chance for special petals
      };
      setPetals((prev) => [...prev, petal]);
    };

    const interval = setInterval(createPetal, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePetalClick = (id: number) => {
    setPetals((prev) =>
      prev.map((petal) => (petal.id === id ? { ...petal, collected: true } : petal)),
    );
    setCollectedCount((prev) => prev + 1);
    setShowProgress(true);

    // Play petal collect sound
    const audio = new Audio('/assets/sounds/petal-collect.mp3');
    audio.volume = 0.3;
    audio.play();
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            className="pointer-events-auto absolute cursor-pointer"
            initial={{ x: petal.x, y: petal.y, rotate: 0 }}
            animate={{
              y: window.innerHeight + 100,
              x: petal.x + (Math.random() - 0.5) * 200,
              rotate: 360,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              ease: 'linear',
            }}
            onClick={() => handlePetalClick(petal.id)}
            style={{
              opacity: petal.collected ? 0 : 1,
            }}
          >
            <svg
              width={petal.size}
              height={petal.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`${getPetalColor()} ${petal.isSpecial ? 'animate-pulse' : ''}`}
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="currentColor"
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Progress Bars and Leaderboard */}
      {showProgress && (
        <div className="pointer-events-none fixed bottom-4 left-4 right-4 flex flex-col gap-4">
          {/* Community Progress */}
          <div className="rounded-lg bg-black/50 p-4 backdrop-blur-sm">
            <h3 className="mb-2 text-sm text-white">Community Progress</h3>
            <div className="h-2 w-full rounded-full bg-gray-700">
              <div
                className="h-2 rounded-full bg-pink-500 transition-all duration-500"
                style={{ width: `${communityProgress}%` }}
              />
            </div>
          </div>

          {/* Personal Progress */}
          <div className="rounded-lg bg-black/50 p-4 backdrop-blur-sm">
            <h3 className="mb-2 text-sm text-white">Your Collection</h3>
            <div className="h-2 w-full rounded-full bg-gray-700">
              <div
                className="h-2 rounded-full bg-pink-400 transition-all duration-500"
                style={{ width: `${(collectedCount / 100) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-white">Collected: {collectedCount}</p>
          </div>

          {/* Leaderboard */}
          <div className="rounded-lg bg-black/50 p-4 backdrop-blur-sm">
            <h3 className="mb-2 text-sm text-white">Top Collectors</h3>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className="flex items-center justify-between">
                  <span className="text-sm text-white">{entry.username}</span>
                  <span className="text-sm text-pink-400">{entry.petals} petals</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
