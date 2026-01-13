import { logger } from '@/app/lib/logger';
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface MemoryCubeBootProps {
  onBootComplete: () => void;
  isFirstVisit: boolean;
}

const CUBE_FACE_TITLES = [
  'Petal Exchange',
  'Mini-Game Hub',
  'Memory Vault',
  'Echo Well',
  'Overgrown Mode',
  'System Core',
];

export function MemoryCubeBoot({ onBootComplete, isFirstVisit }: MemoryCubeBootProps) {
  const [stage, setStage] = useState(0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [secretPhrase, setSecretPhrase] = useState('');
  const [showWhisper, setShowWhisper] = useState(false);
  const router = useRouter();
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);

  // Easter egg: Track secret phrase
  useEffect(() => {
    if (secretPhrase === 'konami') {
      logger.warn('Secret phrase activated!');
      router.push('/mini-games?unlock=true');
    }
  }, [secretPhrase, router]);

  // Audio elements
  const [ambientAudio, setAmbientAudio] = useState<HTMLAudioElement | null>(null);
  const [whisperAudio, setWhisperAudio] = useState<HTMLAudioElement | null>(null);

  // Particle system
  const particles = useRef<
    { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[]
  >([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Initialize audio
    const ambient = new Audio('/assets/sounds/memory_cube_awakening.mp3');
    const whisper = new Audio('/assets/sounds/whisper.mp3');

    ambient.loop = false;
    ambient.volume = 0.3;
    whisper.volume = 0.2;

    setAmbientAudio(ambient);
    setWhisperAudio(whisper);

    // Load audio
    Promise.all([
      new Promise((resolve) => {
        ambient.addEventListener('canplaythrough', resolve, { once: true });
        ambient.load();
      }),
      new Promise((resolve) => {
        whisper.addEventListener('canplaythrough', resolve, { once: true });
        whisper.load();
      }),
    ]).then(() => {
      setAudioLoaded(true);
    });

    return () => {
      ambient.pause();
      whisper.pause();
    };
  }, []);

  // Initialize particle system
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles with varying properties
    particles.current = Array.from({ length: 150 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen with smooth transition
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle with glow effect
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(236, 72, 153, ${particle.alpha})`;
        ctx.fill();

        // Add glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(236, 72, 153, 0.5)';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (!audioLoaded) return;

    const bootSequence = async () => {
      // Stage 0: Initial black screen with pulsing pixel
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStage(1);

      // Stage 1: Particle swirl forming "O"
      ambientAudio?.play();
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setStage(2);

      // Stage 2: Cube formation
      await new Promise((resolve) => setTimeout(resolve, 4000));
      setStage(3);

      // Stage 3: Logo fade in
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStage(4);

      // Stage 4: Complete
      await new Promise((resolve) => setTimeout(resolve, 2000));
      onBootComplete();
    };

    if (isFirstVisit) {
      bootSequence();
    } else {
      onBootComplete();
    }
  }, [audioLoaded, isFirstVisit, onBootComplete]);

  const handleInteraction = () => {
    setInteractionCount((prev) => prev + 1);
    if (interactionCount >= 3) {
      // Secret interaction unlocked
      controls.start({
        scale: [1, 1.2, 1],
        rotate: [0, 360],
        transition: { duration: 1 },
      });
      whisperAudio?.play();
      setShowWhisper(true);
      setTimeout(() => setShowWhisper(false), 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    setSecretPhrase((prev) => {
      const newPhrase = prev + e.key;
      if (newPhrase.includes('bloom me')) {
        // Trigger special effect
        controls.start({
          scale: [1, 1.5, 1],
          transition: { duration: 0.5 },
        });
        return '';
      }
      return newPhrase.slice(-20); // Keep last 20 characters
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black"
        onClick={handleInteraction}
        onKeyPress={handleKeyPress}
        tabIndex={0}
      >
        <canvas ref={canvasRef} className="absolute inset-0 opacity-50" />

        {/* Stage 0: Pulsing Pixel */}
        {stage === 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1, 0.8, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-1 w-1 rounded-full bg-pink-500"
          />
        )}

        {/* Stage 1: Particle Swirl */}
        {stage === 1 && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative h-64 w-64">
            {Array.from({ length: 100 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  x: [0, Math.cos(i * 3.6) * 100],
                  y: [0, Math.sin(i * 3.6) * 100],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.02,
                }}
                className="absolute h-1 w-1 rounded-full bg-pink-500"
              />
            ))}
          </motion.div>
        )}

        {/* Stage 2: Cube Formation */}
        {stage === 2 && (
          <motion.div
            initial={{ rotateX: 0, rotateY: 0, scale: 0 }}
            animate={{ rotateX: 360, rotateY: 360, scale: 1 }}
            transition={{ duration: 4, ease: 'easeInOut' }}
            className="perspective-1000 relative h-32 w-32"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className="absolute inset-0 flex items-center justify-center border-2 border-pink-500/50 bg-pink-500/10 backdrop-blur-sm"
                style={{
                  transform: `rotateX(${i * 90}deg) translateZ(16px)`,
                }}
              >
                <span className="font-roboto-condensed text-sm uppercase tracking-wider text-pink-500/80">
                  {CUBE_FACE_TITLES[i]}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Stage 3: Logo Fade In */}
        {stage === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.h1
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="font-roboto-condensed mb-2 text-4xl font-bold uppercase tracking-wider text-white"
            >
              Otaku-mori
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-cormorant-garamond text-lg italic text-pink-500"
            >
              The Archive is Blooming
            </motion.p>
          </motion.div>
        )}

        {/* Skip button for returning users */}
        {!isFirstVisit && stage < 4 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onBootComplete}
            className="font-roboto-condensed absolute bottom-8 rounded-lg border border-pink-500/30 px-4 py-2 uppercase tracking-wider text-pink-500 transition-colors hover:bg-pink-500/10 hover:text-pink-400"
          >
            Skip Boot Sequence
          </motion.button>
        )}

        {/* Secret interaction counter */}
        {interactionCount > 0 && interactionCount < 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-unifraktur-cook absolute right-4 top-4 text-sm text-pink-500/50"
          >
            {interactionCount}/3
          </motion.div>
        )}

        {/* Whisper message */}
        {showWhisper && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="font-unifraktur-cook absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center text-pink-500/80"
          >
            "You arrived like rot. But I let you bloom."
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
