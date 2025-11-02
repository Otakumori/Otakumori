'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

// JoJo-style action lines/speed lines
function ActionLines({ intensity }: { intensity: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: Math.floor(intensity * 20) }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1 bg-white"
          style={{
            width: `${50 + Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            left: '100%',
            transformOrigin: 'left',
            opacity: 0.7,
          }}
          initial={{ x: 0, scaleX: 0 }}
          animate={{ x: '-150%', scaleX: 1 }}
          transition={{ duration: 0.3 + Math.random() * 0.2, delay: i * 0.02 }}
        />
      ))}
    </div>
  );
}

// "Menacing" katakana effect
function MenacingText() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-4xl font-bold text-purple-500" aria-hidden="true"
          style={{
            left: `${10 + (i % 4) * 25}%`,
            top: `${10 + Math.floor(i / 4) * 40}%`,
            textShadow: '0 0 10px rgba(139, 0, 139, 0.8)',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1.2, 1.2, 1.5],
            rotate: [(i % 2) * 15, -(i % 2) * 15],
          }}
          transition={{ duration: 2, delay: i * 0.15, repeat: Infinity }}
        >
          ゴ
        </motion.div>
      ))}
    </div>
  );
}

// Character with dynamic poses
export default function JoJoThrust({ onComplete, _onFail, _duration }: GameProps) {
  const [thrustCount, setThrustCount] = useState(0);
  const [currentPose, setCurrentPose] = useState(0);
  const [isThrusting, setIsThrusting] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);
  const [actionIntensity, setActionIntensity] = useState(0);

  // JoJo-style poses
  const poses = [
    { emoji: 'ORA!', label: 'ORA!' },
    { emoji: 'MUDA!', label: 'MUDA!' },
    { emoji: 'STAR', label: 'STAR PLATINUM!' },
    { emoji: 'WORLD', label: 'THE WORLD!' },
    { emoji: 'MENACE', label: 'MENACING' },
  ];

  const fallbackPose = poses[0] ?? { emoji: 'ORA!', label: 'Sparkle' };
  const activePose = poses[currentPose] ?? fallbackPose;

  useEffect(() => {
    const showTimer = setTimeout(() => setShowCharacter(true), 500);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (thrustCount >= 20) {
      setTimeout(() => {
        onComplete(100, 30);
      }, 800);
    }
  }, [thrustCount, onComplete]);

  const handleThrust = useCallback(() => {
    if (isThrusting || thrustCount >= 20) return;

    setIsThrusting(true);
    setThrustCount((prev) => prev + 1);
    setCurrentPose((prev) => (prev + 1) % 5);
    setActionIntensity(1);

    setTimeout(() => {
      setIsThrusting(false);
      setActionIntensity(0);
    }, 400);
  }, [isThrusting, thrustCount]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
        handleThrust();
      }
    },
    [handleThrust],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-purple-950 via-black to-yellow-950 overflow-hidden">
      {/* Menacing atmosphere */}
      {showCharacter && thrustCount < 20 && <MenacingText />}

      {/* Action lines */}
      {actionIntensity > 0 && <ActionLines intensity={actionIntensity} />}

      {/* Character */}
      <AnimatePresence>
        {showCharacter && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotateY: 90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-8xl">
              <span role="img" aria-label={activePose.label}>
                {activePose.emoji}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress HUD */}
      <div className="absolute top-4 right-4">
        <div className="bg-black/80 backdrop-blur-lg text-white px-6 py-3 rounded-lg border-2 border-yellow-500 shadow-2xl">
          <p className="text-2xl font-black text-yellow-300 drop-shadow-lg">
            ORA! x {thrustCount}/20
          </p>
        </div>
      </div>

      {/* Completion screen */}
      <AnimatePresence>
        {thrustCount >= 20 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-20"
          >
            <div className="text-center">
              <motion.p
                className="text-8xl font-black text-yellow-300 mb-4"
                style={{ WebkitTextStroke: '4px purple' } as CSSProperties}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                YARE YARE DAZE
              </motion.p>
              <p className="text-3xl text-purple-400 font-bold">Stand Battle Won!</p>

              {/* Victory stars */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-5xl" aria-hidden="true"
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i / 12) * Math.PI * 2) * 200,
                    y: Math.sin((i / 12) * Math.PI * 2) * 200,
                  }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                >
                  ★
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center px-4">
        <p
          className="text-yellow-300 text-base font-black drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"
          style={{ WebkitTextStroke: '1px purple' } as CSSProperties}
        >
          {!showCharacter
            ? 'Menacing presence builds...'
            : thrustCount < 20
              ? 'Unleash your stand!'
              : 'Victory achieved!'}
        </p>
        {thrustCount < 20 && showCharacter && (
          <p className="text-yellow-200 text-xs mt-1 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
            Arrow Keys or SPACE to pose - 20 poses to win!
          </p>
        )}
      </div>

      {/* Click area */}
      <button
        className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
        onClick={handleThrust}
        disabled={thrustCount >= 20}
        aria-label="Strike JoJo poses to unleash your Stand power"
      />
    </div>
  );
}


