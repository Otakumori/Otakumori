'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

// Retro game cartridge (SNES-style)
function RetroCartridge({ cleanliness }: { cleanliness: number }) {
  const dustOpacity = Math.max(0, (100 - cleanliness) / 100);

  return (
    <div className="relative w-48 h-64">
      {/* Cartridge body */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-400 to-gray-600 rounded-lg shadow-2xl border-4 border-gray-700">
        {/* Label area */}
        <div className="absolute top-4 left-4 right-4 h-32 bg-gradient-to-br from-purple-600 to-pink-600 rounded border-2 border-purple-800 overflow-hidden">
          {/* Game title */}
          <div className="absolute inset-0 flex items-center justify-center">
            <p
              className="text-white font-bold text-xl drop-shadow-lg"
              style={{ fontFamily: 'monospace' }}
            >
              OTAKU
              <br />
              MORI
            </p>
          </div>

          {/* Wear pattern */}
          <div
            className="absolute inset-0 mix-blend-overlay opacity-30"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.1) 2px,
                rgba(255,255,255,0.1) 4px
              )`,
            }}
          />

          {/* Dust overlay */}
          <div
            className="absolute inset-0 bg-yellow-900/60"
            style={{
              opacity: dustOpacity,
              mixBlendMode: 'multiply',
            }}
          />
        </div>

        {/* Connector pins */}
        <div className="absolute bottom-2 left-4 right-4 h-12 bg-gray-800 rounded">
          <div className="absolute inset-0 flex gap-1 p-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-sm"
                style={{
                  boxShadow: `inset 0 1px 2px rgba(0,0,0,0.3), 0 0 ${dustOpacity * 3}px rgba(255, 200, 0, ${dustOpacity})`,
                }}
              />
            ))}
          </div>

          {/* Dust on pins */}
          {dustOpacity > 0 && (
            <div className="absolute inset-0 bg-yellow-700/40" style={{ opacity: dustOpacity }} />
          )}
        </div>

        {/* Dust particles */}
        {Array.from({ length: Math.floor(dustOpacity * 10) }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-600 rounded-full opacity-60"
            style={{
              left: `${10 + ((i * 7) % 80)}%`,
              top: `${20 + ((i * 13) % 70)}%`,
            }}
          />
        ))}

        {/* Cartridge ridge/grip */}
        <div className="absolute bottom-16 left-0 right-0 h-4 bg-gray-600 border-t-2 border-b-2 border-gray-700">
          <div className="absolute inset-0 flex justify-around items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-1 h-2 bg-gray-700" />
            ))}
          </div>
        </div>
      </div>

      {/* Shine when clean */}
      {cleanliness > 80 && (
        <motion.div
          className="absolute top-6 left-6 w-16 h-24 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-sm pointer-events-none"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}
    </div>
  );
}

// Breath/wind particles
function BreathParticles({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-200 rounded-full"
          initial={{
            x: 0,
            y: 0,
            scale: 1,
            opacity: 0.8,
          }}
          animate={{
            x: 150 + Math.random() * 50,
            y: (Math.random() - 0.5) * 100,
            scale: [1, 1.5, 0],
            opacity: [0.8, 0.4, 0],
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.03,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

export default function BlowTheCartridge({ onComplete, _onFail, _duration }: GameProps) {
  const [isBlowing, setIsBlowing] = useState(false);
  const [showCartridge, setShowCartridge] = useState(false);
  const [cleanliness, setCleanliness] = useState(0);
  const [dustRemoved, setDustRemoved] = useState(0);
  const breathPhase = useRef(0);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowCartridge(true), 500);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (cleanliness >= 100) {
      setTimeout(() => {
        onComplete(100, 22);
      }, 800);
    }
  }, [cleanliness, onComplete]);

  const handleBlow = useCallback(() => {
    if (isBlowing || cleanliness >= 100) return;

    setIsBlowing(true);
    breathPhase.current += 1;

    // Each blow removes 20% dust
    const removed = 20;
    setDustRemoved(removed);
    setCleanliness((prev) => Math.min(prev + removed, 100));

    setTimeout(() => {
      setIsBlowing(false);
    }, 600);
  }, [isBlowing, cleanliness]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleBlow();
      }
    },
    [handleBlow],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-gray-800 via-gray-900 to-black overflow-hidden">
      {/* Retro CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)',
        }}
      />

      {/* Cartridge */}
      <AnimatePresence>
        {showCartridge && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotateY: -90 }}
            animate={{
              scale: isBlowing ? 1.02 : 1,
              opacity: 1,
              rotateY: 0,
            }}
            transition={{
              scale: { type: 'spring', stiffness: 300, damping: 20 },
              rotateY: { duration: 0.8 },
            }}
            className="absolute top-1/2 right-1/4 transform -translate-y-1/2"
            style={{ perspective: '1000px' }}
          >
            <RetroCartridge cleanliness={cleanliness} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breath effect */}
      <BreathParticles active={isBlowing} />

      {/* Dust removal feedback */}
      <AnimatePresence>
        {isBlowing && dustRemoved > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: -30 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/3 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-yellow-500/80 backdrop-blur-lg text-white px-4 py-2 rounded-lg font-bold shadow-lg">
              -{dustRemoved}% DUST!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cleanliness HUD */}
      <div className="absolute top-4 left-4 right-4 max-w-md">
        <div className="bg-black/80 backdrop-blur-lg rounded-lg p-4 border border-gray-700 shadow-2xl">
          <div className="flex justify-between text-white text-sm mb-2 font-mono">
            <span>CLEANLINESS</span>
            <span className="text-blue-400">{cleanliness}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 border-2 border-gray-600 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 h-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${cleanliness}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Animated shine */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Completion screen */}
      <AnimatePresence>
        {cleanliness >= 100 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <div className="bg-gradient-to-br from-green-600 to-blue-600 text-white px-8 py-6 rounded-2xl shadow-2xl border-4 border-green-400">
              <p className="text-4xl font-bold mb-2 font-mono">CLEAN!</p>
              <p className="text-xl">🎮 READY TO PLAY 🎮</p>
              <motion.div
                className="mt-4 text-sm opacity-70"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                *satisfying beep sound*
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center px-4">
        <p className="text-gray-300 text-base font-semibold drop-shadow-[0_0_8px_rgba(0,0,0,0.8)] font-mono">
          {!showCartridge
            ? 'LOADING CARTRIDGE...'
            : cleanliness < 100
              ? '💨 BLOW ON THE PINS! 💨'
              : 'CARTRIDGE READY'}
        </p>
        {cleanliness < 100 && showCartridge && (
          <p className="text-gray-400 text-xs mt-1 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
            Press SPACE or CLICK to blow • {5 - Math.floor(cleanliness / 20)} blows remaining
          </p>
        )}
      </div>

      {/* Click area */}
      <button
        className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
        onClick={handleBlow}
        disabled={cleanliness >= 100}
        aria-label="Blow on the game cartridge to clean the connector pins"
      />
    </div>
  );
}
