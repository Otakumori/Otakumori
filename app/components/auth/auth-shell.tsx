'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

// PetalField component for cosmetic sakura petals
function PetalField() {
  const count = 15; // Reduced for auth pages
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 8 + Math.random() * 6,
        delay: Math.random() * 3,
        duration: 8 + Math.random() * 10,
        drift: -20 + Math.random() * 40,
        rotate: -20 + Math.random() * 40,
      })),
    [count],
  );

  return (
    <div className="absolute inset-0 h-full w-full pointer-events-none overflow-hidden">
      {petals.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -30, x: p.left + '%', rotate: 0 }}
          animate={{
            y: '110vh',
            x: `calc(${p.left}vw + ${p.drift}px)`,
            rotate: p.rotate,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute"
          style={{
            width: p.size,
            height: p.size * 0.9,
            backgroundImage:
              'radial-gradient(circle at 35% 35%, rgba(255,192,203,0.85), rgba(255,192,203,0.2))',
            borderRadius: '60% 60% 60% 0 / 60% 60% 60% 0',
            boxShadow: '0 0 6px rgba(255,182,193,0.3)',
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}

interface AuthShellProps {
  children: React.ReactNode;
}

export default function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black relative overflow-hidden">
      {/* PetalField for cosmetic sakura petals */}
      <PetalField />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left column - Welcome message and hint */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-50">
              Welcome home, <span className="text-pink-400">wanderer</span>
            </h1>

            {/* Soapstone hint */}
            <div className="mt-6 text-sm text-zinc-300">
              <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/70 bg-zinc-900/60 px-3 py-1">
                <img
                  src="/overlay/soapstone.png"
                  alt=""
                  className="h-4 w-4 object-contain opacity-90"
                />
                <span>Secret Ahead</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right column - Auth form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-4">
        <p className="text-xs text-zinc-400 md:text-left text-center">Secret Ahead</p>
      </footer>
    </div>
  );
}
