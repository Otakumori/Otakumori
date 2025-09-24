'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameCubeBootProps {
  onComplete?: () => void;
  skipable?: boolean;
}

export default function GameCubeBoot({ onComplete, skipable = true }: GameCubeBootProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [canSkip, setCanSkip] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'rolling' | 'assembling' | 'reveal' | 'burst' | 'complete'>('rolling');
  const [showPetals, setShowPetals] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      handleComplete();
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const bootKey = `otm-gamecube-boot-${today}`;
    const hasSeenToday = localStorage.getItem(bootKey);

    if (hasSeenToday && skipable) {
      handleComplete();
      return;
    }

    // Initialize audio (optional)
    try {
      audioRef.current = new Audio('/audio/gamecube-boot.mp3'); // Optional boot sound
      audioRef.current.volume = 0.3;
    } catch (error) {
      console.log('Boot audio not available');
    }

    // Boot sequence timing
    const sequence = async () => {
      // Phase 1: Rolling cubes (900ms)
      setCurrentPhase('rolling');
      if (audioRef.current) {
        try {
          await audioRef.current.play();
        } catch (error) {
          console.log('Audio autoplay blocked');
        }
      }

      await new Promise(resolve => setTimeout(resolve, 900));

      // Phase 2: Assembly (800ms)
      setCurrentPhase('assembling');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Phase 3: Logo reveal (800ms)
      setCurrentPhase('reveal');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Phase 4: Petal burst (1500ms)
      setCurrentPhase('burst');
      setShowPetals(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Phase 5: Complete
      setCurrentPhase('complete');
      localStorage.setItem(bootKey, 'true');
      
      // Auto-complete after a brief pause
      setTimeout(() => {
        handleComplete();
      }, 500);
    };

    // Enable skip after 1.5 seconds
    const skipTimer = setTimeout(() => setCanSkip(true), 1500);

    sequence();

    return () => {
      clearTimeout(skipTimer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleComplete = () => {
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    if (!canSkip) return;
    const today = new Date().toISOString().split('T')[0];
    const bootKey = `otm-gamecube-boot-${today}`;
    localStorage.setItem(bootKey, 'true');
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    handleComplete();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') && canSkip) {
        e.preventDefault();
        handleSkip();
      }
    };

    if (skipable) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [skipable, canSkip]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a0d2e 0%, #16051a 50%, #0c0911 100%)'
      }}
      data-gamecube-boot="true"
      role="img"
      aria-label="Otaku-mori GameCube boot animation loading"
    >
      {/* Skip Button */}
      <AnimatePresence>
        {skipable && canSkip && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="absolute bottom-6 right-6 z-10 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
            aria-label="Skip GameCube boot animation"
          >
            Skip (Space/Enter)
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Boot Animation Container */}
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Phase 1: Rolling Cubes */}
        <AnimatePresence>
          {currentPhase === 'rolling' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex space-x-8"
            >
              {[0, 1, 2, 3].map((index) => (
                <motion.div
                  key={index}
                  initial={{ x: -200, rotateY: 0 }}
                  animate={{ 
                    x: 0, 
                    rotateY: 360,
                    rotateX: [0, 180, 360]
                  }}
                  transition={{
                    duration: 0.9,
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                  className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-lg shadow-lg"
                  style={{
                    transform: 'perspective(1000px)'
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 2: Assembly into O */}
        <AnimatePresence>
          {currentPhase === 'assembling' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <motion.div
                animate={{
                  rotateY: [0, 180, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut"
                }}
                className="relative w-32 h-32 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl shadow-2xl"
                style={{
                  transform: 'perspective(1000px)'
                }}
              >
                {/* Hollow center for O shape */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="absolute inset-6 bg-black rounded-xl border-2 border-pink-300/30"
                />
                
                {/* Glowing edges */}
                <div className="absolute inset-0 rounded-2xl shadow-[0_0_30px_rgba(236,72,153,0.6)] animate-pulse" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 3: Logo Reveal */}
        <AnimatePresence>
          {currentPhase === 'reveal' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {/* The O logo */}
              <motion.div
                initial={{ scale: 0.8, rotateY: 0 }}
                animate={{ 
                  scale: 1, 
                  rotateY: 360,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative w-32 h-32 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl shadow-2xl mx-auto mb-6"
                style={{
                  transform: 'perspective(1000px)'
                }}
              >
                {/* Hollow center for O */}
                <div className="absolute inset-6 bg-black rounded-xl border-2 border-pink-300/30" />
                
                {/* Intense glow */}
                <div className="absolute inset-0 rounded-2xl shadow-[0_0_50px_rgba(236,72,153,0.8)]" />
              </motion.div>

              {/* Brand Text */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-pink-300 to-purple-400 bg-clip-text text-transparent mb-2 tracking-wider">
                  OTAKU-MORI
                </h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-pink-300/80 text-sm italic tracking-wide"
                >
                  made with ♡
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 4: Petal Burst */}
        <AnimatePresence>
          {currentPhase === 'burst' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              {/* The O logo (static during burst) */}
              <div className="relative w-32 h-32 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl shadow-2xl mx-auto mb-6">
                <div className="absolute inset-6 bg-black rounded-xl border-2 border-pink-300/30" />
                <div className="absolute inset-0 rounded-2xl shadow-[0_0_60px_rgba(236,72,153,1)]" />
              </div>

              {/* Brand Text */}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-pink-300 to-purple-400 bg-clip-text text-transparent mb-2 tracking-wider">
                OTAKU-MORI
              </h1>
              <p className="text-pink-300/80 text-sm italic tracking-wide">
                made with ♡
              </p>

              {/* Petal Explosion */}
              {showPetals && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: '50%',
                        y: '50%',
                        scale: 0,
                        opacity: 1
                      }}
                      animate={{
                        x: `${50 + Math.cos((i * 30) * Math.PI / 180) * 200}%`,
                        y: `${50 + Math.sin((i * 30) * Math.PI / 180) * 200}%`,
                        scale: [0, 1, 0.8, 0],
                        opacity: [1, 1, 0.8, 0],
                        rotate: [0, 180, 360]
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.05,
                        ease: "easeOut"
                      }}
                      className="absolute w-4 h-4 rounded-full"
                      style={{
                        background: `radial-gradient(circle, ${i % 2 === 0 ? '#ec4899' : '#f472b6'}, transparent)`,
                        filter: 'blur(0.5px)'
                      }}
                    />
                  ))}
                  
                  {/* Additional sparkle effects */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={`sparkle-${i}`}
                      initial={{
                        x: '50%',
                        y: '50%',
                        scale: 0
                      }}
                      animate={{
                        x: `${50 + Math.cos((i * 45 + 22.5) * Math.PI / 180) * 150}%`,
                        y: `${50 + Math.sin((i * 45 + 22.5) * Math.PI / 180) * 150}%`,
                        scale: [0, 1.5, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 1.2,
                        delay: 0.3 + i * 0.1,
                        ease: "easeOut"
                      }}
                      className="absolute w-2 h-2 bg-pink-300 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.8)]"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phase 5: Completion fade */}
        <AnimatePresence>
          {currentPhase === 'complete' && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="relative w-32 h-32 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl shadow-2xl mx-auto mb-6">
                <div className="absolute inset-6 bg-black rounded-xl border-2 border-pink-300/30" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-pink-300 to-purple-400 bg-clip-text text-transparent mb-2 tracking-wider">
                OTAKU-MORI
              </h1>
              <p className="text-pink-300/80 text-sm italic tracking-wide">
                made with ♡
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`ambient-${i}`}
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 20,
              opacity: 0
            }}
            animate={{
              y: -20,
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute w-1 h-1 bg-pink-300/30 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
