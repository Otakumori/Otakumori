'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameCubeBootSequenceProps {
  onComplete: () => void;
  skipable?: boolean;
}

export default function GameCubeBootSequence({
  onComplete,
  skipable = true,
}: GameCubeBootSequenceProps) {
  const [phase, setPhase] = useState<'rolling' | 'assembly' | 'logo' | 'petal-burst' | 'complete'>(
    'rolling',
  );
  const [showSkip, setShowSkip] = useState(false);
  const [bootSeen, setBootSeen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  // Check if boot sequence was seen today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const bootKey = `otm-gamecube-boot-${today}`;
    const seen = localStorage.getItem(bootKey);
    setBootSeen(!!seen);

    if (seen) {
      onComplete();
      return;
    }

    // Show skip button after 2 seconds
    const skipTimer = setTimeout(() => setShowSkip(true), 2000);

    // Phase transitions
    const timers = [
      setTimeout(() => setPhase('assembly'), 900), // Rolling cubes
      setTimeout(() => setPhase('logo'), 1700), // Assembly
      setTimeout(() => setPhase('petal-burst'), 2500), // Logo reveal
      setTimeout(() => {
        setPhase('complete');
        setBootSeen(true);
        localStorage.setItem(bootKey, 'true');
        setTimeout(onComplete, 1500); // Petal burst duration
      }, 4000),
    ];

    return () => {
      clearTimeout(skipTimer);
      timers.forEach(clearTimeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onComplete]);

  const skipBoot = () => {
    const today = new Date().toISOString().split('T')[0];
    const bootKey = `otm-gamecube-boot-${today}`;
    localStorage.setItem(bootKey, 'true');
    onComplete();
  };

  // Canvas animation for rolling cubes
  useEffect(() => {
    if (phase !== 'rolling' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = 800;
    canvas.height = 600;

    let cubes = Array.from({ length: 4 }, (_, i) => ({
      x: -100 + i * 200,
      y: 300,
      size: 60,
      rotation: 0,
      speed: 2 + Math.random(),
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#581c87'); // Purple-900
      gradient.addColorStop(0.5, '#7c3aed'); // Purple-800
      gradient.addColorStop(1, '#000000'); // Black
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw rolling cubes
      cubes.forEach((cube) => {
        ctx.save();
        ctx.translate(cube.x, cube.y);
        ctx.rotate(cube.rotation);

        // Pink cube with gradient
        const cubeGradient = ctx.createLinearGradient(-cube.size, -cube.size, cube.size, cube.size);
        cubeGradient.addColorStop(0, '#ec4899'); // Pink-500
        cubeGradient.addColorStop(1, '#be185d'); // Pink-700
        ctx.fillStyle = cubeGradient;
        ctx.fillRect(-cube.size, -cube.size, cube.size * 2, cube.size * 2);

        // Cube edges
        ctx.strokeStyle = '#fbbf24'; // Amber-400
        ctx.lineWidth = 3;
        ctx.strokeRect(-cube.size, -cube.size, cube.size * 2, cube.size * 2);

        ctx.restore();

        // Update cube position and rotation
        cube.x += cube.speed;
        cube.rotation += 0.1;

        // Reset position when off screen
        if (cube.x > canvas.width + 100) {
          cube.x = -100;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [phase]);

  // Respect reduced motion preference
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onComplete();
    }
  }, [onComplete]);

  if (bootSeen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-900 via-purple-800 to-black flex items-center justify-center">
      {/* Skip button */}
      <AnimatePresence>
        {showSkip && skipable && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={skipBoot}
            className="absolute bottom-8 right-8 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
          >
            Skip Boot
          </motion.button>
        )}
      </AnimatePresence>

      {/* Rolling cubes phase */}
      {phase === 'rolling' && (
        <div className="text-center">
          <canvas ref={canvasRef} className="max-w-full h-auto" style={{ maxHeight: '400px' }} />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-lg mt-8"
          >
            Loading GameCube Interface...
          </motion.p>
        </div>
      )}

      {/* Assembly phase */}
      {phase === 'assembly' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative w-64 h-64 mx-auto">
            {/* Assembling cube with O shape */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl"
              style={{
                clipPath:
                  'polygon(20% 0%, 80% 0%, 80% 20%, 100% 20%, 100% 80%, 80% 80%, 80% 100%, 20% 100%, 20% 80%, 0% 80%, 0% 20%, 20% 20%)',
              }}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              className="absolute inset-8 bg-transparent border-8 border-pink-300 rounded-xl"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white text-lg mt-8"
          >
            Assembling Interface...
          </motion.p>
        </motion.div>
      )}

      {/* Logo reveal phase */}
      {phase === 'logo' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
          >
            OTAKU-MORI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white text-lg"
          >
            Welcome Home, Traveler
          </motion.p>
        </motion.div>
      )}

      {/* Petal burst phase */}
      {phase === 'petal-burst' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center relative"
        >
          <motion.h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            OTAKU-MORI
          </motion.h1>

          {/* Petal burst animation */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 0,
                  rotate: i * 30,
                }}
                animate={{
                  x: Math.cos((i * 30 * Math.PI) / 180) * 200,
                  y: Math.sin((i * 30 * Math.PI) / 180) * 200,
                  opacity: 0,
                  scale: 1,
                  rotate: i * 30 + 360,
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                className="absolute w-4 h-4 bg-pink-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: '-8px',
                  marginTop: '-8px',
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Complete phase */}
      {phase === 'complete' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center"
        >
          <motion.h1 className="text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            OTAKU-MORI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white text-lg"
          >
            Interface Ready
          </motion.p>
        </motion.div>
      )}
    </div>
  );
}
