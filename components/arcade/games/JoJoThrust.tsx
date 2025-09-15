'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function JoJoThrust({ onComplete, _onFail, _duration }: GameProps) {
  const [thrustCount, setThrustCount] = useState(0);
  const [currentPose, setCurrentPose] = useState(0);
  const [isThrusting, setIsThrusting] = useState(false);
  const [showCharacter, setShowCharacter] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const poses = [
    { emoji: '💪', label: 'Muscle flex' },
    { emoji: '🔥', label: 'Fire' },
    { emoji: '⚡', label: 'Lightning' },
    { emoji: '🌟', label: 'Star' },
    { emoji: '💥', label: 'Explosion' },
  ];

  useEffect(() => {
    const showTimer = setTimeout(() => setShowCharacter(true), 300);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (thrustCount >= 20) {
      onComplete(100, 30);
    }
  }, [thrustCount, onComplete]);

  const handleThrust = () => {
    if (isThrusting) return;

    setIsThrusting(true);
    setThrustCount((prev) => prev + 1);
    setCurrentPose((prev) => (prev + 1) % poses.length);
    setZoomLevel(1.5);

    setTimeout(() => {
      setIsThrusting(false);
      setZoomLevel(1);
    }, 300);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (
      e.code === 'ArrowUp' ||
      e.code === 'ArrowDown' ||
      e.code === 'ArrowLeft' ||
      e.code === 'ArrowRight'
    ) {
      e.preventDefault();
      handleThrust();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-yellow-400 to-orange-500">
      {/* Background */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Character */}
      <AnimatePresence>
        {showCharacter && (
          <motion.div
            animate={{
              scale: zoomLevel,
              rotate: isThrusting ? 5 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-8xl">
              <span role="img" aria-label={poses[currentPose].label}>
                {poses[currentPose].emoji}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Thrust effect */}
      <AnimatePresence>
        {isThrusting && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="text-6xl">
              <span role="img" aria-label="Explosion effect">
                💥
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-2 rounded-lg">
        <p className="text-sm">Thrusts: {thrustCount}/20</p>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-80">
          {!showCharacter
            ? 'Get ready...'
            : thrustCount < 20
              ? 'THRUST! (Arrow keys)'
              : 'Yare Yare'}
        </p>
      </div>

      {/* Click area */}
      <button
        className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
        onClick={handleThrust}
        aria-label="Thrust with arrow keys or click"
      />
    </div>
  );
}
