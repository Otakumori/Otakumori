// DEPRECATED: This component is a duplicate. Use app\hub\_scene\CubeHub.tsx instead.
'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamesStore, type HubPanel } from '@/app/lib/state/games';
import { COPY } from '@/app/lib/copy';
import Link from 'next/link';

// Cube component with labels
function Cube() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const { activePanel, isPanelOpen } = useGamesStore();

  // Align camera to Hub Face on load
  useEffect(() => {
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Gentle rotation when panel is open
  useFrame((state) => {
    if (meshRef.current) {
      if (isPanelOpen && activePanel === 'mini-games') {
        // Subtle rotation to show "open" effect
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      } else {
        // Snap back to Hub Face
        meshRef.current.rotation.y = 0;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial
        color="#f3f4f6"
        transparent
        opacity={0.1}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

// Hub Face overlay with labels
function HubFaceOverlay() {
  const { activePanel, isPanelOpen, openPanel, closePanel } = useGamesStore();
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const handlePanelOpen = (panel: HubPanel) => {
    if (activePanel === panel) {
      closePanel();
    } else {
      openPanel(panel);
    }
  };

  const labelVariants = {
    idle: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.2 },
    },
    dimmed: {
      opacity: 0.35,
      scale: 1,
      transition: { duration: 0.2 },
    },
    active: {
      opacity: 1,
      scale: 1.04,
      transition: { duration: 0.2 },
    },
  };

  const panelVariants = {
    closed: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
    open: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: isReducedMotion ? 0.1 : 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Hub Face Labels */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-8 w-80 h-80">
          {/* Mini-Games */}
          <motion.button
            className="pointer-events-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent"
            onClick={() => handlePanelOpen('mini-games')}
            variants={labelVariants}
            animate={activePanel === 'mini-games' ? 'active' : isPanelOpen ? 'dimmed' : 'idle'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-lg font-semibold text-gray-900">Mini-Games</h3>
            <p className="text-sm text-gray-600">Challenge yourself</p>
          </motion.button>

          {/* Trade Hall */}
          <motion.button
            className="pointer-events-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent"
            onClick={() => handlePanelOpen('trade-hall')}
            variants={labelVariants}
            animate={activePanel === 'trade-hall' ? 'active' : isPanelOpen ? 'dimmed' : 'idle'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-lg font-semibold text-gray-900">Trade Hall</h3>
            <p className="text-sm text-gray-600">Exchange goods</p>
          </motion.button>

          {/* Achievements */}
          <motion.button
            className="pointer-events-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent"
            onClick={() => handlePanelOpen('achievements')}
            variants={labelVariants}
            animate={activePanel === 'achievements' ? 'active' : isPanelOpen ? 'dimmed' : 'idle'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
            <p className="text-sm text-gray-600">Track progress</p>
          </motion.button>

          {/* Profile */}
          <motion.button
            className="pointer-events-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-center hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-transparent"
            onClick={() => handlePanelOpen('profile')}
            variants={labelVariants}
            animate={activePanel === 'profile' ? 'active' : isPanelOpen ? 'dimmed' : 'idle'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-lg font-semibold text-gray-900">Profile</h3>
            <p className="text-sm text-gray-600">Your journey</p>
          </motion.button>
        </div>
      </div>

      {/* In-Face Panels */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial="closed"
            animate="open"
            exit="closed"
            variants={panelVariants}
          >
            <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl p-8 shadow-2xl max-w-2xl w-full mx-4">
              {/* Panel Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activePanel === 'mini-games' && 'Mini-Games'}
                  {activePanel === 'trade-hall' && 'Trade Hall'}
                  {activePanel === 'achievements' && 'Achievements'}
                  {activePanel === 'profile' && 'Profile'}
                </h2>
                <button
                  onClick={closePanel}
                  className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-full p-2"
                  aria-label="Close panel"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Panel Content */}
              <div className="space-y-4">
                {activePanel === 'mini-games' && <MiniGamesPanel />}
                {activePanel === 'trade-hall' && <TradeHallPanel />}
                {activePanel === 'achievements' && <AchievementsPanel />}
                {activePanel === 'profile' && <ProfilePanel />}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mini-Games Panel
function MiniGamesPanel() {
  const games = [
    {
      slug: 'petal-samurai',
      title: 'Petal Samurai',
      description: COPY.games.petalSamurai,
      available: true,
    },
    {
      slug: 'puzzle-reveal',
      title: 'Puzzle Reveal',
      description: COPY.games.puzzleReveal,
      available: true,
    },
    {
      slug: 'bubble-girl',
      title: 'Bubble Girl',
      description: COPY.games.bubbleGirl,
      available: true,
    },
    {
      slug: 'memory-match',
      title: 'Memory Match',
      description: COPY.games.memoryMatch,
      available: true,
    },
  ];

  return (
    <div>
      <p className="text-gray-600 mb-6">{COPY.games.minigamesIntro}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((game) => (
          <Link
            key={game.slug}
            href={`/mini-games/${game.slug}`}
            className="group block bg-white/50 border border-white/30 rounded-lg p-4 hover:bg-white/70 transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors">
              {game.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{game.description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">
                {game.available ? 'Available' : 'Coming Soon'}
              </span>
              <span className="text-xs text-pink-600 group-hover:text-pink-700">Play →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Trade Hall Panel (stub)
function TradeHallPanel() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">Trade Hall coming soon...</p>
      <p className="text-sm text-gray-500">Exchange goods with other players</p>
    </div>
  );
}

// Achievements Panel (stub)
function AchievementsPanel() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">Achievements coming soon...</p>
      <p className="text-sm text-gray-500">Track your progress and unlock rewards</p>
    </div>
  );
}

// Profile Panel (stub)
function ProfilePanel() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">Profile coming soon...</p>
      <p className="text-sm text-gray-500">View your journey and statistics</p>
    </div>
  );
}

// Main CubeHub component
export default function CubeHub() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading 3D Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-96 w-full max-w-4xl mx-auto">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="rounded-2xl border border-white/20 bg-gradient-to-br from-pink-50/50 to-gray-50/50"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />

        <Cube />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2 - 0.1}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minAzimuthAngle={-0.1}
          maxAzimuthAngle={0.1}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* DOM Overlay */}
      <HubFaceOverlay />
    </div>
  );
}
