'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function SlapTheOni({ onComplete, onFail, _duration }: GameProps) {
  const [oniPosition, setOniPosition] = useState({ x: 50, y: 50 });
  const [isSlapped, setIsSlapped] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show target after a brief delay
    const showTimer = setTimeout(() => setShowTarget(true), 300);

    // Move oni around rapidly for difficulty
    const moveTimer = setInterval(() => {
      if (!isSlapped) {
        setOniPosition({
          x: 15 + Math.random() * 70,
          y: 20 + Math.random() * 60,
        });
      }
    }, 600);

    return () => {
      clearTimeout(showTimer);
      clearInterval(moveTimer);
    };
  }, [isSlapped]);

  const triggerSuccess = useCallback(() => {
    setIsSlapped(true);
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: oniPosition.x,
      y: oniPosition.y,
    }));
    setParticles(newParticles);
    onComplete(100, 20);
  }, [oniPosition, onComplete]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (!showTarget || isSlapped) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        triggerSuccess();
      }
    },
    [isSlapped, showTarget, triggerSuccess],
  );

  const handleSlap = (e: ReactMouseEvent) => {
    if (!showTarget || isSlapped) return;

    // Check if click was near the oni
    const rect = gameRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const distance = Math.sqrt(
      Math.pow(clickX - oniPosition.x, 2) + Math.pow(clickY - oniPosition.y, 2),
    );

    if (distance < 10) {
      triggerSuccess();
    } else {
      onFail();
    }
  };

  return (
    <div
      ref={gameRef}
      className="w-full h-full relative bg-gradient-to-br from-red-950 via-purple-950 to-black cursor-crosshair overflow-hidden"
      onClick={handleSlap}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Click the oni demon when it appears"
    >
      {/* Japanese pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 192, 203, 0.1) 10px,
            rgba(255, 192, 203, 0.1) 20px
          )`,
        }}
      />

      {/* Oni Target - Enhanced with shadow and glow */}
      <AnimatePresence>
        {showTarget && !isSlapped && (
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{
              scale: [1, 1.1, 1],
              rotate: 0,
              opacity: 1,
            }}
            transition={{
              scale: { repeat: Infinity, duration: 0.8 },
              rotate: { duration: 0.3 },
            }}
            exit={{ scale: 2, opacity: 0, rotate: 180 }}
            className="absolute w-24 h-24"
            style={{
              left: `${oniPosition.x}%`,
              top: `${oniPosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-50 animate-pulse" />

            {/* Oni circle */}
            <div className="relative w-full h-full rounded-full border-4 border-red-500 bg-gradient-to-br from-red-600 to-red-900 shadow-2xl flex items-center justify-center">
              <div className="text-5xl animate-bounce">
                <span role="img" aria-label="Oni demon">
                  <span role="img" aria-label="emoji">�</span>�
                </span>
              </div>
            </div>

            {/* Target rings */}
            <div className="absolute inset-0 border-2 border-pink-500 rounded-full animate-ping" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slap particle burst */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{
              scale: 1,
              opacity: 1,
              x: particle.x + '%',
              y: particle.y + '%',
            }}
            animate={{
              scale: 0,
              opacity: 0,
              x: `${particle.x + (Math.random() - 0.5) * 40}%`,
              y: `${particle.y + (Math.random() - 0.5) * 40}%`,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute w-4 h-4 bg-pink-400 rounded-full"
            style={{ transform: 'translate(-50%, -50%)' }}
          />
        ))}
      </AnimatePresence>

      {/* Success flash */}
      <AnimatePresence>
        {isSlapped && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-pink-400 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
        <motion.p
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="text-lg font-bold text-pink-200 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]"
        >
          {!showTarget ? 'GET READY...' : !isSlapped ? 'SLAP THE ONI!' : 'NICE HIT!'}
        </motion.p>
      </div>
    </div>
  );
}
