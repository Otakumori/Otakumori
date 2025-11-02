'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

// Physics-based bouncing petal
function BouncingPetal({
  index,
  isBouncing,
  bouncePhase,
}: {
  index: number;
  isBouncing: boolean;
  bouncePhase: number;
}) {
  const delay = index * 0.05;
  const rotation = index * 30;

  return (
    <motion.div
      className="relative"
      animate={{
        y: isBouncing ? [-5, -60 + index * 10, -5] : 0,
        rotate: isBouncing ? [rotation, rotation + 180, rotation + 360] : rotation,
        scale: isBouncing ? [1, 1.3, 1] : 1,
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.34, 1.56, 0.64, 1], // Custom bounce easing
      }}
      style={{
        filter: isBouncing
          ? `drop-shadow(0 0 ${15 + index * 5}px rgba(236, 72, 153, 0.8))`
          : 'none',
      }}
    >
      {/* Petal with gradient */}
      <svg width="40" height="48" viewBox="0 0 40 48" className="drop-shadow-lg">
        <defs>
          <radialGradient id={`petal-gradient-${index}`}>
            <stop offset="0%" stopColor="#ffc0cb" />
            <stop offset="50%" stopColor="#ff69b4" />
            <stop offset="100%" stopColor="#ff1493" />
          </radialGradient>
          <filter id={`glow-${index}`}>
            <feGaussianBlur stdDeviation={isBouncing ? '3' : '1'} result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse
          cx="20"
          cy="24"
          rx="18"
          ry="22"
          fill={`url(#petal-gradient-${index})`}
          filter={`url(#glow-${index})`}
          opacity="0.95"
        />
        {/* Veins */}
        <line x1="20" y1="4" x2="20" y2="44" stroke="#ff1493" strokeWidth="1" opacity="0.3" />
        <path
          d="M 20 14 Q 12 18 10 24"
          stroke="#ff1493"
          strokeWidth="0.5"
          opacity="0.2"
          fill="none"
        />
        <path
          d="M 20 14 Q 28 18 30 24"
          stroke="#ff1493"
          strokeWidth="0.5"
          opacity="0.2"
          fill="none"
        />
      </svg>

      {/* Trail particles */}
      {isBouncing && bouncePhase > 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-pink-400 rounded-full"
              initial={{ scale: 1, opacity: 0.8, x: 0, y: 0 }}
              animate={{
                scale: 0,
                opacity: 0,
                x: (Math.random() - 0.5) * 40,
                y: (Math.random() - 0.5) * 40,
              }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Trampoline platform
function Trampoline({ isPressed }: { isPressed: boolean }) {
  return (
    <div className="relative w-64 h-24">
      {/* Frame */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-700 to-gray-900 rounded-t-lg shadow-2xl border-t-4 border-gray-600">
        {/* Spring coils */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 w-3 bg-gray-400 rounded-sm"
            style={{
              left: `${(i / 7) * 100}%`,
              height: isPressed ? '12px' : '24px',
              transformOrigin: 'bottom',
            }}
            animate={{
              scaleY: isPressed ? 0.5 : 1,
            }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            {/* Coil rings */}
            <div className="absolute inset-0 flex flex-col justify-around">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="h-px bg-gray-600" />
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bouncing surface */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-pink-400 to-pink-600 rounded-lg shadow-lg border-2 border-pink-300"
        animate={{
          y: isPressed ? 10 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 15 }}
        style={{
          boxShadow: isPressed
            ? 'inset 0 4px 8px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(236, 72, 153, 0.4)',
        }}
      >
        {/* Surface pattern */}
        <div className="absolute inset-0 overflow-hidden rounded-lg opacity-30">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-white"
              style={{
                left: 0,
                right: 0,
                top: `${(i / 11) * 100}%`,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function BlossomBounce({ onComplete, _onFail, _duration }: GameProps) {
  const [bounceCount, setBounceCount] = useState(0);
  const [isBouncing, setIsBouncing] = useState(false);
  const [showElements, setShowElements] = useState(false);
  const [bouncePhase, setBouncePhase] = useState(0);
  const [combo, setCombo] = useState(0);
  const lastBounceTime = useRef(0);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowElements(true), 500);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (bounceCount >= 15) {
      setTimeout(() => {
        onComplete(100 + combo * 5, 35); // Bonus petals for combo
      }, 500);
    }
  }, [bounceCount, combo, onComplete]);

  const handleBounce = useCallback(() => {
    if (isBouncing || bounceCount >= 15) return;

    const now = Date.now();
    const timeSinceLastBounce = now - lastBounceTime.current;

    // Combo system: bounce within 600ms
    if (timeSinceLastBounce < 600) {
      setCombo((prev) => prev + 1);
    } else {
      setCombo(0);
    }

    lastBounceTime.current = now;

    setIsBouncing(true);
    setBounceCount((prev) => prev + 1);
    setBouncePhase((prev) => prev + 1);

    setTimeout(() => {
      setIsBouncing(false);
    }, 800);
  }, [isBouncing, bounceCount]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleBounce();
      }
    },
    [handleBounce],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-purple-900 via-pink-900 to-purple-950 overflow-hidden">
      {/* Animated background rays */}
      <div className="absolute inset-0">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 left-1/2 origin-top"
            style={{
              width: '2px',
              height: '100%',
              background: 'linear-gradient(to bottom, rgba(236, 72, 153, 0.2), transparent)',
              transform: `rotate(${(i / 12) * 360}deg)`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>

      {/* Bouncing petals */}
      <AnimatePresence>
        {showElements && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <BouncingPetal key={i} index={i} isBouncing={isBouncing} bouncePhase={bouncePhase} />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Trampoline */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <Trampoline isPressed={isBouncing} />
      </div>

      {/* Progress HUD */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-black/70 backdrop-blur-lg text-white px-4 py-2 rounded-lg border border-pink-500/30">
          <p className="text-sm font-bold">Bounces: {bounceCount}/15</p>
        </div>
        {combo > 0 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-pink-500/80 backdrop-blur-lg text-white px-4 py-2 rounded-lg border border-pink-300"
          >
            <p className="text-sm font-bold">COMBO x{combo + 1}!</p>
          </motion.div>
        )}
      </div>

      {/* Completion effect */}
      <AnimatePresence>
        {bounceCount >= 15 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
          >
            <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white px-8 py-6 rounded-2xl shadow-2xl border-4 border-pink-300">
              <p className="text-4xl font-bold mb-2">PERFECT RHYTHM!</p>
              <p className="text-xl">Petals collected!</p>
              {combo > 5 && (
                <p className="text-sm mt-2 text-pink-200">Combo Bonus: +{combo * 5} Petals!</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center px-4">
        <p className="text-pink-200 text-base font-semibold drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
          {!showElements
            ? 'Spring-loaded challenge...'
            : bounceCount < 15
              ? 'Bounce the petals!'
              : 'Rhythmic perfection achieved!'}
        </p>
        {bounceCount < 15 && showElements && (
          <p className="text-pink-200/70 text-xs mt-1 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
            Press SPACE or CLICK to keep rhythm for combos!
          </p>
        )}
      </div>

      {/* Click area */}
      <button
        className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
        onClick={handleBounce}
        disabled={bounceCount >= 15}
        aria-label="Bounce the cherry blossom petals on the trampoline"
      />
    </div>
  );
}

