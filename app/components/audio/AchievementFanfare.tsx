/**
 * Achievement Fanfare
 * Retro victory animations with sound
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundEffect } from '@/app/hooks/useAudio';
import { Trophy, Star, Zap } from 'lucide-react';

export type AchievementType = 'victory' | 'perfect' | 'combo' | 'milestone';

interface AchievementFanfareProps {
  show: boolean;
  type: AchievementType;
  title: string;
  description?: string;
  onComplete: () => void;
}

const ACHIEVEMENT_CONFIG = {
  victory: {
    icon: Trophy,
    color: 'from-yellow-400 to-orange-500',
    particles: 20,
    sound: 'achievement-victory',
  },
  perfect: {
    icon: Star,
    color: 'from-pink-400 to-purple-500',
    particles: 30,
    sound: 'achievement-perfect',
  },
  combo: {
    icon: Zap,
    color: 'from-blue-400 to-cyan-500',
    particles: 15,
    sound: 'achievement-combo',
  },
  milestone: {
    icon: Trophy,
    color: 'from-green-400 to-emerald-500',
    particles: 25,
    sound: 'achievement-milestone',
  },
};

export default function AchievementFanfare({
  show,
  type,
  title,
  description,
  onComplete,
}: AchievementFanfareProps) {
  const config = ACHIEVEMENT_CONFIG[type];
  const Icon = config.icon;
  const { play } = useSoundEffect(config.sound);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  useEffect(() => {
    if (show) {
      // Play achievement sound
      play({ volume: 0.8 });

      // Generate particles
      const newParticles = Array.from({ length: config.particles }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);

      // Auto-complete after animation
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, config.particles, config.sound, play, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          {/* Particle Effects */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: '50vw',
                y: '50vh',
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${particle.x}vw`,
                y: `${particle.y}vh`,
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: particle.delay,
                ease: 'easeOut',
              }}
              className="pointer-events-none absolute"
            >
              <div className={`h-2 w-2 rounded-full bg-gradient-to-br ${config.color}`} />
            </motion.div>
          ))}

          {/* Main Achievement Card */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
            }}
            className="relative z-10"
          >
            <div
              className={`rounded-3xl border-4 border-white/40 bg-gradient-to-br ${config.color} p-8 shadow-2xl`}
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              >
                <Icon className="h-12 w-12 text-white" />
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-2 text-center text-3xl font-bold text-white drop-shadow-lg"
              >
                {title}
              </motion.h2>

              {/* Description */}
              {description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center text-white/90"
                >
                  {description}
                </motion.p>
              )}

              {/* Retro Effect Lines */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="absolute left-0 top-1/2 h-1 w-full bg-white/30"
              />
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="absolute left-1/2 top-0 h-full w-1 bg-white/30"
              />
            </div>

            {/* Corner Sparkles */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  rotate: 360,
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.5 + i * 0.1,
                  repeat: 2,
                }}
                className="absolute text-4xl"
                style={{
                  top: i < 2 ? '-20px' : 'auto',
                  bottom: i >= 2 ? '-20px' : 'auto',
                  left: i % 2 === 0 ? '-20px' : 'auto',
                  right: i % 2 === 1 ? '-20px' : 'auto',
                }}
              >
                <span role="img" aria-label="Sparkle effect">
                  {'✨'}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Screen Flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute inset-0 bg-white"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
