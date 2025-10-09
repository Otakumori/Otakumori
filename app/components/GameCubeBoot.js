'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

const SEASONAL_PETALS = {
  spring: { color: '#FF69B4', shape: '', particles: 20 },
  summer: { color: '#FF1493', shape: '', particles: 15 },
  autumn: { color: '#FF4500', shape: '', particles: 25 },
  winter: { color: '#B0E0E6', shape: '️', particles: 30 },
};

const ABYSS_PETALS = {
  color: '#000000',
  particles: 50,
  size: { min: 2, max: 6 },
  speed: { min: 1, max: 3 },
  rotation: { min: 0, max: 360 },
};

export default function GameCubeBoot({ onBootComplete }) {
  const { user, isLoaded } = useUser();
  const [currentSeason, setCurrentSeason] = useState('spring');
  const [stage, setStage] = useState('black');
  const [petals, setPetals] = useState([]);
  const [abyssParticles, setAbyssParticles] = useState([]);
  const [showCube, setShowCube] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [showInterface, setShowInterface] = useState(false);
  const [showFaces, setShowFaces] = useState(false);
  const [bootProgress, setBootProgress] = useState(0);
  const audioRef = useRef(null);

  // Log boot state for debugging
  console.warn('GameCube boot initialized:', { isLoaded, stage, bootProgress });

  // Determine current season
  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setCurrentSeason('spring');
    else if (month >= 5 && month <= 7) setCurrentSeason('summer');
    else if (month >= 8 && month <= 10) setCurrentSeason('autumn');
    else setCurrentSeason('winter');
  }, [4, 7, 10]);

  // Generate floating petals
  useEffect(() => {
    if (stage !== 'black') return;

    const generatePetal = () => ({
      id: Date.now() + Math.random(),
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      speed: 1 + Math.random() * 2,
      sway: Math.random() * 2 - 1,
    });

    const interval = setInterval(() => {
      setPetals((prev) => [
        ...prev.slice(-SEASONAL_PETALS[currentSeason].particles),
        generatePetal(),
      ]);
    }, 500);

    return () => clearInterval(interval);
  }, [stage, currentSeason]);

  // Generate Abyss particles
  useEffect(() => {
    if (!showCube) return;

    const generateParticle = () => ({
      id: Date.now() + Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: ABYSS_PETALS.size.min + Math.random() * (ABYSS_PETALS.size.max - ABYSS_PETALS.size.min),
      rotation: Math.random() * 360,
      speed:
        ABYSS_PETALS.speed.min + Math.random() * (ABYSS_PETALS.speed.max - ABYSS_PETALS.speed.min),
      opacity: 0.3 + Math.random() * 0.7,
    });

    const particles = Array.from({ length: ABYSS_PETALS.particles }, generateParticle);
    setAbyssParticles(particles);

    const interval = setInterval(() => {
      setAbyssParticles((prev) =>
        prev.map((particle) => ({
          ...particle,
          rotation: particle.rotation + particle.speed,
          opacity: Math.max(0, particle.opacity - 0.01),
        })),
      );
    }, 16);

    return () => clearInterval(interval);
  }, [showCube]);

  // Boot sequence stages
  useEffect(() => {
    if (!user) return;

    const bootSequence = async () => {
      // Play boot sound
      if (audioRef.current) {
        audioRef.current.play();
      }

      // Black screen
      setBootProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show cube
      setStage('cube');
      setShowCube(true);
      setBootProgress(40);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show cursor
      setShowCursor(true);
      setBootProgress(60);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Show interface
      setStage('interface');
      setShowInterface(true);
      setShowFaces(true);
      setBootProgress(90);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Complete boot sequence
      setBootProgress(100);
      onBootComplete?.();
    };

    bootSequence();
  }, [user, onBootComplete]);

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <audio ref={audioRef} src="/assets/gamecube-boot.mp3" preload="auto">
        <track kind="captions" label="Boot sequence audio" />
      </audio>

      {/* Floating petals */}
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute text-pink-300 text-2xl pointer-events-none"
          style={{
            left: `${petal.x}%`,
            top: `${petal.y}%`,
            transform: `rotate(${petal.rotation}deg) scale(${petal.scale})`,
          }}
          animate={{
            y: ['0%', '110%'],
            x: [`${petal.x}%`, `${petal.x + petal.sway}%`],
          }}
          transition={{ duration: petal.speed, repeat: Infinity }}
        >
          🌸
        </motion.div>
      ))}

      {/* Abyss particles */}
      {abyssParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-purple-500 rounded-full pointer-events-none"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
          }}
        />
      ))}

      {/* Boot progress indicator */}
      {bootProgress > 0 && bootProgress < 100 && (
        <div className="absolute bottom-10 left-0 right-0 px-20">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-500 transition-all duration-300"
              style={{ width: `${bootProgress}%` }}
            />
          </div>
          <div className="text-center text-white/60 text-sm mt-2">{bootProgress}%</div>
        </div>
      )}

      {/* Custom cursor */}
      {showCursor && (
        <div
          className="absolute pointer-events-none w-4 h-4 bg-pink-500 rounded-full animate-pulse"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      )}

      <AnimatePresence mode="wait">
        {stage === 'black' && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
          />
        )}

        {stage === 'cube' && showCube && (
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="relative h-64 w-64"
          >
            <div className="animate-spin-slow absolute inset-0 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-[0_0_50px_rgba(236,72,153,0.5)]" />
            <div className="absolute inset-2 rounded-lg bg-black" />
            <div className="absolute inset-4 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
          </motion.div>
        )}

        {stage === 'interface' && showInterface && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* Show GameCube faces if enabled */}
            {showFaces && (
              <div className="mb-6 text-purple-400 text-sm">Loading GameCube interface...</div>
            )}
            <h1 className="mb-4 text-4xl font-bold text-pink-500">
              {
                <>
                  <span role="img" aria-label="emoji">
                    W
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    l
                  </span>
                  <span role="img" aria-label="emoji">
                    c
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    m
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    O
                  </span>
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    k
                  </span>
                  <span role="img" aria-label="emoji">
                    u
                  </span>
                  <span role="img" aria-label="emoji">
                    m
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                </>
              }
            </h1>
            <p className="text-lg text-pink-300">
              {
                <>
                  <span role="img" aria-label="emoji">
                    Y
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    u
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    n
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    m
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    d
                  </span>
                  <span role="img" aria-label="emoji">
                    v
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    n
                  </span>
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    u
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    b
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    g
                  </span>
                  <span role="img" aria-label="emoji">
                    i
                  </span>
                  <span role="img" aria-label="emoji">
                    n
                  </span>
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  ' '
                  <span role="img" aria-label="emoji">
                    h
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                </>
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
