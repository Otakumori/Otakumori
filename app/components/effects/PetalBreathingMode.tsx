/**
 * Petal Breathing Mode
 * Meditation mode with breathing rhythm, color shifts, and gravitational flow
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Moon, Sun, Heart } from 'lucide-react';

type BreathPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
type MoodPreset = 'calm' | 'energize' | 'focus' | 'sleep';

interface Petal {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  opacity: number;
  color: string;
}

const MOOD_PRESETS = {
  calm: {
    colors: ['#FFB7C5', '#E6A8D7', '#C4B5FD', '#A5B4FC'],
    breathCycle: 4000, // ms per phase
    gravity: 0.3,
    name: 'Calm & Peaceful',
    icon: Moon,
  },
  energize: {
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
    breathCycle: 3000,
    gravity: 0.5,
    name: 'Energize',
    icon: Sun,
  },
  focus: {
    colors: ['#667EEA', '#764BA2', '#A8DADC', '#457B9D'],
    breathCycle: 3500,
    gravity: 0.4,
    name: 'Focus & Clarity',
    icon: Wind,
  },
  sleep: {
    colors: ['#4A5568', '#6B7280', '#9CA3AF', '#D1D5DB'],
    breathCycle: 5000,
    gravity: 0.2,
    name: 'Deep Sleep',
    icon: Heart,
  },
};

interface PetalBreathingModeProps {
  onExit?: () => void;
}

export default function PetalBreathingMode({ onExit }: PetalBreathingModeProps) {
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [mood, setMood] = useState<MoodPreset>('calm');
  const [petals, setPetals] = useState<Petal[]>([]);
  const [showInstructions, setShowInstructions] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const currentMood = MOOD_PRESETS[mood];

  // Breath cycle
  useEffect(() => {
    const cycle = currentMood.breathCycle;
    const phases: BreathPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % phases.length;
      setBreathPhase(phases[currentIndex]);
    }, cycle);

    return () => clearInterval(interval);
  }, [currentMood.breathCycle]);

  // Hide instructions after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowInstructions(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize petals
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initialPetals: Petal[] = Array.from({ length: 30 }, (_, i) => ({
      id: `petal-${i}`,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 20 + 10,
      rotation: Math.random() * 360,
      opacity: Math.random() * 0.6 + 0.4,
      color: currentMood.colors[Math.floor(Math.random() * currentMood.colors.length)],
    }));

    setPetals(initialPetals);
  }, [currentMood.colors]);

  // Animate petals based on breath phase
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setPetals((prevPetals) =>
        prevPetals.map((petal) => {
          let newY = petal.y;
          let newOpacity = petal.opacity;

          // Breathing effect - petals rise/fall with breath
          if (breathPhase === 'inhale') {
            newY -= currentMood.gravity * 2; // Rise
            newOpacity = Math.min(1, petal.opacity + 0.01);
          } else if (breathPhase === 'exhale') {
            newY += currentMood.gravity; // Fall
            newOpacity = Math.max(0.3, petal.opacity - 0.01);
          }

          // Wrap around screen
          if (newY < -50) newY = canvas.height + 50;
          if (newY > canvas.height + 50) newY = -50;

          // Draw petal
          ctx.save();
          ctx.globalAlpha = newOpacity;
          ctx.translate(petal.x, newY);
          ctx.rotate((petal.rotation * Math.PI) / 180);
          ctx.fillStyle = petal.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          return {
            ...petal,
            y: newY,
            rotation: petal.rotation + 0.5,
            opacity: newOpacity,
          };
        }),
      );

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [breathPhase, currentMood.gravity]);

  const getBreathInstruction = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'Breathe In...';
      case 'hold-in':
        return 'Hold...';
      case 'exhale':
        return 'Breathe Out...';
      case 'hold-out':
        return 'Hold...';
    }
  };

  const getBreathScale = () => {
    switch (breathPhase) {
      case 'inhale':
        return 1.3;
      case 'hold-in':
        return 1.3;
      case 'exhale':
        return 0.8;
      case 'hold-out':
        return 0.8;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      {/* Animated Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Breathing Circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ scale: getBreathScale() }}
          transition={{ duration: currentMood.breathCycle / 1000, ease: 'easeInOut' }}
          className="relative h-64 w-64"
        >
          <div
            className="absolute inset-0 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${currentMood.colors[0]}40, ${currentMood.colors[1]}20, transparent)`,
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.p
              key={breathPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-light text-white drop-shadow-lg"
            >
              {getBreathInstruction()}
            </motion.p>
          </div>
        </motion.div>
      </div>

      {/* Instructions */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-lg text-white/80">Follow the breathing rhythm</p>
            <p className="text-sm text-white/60">Petals flow with your breath</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mood Selector */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
        {(Object.keys(MOOD_PRESETS) as MoodPreset[]).map((presetKey) => {
          const preset = MOOD_PRESETS[presetKey];
          const Icon = preset.icon;
          
          return (
            <button
              key={presetKey}
              onClick={() => setMood(presetKey)}
              className={`rounded-full p-4 transition-all ${
                mood === presetKey
                  ? 'bg-white/30 scale-110'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
              aria-label={`Switch to ${preset.name} mode`}
            >
              <Icon className="h-6 w-6 text-white" />
            </button>
          );
        })}
      </div>

      {/* Exit Button */}
      {onExit && (
        <button
          onClick={onExit}
          className="absolute top-8 right-8 rounded-full bg-white/10 px-6 py-3 text-white backdrop-blur-sm transition-all hover:bg-white/20"
        >
          Exit Breathing Mode
        </button>
      )}

      {/* Stats */}
      <div className="absolute top-8 left-8 text-white/70">
        <p className="text-sm">Mode: {currentMood.name}</p>
        <p className="text-xs">Cycle: {currentMood.breathCycle / 1000}s per phase</p>
      </div>
    </div>
  );
}

