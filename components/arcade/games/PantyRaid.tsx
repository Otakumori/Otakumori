'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

// Procedural pixel art component for panty
function PixelPanty({ isDragging }: { isDragging: boolean }) {
  return (
    <div className="relative w-16 h-12 pixelated">
      {/* Main body - using CSS box-shadow for pixel art effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #ffc0cb 0%, #ffb6c1 50%, #ff69b4 100%)',
          boxShadow: isDragging
            ? `
            0 0 0 2px #ff1493,
            0 0 10px rgba(255, 20, 147, 0.5),
            inset 0 0 8px rgba(255, 255, 255, 0.3)
          `
            : `
            0 2px 4px rgba(0, 0, 0, 0.2),
            inset 0 0 4px rgba(255, 255, 255, 0.2)
          `,
          clipPath: 'polygon(20% 0%, 80% 0%, 100% 40%, 100% 100%, 0% 100%, 0% 40%)',
          imageRendering: 'pixelated',
        }}
      >
        {/* Lace pattern - procedural dots */}
        <div className="absolute top-1 left-2 right-2 flex justify-between">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-white/40 rounded-full"
              style={{ imageRendering: 'pixelated' }}
            />
          ))}
        </div>
        {/* Bow */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-3 h-3 bg-pink-300 rotate-45" style={{ imageRendering: 'pixelated' }} />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-pink-500"
            style={{ imageRendering: 'pixelated' }}
          />
        </div>
      </div>
    </div>
  );
}

// Procedural pixel art crow
function PixelCrow({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ x: -100, y: 0 }}
      animate={{
        x: 0,
        y: [0, -5, 0, -5, 0],
      }}
      transition={{
        x: { duration: 0.8, delay },
        y: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' },
      }}
      className="relative w-12 h-12"
    >
      {/* Crow body - pixel blocks */}
      <div
        className="absolute top-4 left-2 w-8 h-6 bg-gradient-to-br from-gray-900 to-black rounded-sm"
        style={{
          imageRendering: 'pixelated',
          boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
        }}
      />
      {/* Head */}
      <div
        className="absolute top-2 left-5 w-4 h-4 bg-gray-900 rounded-full"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Eye */}
        <div className="absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full" />
      </div>
      {/* Beak */}
      <div
        className="absolute top-3 left-8 w-2 h-1 bg-orange-500"
        style={{ imageRendering: 'pixelated', clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}
      />
      {/* Wings - animated */}
      <motion.div
        animate={{ rotate: [0, -15, 0, 15, 0] }}
        transition={{ duration: 0.4, repeat: Infinity }}
        className="absolute top-5 left-1 w-6 h-3 bg-gray-800 rounded-l-full"
        style={{ imageRendering: 'pixelated', transformOrigin: 'right center' }}
      />
    </motion.div>
  );
}

// Clothesline with pins
function Clothesline() {
  return (
    <div className="absolute top-12 left-0 right-0">
      {/* Line */}
      <div className="relative h-1 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 shadow-md">
        {/* Clothespins */}
        {[20, 40, 60, 80].map((pos, i) => (
          <div
            key={i}
            className="absolute top-0 w-2 h-4 bg-yellow-700 rounded-sm"
            style={{
              left: `${pos}%`,
              transform: 'translateX(-50%)',
              boxShadow: '0 2px 2px rgba(0,0,0,0.3)',
              imageRendering: 'pixelated',
            }}
          >
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-yellow-900" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PantyRaid({ onComplete, onFail, _duration }: GameProps) {
  const [pantyPosition, setPantyPosition] = useState({ x: 50, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isCaught, setIsCaught] = useState(false);
  const [showPanty, setShowPanty] = useState(false);
  const [crowsApproaching, setCrowsApproaching] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startTimer = setTimeout(() => setGameStarted(true), 300);
    const showTimer = setTimeout(() => setShowPanty(true), 800);
    const crowTimer = setTimeout(() => setCrowsApproaching(true), 2500);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(showTimer);
      clearTimeout(crowTimer);
    };
  }, []);

  const handleMouseDown = useCallback(
    (_e: React.MouseEvent) => {
      if (!showPanty || isCaught) return;
      setIsDragging(true);
    },
    [showPanty, isCaught],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !gameRef.current) return;

      const rect = gameRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

      setPantyPosition({ x, y });

      // Check if reached basket (bottom-center area)
      if (y > 75 && x > 35 && x < 65) {
        setIsDragging(false);
        setIsCaught(true);
        onComplete(100, 25);
      }
    },
    [isDragging, onComplete],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (crowsApproaching && !isCaught) {
      const timer = setTimeout(() => {
        onFail();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [crowsApproaching, isCaught, onFail]);

  return (
    <div
      ref={gameRef}
      className="w-full h-full relative bg-gradient-to-b from-sky-300 via-sky-200 to-green-100 cursor-grab overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      role="application"
      aria-label="Drag the panty to the basket before crows arrive"
    >
      {/* Sun */}
      <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-300 rounded-full shadow-lg">
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-yellow-100 to-yellow-300" />
      </div>

      {/* Clouds - procedural */}
      {[
        { left: '10%', top: '15%', size: 'w-20 h-10' },
        { left: '60%', top: '10%', size: 'w-24 h-12' },
        { left: '80%', top: '25%', size: 'w-16 h-8' },
      ].map((cloud, i) => (
        <motion.div
          key={i}
          className={`absolute ${cloud.size}`}
          style={{ left: cloud.left, top: cloud.top }}
          animate={{ x: [0, 10, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="absolute left-0 bottom-0 w-6 h-6 bg-white rounded-full" />
          <div className="absolute left-4 bottom-0 w-8 h-8 bg-white rounded-full" />
          <div className="absolute right-0 bottom-0 w-6 h-6 bg-white rounded-full" />
        </motion.div>
      ))}

      {/* Clothesline */}
      {gameStarted && <Clothesline />}

      {/* Target basket */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-16">
        <div
          className="w-full h-full bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-b-lg"
          style={{
            clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          {/* Basket weave pattern */}
          <div className="absolute inset-0 opacity-30">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-0.5 bg-yellow-900"
                style={{ top: `${i * 25}%` }}
              />
            ))}
          </div>
        </div>
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs text-white font-bold drop-shadow-lg">
          DROP HERE
        </div>
      </div>

      {/* Panty */}
      <AnimatePresence>
        {showPanty && !isCaught && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -180 }}
            animate={{
              scale: isDragging ? 1.2 : 1,
              opacity: 1,
              rotate: isDragging ? 15 : 0,
              left: `${pantyPosition.x}%`,
              top: `${pantyPosition.y}%`,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              filter: isDragging ? 'drop-shadow(0 0 8px rgba(255, 20, 147, 0.8))' : 'none',
            }}
            onMouseDown={handleMouseDown}
          >
            <PixelPanty isDragging={isDragging} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Crows */}
      <AnimatePresence>
        {crowsApproaching && !isCaught && (
          <div className="absolute top-8 right-8 flex flex-col space-y-4">
            <PixelCrow delay={0} />
            <PixelCrow delay={0.2} />
            <PixelCrow delay={0.4} />
          </div>
        )}
      </AnimatePresence>

      {/* Success effect */}
      <AnimatePresence>
        {isCaught && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="absolute bottom-24 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-pink-500 text-white px-6 py-3 rounded-lg text-lg font-bold shadow-2xl border-2 border-pink-300">
              <span className="text-2xl mr-2">✨</span>
              LAUNDRY SECURED!
              <span className="text-2xl ml-2">✨</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-center px-4">
        <p className="text-gray-800 text-sm font-bold drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]">
          {!showPanty
            ? 'Laundry day incoming...'
            : !isCaught
              ? crowsApproaching
                ? '⚠️ CROWS INCOMING! HURRY!'
                : 'Drag to basket before crows arrive!'
              : 'Mission complete!'}
        </p>
      </div>
    </div>
  );
}
