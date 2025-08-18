'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

const SEASONAL_PETALS = {
  spring: { color: '#FF69B4', shape: '🌸', particles: 20 },
  summer: { color: '#FF1493', shape: '🌹', particles: 15 },
  autumn: { color: '#FF4500', shape: '🍁', particles: 25 },
  winter: { color: '#B0E0E6', shape: '❄️', particles: 30 },
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

  // Determine current season
  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setCurrentSeason('spring');
    else if (month >= 5 && month <= 7) setCurrentSeason('summer');
    else if (month >= 8 && month <= 10) setCurrentSeason('autumn');
    else setCurrentSeason('winter');
  }, []);

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
      setPetals(prev => [
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
      setAbyssParticles(prev =>
        prev.map(particle => ({
          ...particle,
          rotation: particle.rotation + particle.speed,
          opacity: Math.max(0, particle.opacity - 0.01),
        }))
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
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show cube
      setStage('cube');
      setShowCube(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Show interface
      setStage('interface');
      setShowInterface(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Complete boot sequence
      onBootComplete?.();
    };

    bootSequence();
  }, [user, onBootComplete]);

  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <audio ref={audioRef} src="/assets/gamecube-boot.mp3" preload="auto" />

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
            <h1 className="mb-4 text-4xl font-bold text-pink-500">Welcome to Otakumori</h1>
            <p className="text-lg text-pink-300">Your anime adventure begins here</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
