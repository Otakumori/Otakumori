'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';
import { generateProceduralTexture } from '@/lib/perlin-noise';

// Procedural petal with Perlin noise texture
function ProceduralPetal({ caught }: { caught: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      const canvas = generateProceduralTexture(64, 64, {
        baseColor: [255, 182, 193, 255], // Light pink
        noise: [
          {
            color: [255, 105, 180, 255], // Hot pink
            octaves: 3,
            persistence: 0.5,
            lacunarity: 2.0,
            scale: 4,
          },
          {
            color: [255, 20, 147, 128], // Deep pink accent
            octaves: 5,
            persistence: 0.3,
            lacunarity: 3.0,
            scale: 8,
          },
        ],
        seed: 42,
      });
      canvasRef.current = canvas;
    }
  }, []);

  return (
    <div
      className="relative w-12 h-16"
      style={{ filter: caught ? 'saturate(2) brightness(1.2)' : 'none' }}
    >
      {/* Petal shape using canvas texture */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: 'ellipse(45% 50% at 50% 50%)',
          overflow: 'hidden',
        }}
      >
        {canvasRef.current && (
          <img
            src={canvasRef.current.toDataURL()}
            alt=""
            className="w-full h-full object-cover"
            style={{
              imageRendering: 'auto',
              filter: 'blur(0.5px)',
            }}
          />
        )}
      </div>

      {/* Petal veins */}
      <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 12 16">
        <path d="M 6 2 Q 6 8 6 14" stroke="rgba(255, 20, 147, 0.3)" strokeWidth="0.3" fill="none" />
        <path d="M 6 6 Q 4 7 3 8" stroke="rgba(255, 20, 147, 0.2)" strokeWidth="0.2" fill="none" />
        <path d="M 6 6 Q 8 7 9 8" stroke="rgba(255, 20, 147, 0.2)" strokeWidth="0.2" fill="none" />
        <path
          d="M 6 10 Q 4 11 3 12"
          stroke="rgba(255, 20, 147, 0.2)"
          strokeWidth="0.2"
          fill="none"
        />
        <path
          d="M 6 10 Q 8 11 9 12"
          stroke="rgba(255, 20, 147, 0.2)"
          strokeWidth="0.2"
          fill="none"
        />
      </svg>

      {/* Glow effect when caught */}
      {caught && (
        <motion.div
          className="absolute inset-0 bg-pink-400 rounded-full blur-md"
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}
    </div>
  );
}

// Anime-style character silhouette with tongue
function CharacterWithTongue({ tongueExtended }: { tongueExtended: boolean }) {
  return (
    <div className="relative">
      {/* Head */}
      <div className="w-24 h-24 bg-gradient-to-br from-purple-900 to-purple-950 rounded-full relative shadow-2xl">
        {/* Eyes */}
        <div className="absolute top-8 left-6 w-3 h-4 bg-white rounded-full">
          <div className="absolute top-1 left-1 w-2 h-2 bg-purple-500 rounded-full" />
        </div>
        <div className="absolute top-8 right-6 w-3 h-4 bg-white rounded-full">
          <div className="absolute top-1 left-1 w-2 h-2 bg-purple-500 rounded-full" />
        </div>

        {/* Mouth area */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <motion.div
            className="w-4 h-2 bg-black rounded-b-full"
            animate={{ scaleY: tongueExtended ? 2 : 1 }}
          />
        </div>
      </div>

      {/* Tongue */}
      <motion.div
        className="absolute left-1/2 transform -translate-x-1/2 origin-top"
        style={{ top: '85px' }}
        animate={{
          scaleY: tongueExtended ? 1.5 : 0.3,
          y: tongueExtended ? -20 : 0,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <div
          className="w-6 h-16 bg-gradient-to-b from-pink-400 via-pink-500 to-pink-600 rounded-b-full relative"
          style={{
            boxShadow: tongueExtended
              ? '0 0 15px rgba(236, 72, 153, 0.6), inset 0 2px 4px rgba(255,255,255,0.3)'
              : 'none',
          }}
        >
          {/* Tongue texture lines */}
          <div className="absolute inset-0 flex flex-col justify-around px-1 py-2 opacity-30">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-px bg-white/40" />
            ))}
          </div>

          {/* Saliva drips when extended */}
          {tongueExtended && (
            <motion.div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-blue-200 rounded-full opacity-60"
              initial={{ height: 0 }}
              animate={{ height: 16 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function PetalLick({ onComplete, onFail, _duration }: GameProps) {
  const [petalY, setPetalY] = useState(-10);
  const [tongueExtended, setTongueExtended] = useState(false);
  const [isCaught, setIsCaught] = useState(false);
  const [showElements, setShowElements] = useState(false);
  const [score, setScore] = useState(0);
  const dropSpeed = useRef(1.5);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowElements(true), 500);
    return () => clearTimeout(showTimer);
  }, []);

  // Petal falling logic
  useEffect(() => {
    if (!showElements || isCaught) return;

    const dropTimer = setInterval(() => {
      setPetalY((prev) => {
        if (prev >= 100) {
          if (!isCaught) {
            onFail();
          }
          return 100;
        }
        return prev + dropSpeed.current;
      });
    }, 30);

    return () => clearInterval(dropTimer);
  }, [showElements, isCaught, onFail]);

  const handleLick = useCallback(() => {
    if (isCaught || tongueExtended) return;

    setTongueExtended(true);

    // Check collision with petal
    setTimeout(() => {
      // Tongue is around 60-80% of screen, petal needs to be in that range
      if (petalY >= 55 && petalY <= 85) {
        setIsCaught(true);
        setScore(Math.floor(100 - petalY)); // Better timing = higher score
        setTimeout(() => {
          onComplete(Math.floor(100 - petalY), 15);
        }, 500);
      }

      // Retract tongue
      setTimeout(() => {
        setTongueExtended(false);
      }, 100);
    }, 150);
  }, [isCaught, tongueExtended, petalY, onComplete]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleLick();
      }
    },
    [handleLick],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="w-full h-full relative bg-gradient-to-b from-purple-950 via-pink-950 to-purple-900 overflow-hidden">
      {/* Sparkles background */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Falling petal */}
      <AnimatePresence>
        {showElements && !isCaught && (
          <motion.div
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{ top: `${petalY}%` }}
            initial={{ opacity: 0, rotate: 0 }}
            animate={{
              opacity: 1,
              rotate: [0, 10, -10, 10, -10, 0],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            <ProceduralPetal caught={false} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <CharacterWithTongue tongueExtended={tongueExtended} />
      </div>

      {/* Success effect */}
      <AnimatePresence>
        {isCaught && (
          <motion.div
            initial={{ scale: 0, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: -50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center"
          >
            <div className="bg-pink-500/90 backdrop-blur-lg px-6 py-4 rounded-2xl border-2 border-pink-300 shadow-2xl">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ProceduralPetal caught={true} />
                <span className="text-3xl">×1</span>
              </div>
              <p className="text-white text-xl font-bold drop-shadow-lg">DELICIOUS!</p>
              <p className="text-pink-100 text-sm mt-1">Score: {score}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center px-4">
        <p className="text-pink-200 text-base font-bold drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]">
          {!showElements
            ? 'Cherry blossom season...'
            : !isCaught
              ? '<span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span> CATCH THE PETAL! <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>'
              : 'Petal secured!'}
        </p>
        {!isCaught && showElements && (
          <p className="text-pink-200/70 text-xs mt-1 drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]">
            Press SPACE or CLICK to extend tongue • Timing is key!
          </p>
        )}
      </div>

      {/* Click area */}
      <button
        className="absolute inset-0 cursor-pointer bg-transparent border-none p-0 w-full h-full"
        onClick={handleLick}
        disabled={isCaught}
        aria-label="Extend tongue to catch the falling petal"
      />
    </div>
  );
}
