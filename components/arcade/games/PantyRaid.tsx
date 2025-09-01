'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

export default function PantyRaid({ onComplete, onFail, duration }: GameProps) {
  const [pantyPosition, setPantyPosition] = useState({ x: 50, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCaught, setIsCaught] = useState(false);
  const [showPanty, setShowPanty] = useState(false);
  const [crowsApproaching, setCrowsApproaching] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowPanty(true), 500);
    const crowTimer = setTimeout(() => setCrowsApproaching(true), 2000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(crowTimer);
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!showPanty || isCaught) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !gameRef.current) return;

    const rect = gameRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setPantyPosition({ x, y });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Check if panty is in "safe zone" (bottom area)
    if (pantyPosition.y > 70) {
      setIsCaught(true);
      onComplete(100, 25);
    }
  };

  useEffect(() => {
    if (crowsApproaching && !isCaught) {
      const timer = setTimeout(() => {
        onFail();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [crowsApproaching, isCaught, onFail]);

  return (
    <div
      ref={gameRef}
      className="w-full h-full relative bg-gradient-to-br from-blue-400 to-pink-400 cursor-grab"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background - clothesline */}
      <div className="absolute top-8 left-0 right-0 h-1 bg-gray-600" />

      {/* Panty */}
      <AnimatePresence>
        {showPanty && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: isDragging ? 1.2 : 1,
              opacity: 1,
              x: `${pantyPosition.x}%`,
              y: `${pantyPosition.y}%`,
            }}
            className="absolute w-8 h-6 bg-pink-300 rounded-lg border-2 border-pink-400 transform -translate-x-1/2 -translate-y-1/2"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            onMouseDown={handleMouseDown}
          >
            {/* Panty details */}
            <div className="w-full h-full bg-pink-200 rounded-md flex items-center justify-center">
              <div className="text-xs">👙</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crows */}
      <AnimatePresence>
        {crowsApproaching && !isCaught && (
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-4 right-4 flex space-x-2"
          >
            <div className="text-2xl">🐦</div>
            <div className="text-2xl">🐦</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success effect */}
      <AnimatePresence>
        {isCaught && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-green-500/80 text-white px-4 py-2 rounded-lg text-sm">
              Mystic Panty +1
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
        <p className="text-sm opacity-80">
          {!showPanty ? 'Get ready...' : !isCaught ? 'Drag panty to safety!' : 'Denied.'}
        </p>
      </div>
    </div>
  );
}
