'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const [currentSeason, setCurrentSeason] = useState('spring');
  const [stage, setStage] = useState('black');
  const [petals, setPetals] = useState([]);
  const [abyssParticles, setAbyssParticles] = useState([]);
  const [showCube, setShowCube] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const [showInterface, setShowInterface] = useState(false);
  const [showFaces, setShowFaces] = useState(false);

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
    const sequence = async () => {
      // Black velvet stage with petals
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStage('o-emergence');

      // O emergence
      await new Promise(resolve => setTimeout(resolve, 1500));
      setShowCube(true);

      // Cube morph
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowCursor(true);

      // Cursor reveal
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowInterface(true);

      // Interface reveal
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowFaces(true);

      // Complete boot sequence
      await new Promise(resolve => setTimeout(resolve, 1000));
      onBootComplete();
    };

    sequence();
  }, [onBootComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <AnimatePresence>
        {/* Black Velvet Stage with Petals */}
        {stage === 'black' && (
          <div className="absolute inset-0 overflow-hidden">
            {petals.map(petal => (
              <motion.div
                key={petal.id}
                initial={{ y: -10, x: petal.x, opacity: 0 }}
                animate={{
                  y: '100vh',
                  x: petal.x + Math.sin(petal.y * 0.01) * 50 * petal.sway,
                  opacity: [0, 1, 0],
                  rotate: petal.rotation + 360,
                }}
                transition={{
                  duration: 5 + Math.random() * 5,
                  ease: 'linear',
                }}
                className="absolute text-2xl"
                style={{ color: SEASONAL_PETALS[currentSeason].color }}
              >
                {SEASONAL_PETALS[currentSeason].shape}
              </motion.div>
            ))}
          </div>
        )}

        {/* O Emergence */}
        {stage === 'o-emergence' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 1,
                repeat: 1,
                ease: 'easeInOut',
              }}
              className="text-8xl font-bold text-pink-500"
            >
              O
            </motion.div>
          </motion.div>
        )}

        {/* Cube Morph with Abyss Particles */}
        {showCube && (
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: 1, rotate: 360 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative h-32 w-32">
              {/* Abyss Particles */}
              {abyssParticles.map(particle => (
                <motion.div
                  key={particle.id}
                  animate={{
                    rotate: particle.rotation,
                    opacity: particle.opacity,
                  }}
                  transition={{ duration: 0.1 }}
                  className="absolute"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: ABYSS_PETALS.color,
                    borderRadius: '50%',
                  }}
                />
              ))}
              <motion.div
                className="absolute inset-0 border-4 border-pink-500/50 backdrop-blur-sm"
                animate={{
                  rotateY: [0, 360],
                  rotateX: [0, 360],
                }}
                transition={{
                  duration: 2,
                  ease: 'easeInOut',
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Cursor Animation */}
        {showCursor && (
          <motion.div
            initial={{ x: -100, y: -100 }}
            animate={{ x: 0, y: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 45, 0],
              }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut',
              }}
              className="text-4xl"
            >
              👆
            </motion.div>
          </motion.div>
        )}

        {/* Interface Reveal */}
        {showInterface && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0, 1, 1],
              }}
              className="text-4xl font-bold text-pink-500"
            >
              I
            </motion.div>
          </motion.div>
        )}

        {/* GameCube Faces */}
        {showFaces && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="grid grid-cols-3 gap-4">
              {['Up', 'Left', 'Center', 'Right', 'Down'].map((face, index) => (
                <motion.div
                  key={face}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  className={`flex h-24 w-24 items-center justify-center rounded-lg bg-gray-800/50 font-bold text-pink-400 backdrop-blur-lg ${index === 2 ? 'col-start-2' : ''} `}
                >
                  {face}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
