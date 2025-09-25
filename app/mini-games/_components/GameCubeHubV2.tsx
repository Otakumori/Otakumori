'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import cubeConfig from '../cube.map.json';
import MemoryCardDock from './MemoryCardDock';

// Import the existing games list
const allGames = [
  {
    id: 'samurai-petal-slice',
    label: 'Samurai Petal Slice',
    desc: "Draw the Tetsusaiga's arc…",
    href: '/mini-games/samurai-petal-slice',
    icon: '><',
    status: 'available',
  },
  {
    id: 'anime-memory-match',
    label: 'Anime Memory Match',
    desc: 'Recall the faces bound by fate.',
    href: '/mini-games/anime-memory-match',
    icon: '[@]',
    status: 'available',
  },
  {
    id: 'bubble-pop-gacha',
    label: 'Bubble-Pop Gacha',
    desc: 'Pop for spy-craft secrets…',
    href: '/mini-games/bubble-pop-gacha',
    icon: '(.)',
    status: 'available',
  },
  {
    id: 'rhythm-beat-em-up',
    label: 'Rhythm Beat-Em-Up',
    desc: "Sync to the Moon Prism's pulse.",
    href: '/mini-games/rhythm-beat-em-up',
    icon: '♪',
    status: 'available',
  },
  {
    id: 'memory-match',
    label: 'Memory Match',
    desc: 'Flip cards and match pairs. Perfect recall earns bonuses.',
    href: '/mini-games/memory-match',
    icon: '[]',
    status: 'available',
  },
  {
    id: 'bubble-girl',
    label: 'Bubble Girl',
    desc: 'Spawn bubbles, float and score. Sandbox or challenge mode.',
    href: '/mini-games/bubble-girl',
    icon: '(.)',
    status: 'available',
  },
  {
    id: 'petal-storm-rhythm',
    label: 'Petal Storm Rhythm',
    desc: 'Stormy rhythm playlist—precision timing for petals.',
    href: '/mini-games/petal-storm-rhythm',
    icon: '~',
    status: 'available',
  },
  {
    id: 'bubble-ragdoll',
    label: 'Bubble Ragdoll',
    desc: 'Toss the ragdoll into bubbles. Survive the chaos.',
    href: '/mini-games/bubble-ragdoll',
    icon: 'o',
    status: 'available',
  },
  {
    id: 'blossomware',
    label: 'Blossomware Playlist',
    desc: 'Chaotic micro-sessions—keep your petal streak alive.',
    href: '/mini-games/blossomware',
    icon: '≡',
    status: 'available',
  },
  {
    id: 'dungeon-of-desire',
    label: 'Dungeon of Desire',
    desc: 'Descend into the dungeon. Survive rooms and claim rewards.',
    href: '/mini-games/dungeon-of-desire',
    icon: 'x',
    status: 'available',
  },
  {
    id: 'maid-cafe-manager',
    label: 'Maid Cafe Manager',
    desc: 'Manage shifts and keep guests smiling.',
    href: '/mini-games/maid-cafe-manager',
    icon: 'U',
    status: 'available',
  },
  {
    id: 'thigh-coliseum',
    label: 'Thigh Coliseum',
    desc: 'Enter the arena. Win rounds and advance the bracket.',
    href: '/mini-games/thigh-coliseum',
    icon: '()',
    status: 'available',
  },
  {
    id: 'puzzle-reveal',
    label: 'Puzzle Reveal',
    desc: 'Clear the fog to reveal the art. Watch your energy.',
    href: '/mini-games/puzzle-reveal',
    icon: '+',
    status: 'available',
  },
  {
    id: 'petal-samurai',
    label: 'Petal Samurai',
    desc: 'Slash petals with style. Master storm and endless modes.',
    href: '/mini-games/petal-samurai',
    icon: '><',
    status: 'available',
  },
];

type FacePosition = 'front' | 'up' | 'left' | 'right' | 'down';
type ActivePanel = 'games' | 'extras' | null;

export default function GameCubeHubV2() {
  const [currentFace, setCurrentFace] = useState<FacePosition>('front');
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [showFrontOverlay, setShowFrontOverlay] = useState(true);
  const [loadingGame, setLoadingGame] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePanel) {
        if (e.code === 'Escape') {
          setActivePanel(null);
        }
        return;
      }

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          handleFaceAction('up');
          break;
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          handleFaceAction('left');
          break;
        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          handleFaceAction('right');
          break;
        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          handleFaceAction('down');
          break;
        case 'Enter':
        case 'Space':
          e.preventDefault();
          handleFaceAction(currentFace);
          break;
        case 'Escape':
          setActivePanel(null);
          setShowFrontOverlay(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentFace, activePanel]);

  const handleFaceAction = (face: FacePosition) => {
    if (face === 'front') {
      setShowFrontOverlay(false);
      return;
    }

    setCurrentFace(face);
    const faceConfig = cubeConfig.faces[face as keyof typeof cubeConfig.faces];

    if (faceConfig.action === 'route') {
      router.push((faceConfig as any).href);
    } else if (faceConfig.action === 'panel') {
      setActivePanel((faceConfig as any).panel as ActivePanel);
    }
  };

  const handleGameSelect = async (game: (typeof allGames)[0]) => {
    setLoadingGame(game.id);

    // Disc load animation
    await new Promise((resolve) => setTimeout(resolve, 300));

    router.push(game.href);
  };

  const dismissOverlay = () => {
    if (cubeConfig.frontOverlay.dismissible) {
      setShowFrontOverlay(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black overflow-hidden"
      aria-roledescription="3D menu"
      data-test="gc-cube"
    >
      {/* Background and ambient elements */}
      <div className="absolute inset-0">
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-purple-900/20" />

        {/* Minimal particle field */}
        {!prefersReducedMotion && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-pink-400/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `twinkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 2}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Memory Cards */}
        <div className="w-80 p-6 border-r border-purple-400/20">
          <MemoryCardDock />
        </div>

        {/* Center - GameCube */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* GameCube Container */}
          <div className="relative w-96 h-96">
            {/* Central Area */}
            <div className="absolute inset-12 bg-gradient-to-br from-black/60 to-purple-900/40 rounded-2xl border border-purple-300/30 backdrop-blur-sm">
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-2xl font-bold text-white tracking-wider mb-2 font-[Roboto_Condensed]">
                  OTAKU-MORI
                </h1>
                <p className="text-purple-200 text-sm mb-4">
                  {cubeConfig.frontOverlay.enabled && showFrontOverlay
                    ? cubeConfig.frontOverlay.subtitle
                    : 'Select a face to navigate'}
                </p>
                <div className="text-xs text-purple-300 opacity-75">
                  {allGames.length} Games Available
                </div>
              </div>
            </div>

            {/* Face Buttons */}
            {/* UP - Trade Center */}
            <button
              onClick={() => handleFaceAction('up')}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 
                        px-4 py-2 bg-gradient-to-b from-purple-500/30 to-purple-600/40 
                        rounded-lg border border-purple-300/30 text-white text-sm
                        hover:from-purple-400/40 hover:to-purple-500/50 transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-60"
              data-test="gc-face-up"
              aria-label="Open Trade Center"
            >
              <div className="text-center">
                <div className="text-lg mb-1">⚖️</div>
                <div className="text-xs">{cubeConfig.faces.up.label}</div>
              </div>
            </button>

            {/* LEFT - Mini-Games */}
            <button
              onClick={() => handleFaceAction('left')}
              className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2 
                        px-4 py-2 bg-gradient-to-r from-purple-500/30 to-purple-600/40 
                        rounded-lg border border-purple-300/30 text-white text-sm
                        hover:from-purple-400/40 hover:to-purple-500/50 transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-60"
              data-test="gc-face-left"
              aria-label="Open Mini-Games panel"
            >
              <div className="text-center">
                <div className="text-lg mb-1">🎮</div>
                <div className="text-xs">{cubeConfig.faces.left.label}</div>
              </div>
            </button>

            {/* RIGHT - Avatar/Community */}
            <button
              onClick={() => handleFaceAction('right')}
              className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 
                        px-4 py-2 bg-gradient-to-l from-purple-500/30 to-purple-600/40 
                        rounded-lg border border-purple-300/30 text-white text-sm
                        hover:from-purple-400/40 hover:to-purple-500/50 transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-60"
              data-test="gc-face-right"
              aria-label="Open Avatar / Community Hub"
            >
              <div className="text-center">
                <div className="text-lg mb-1">👥</div>
                <div className="text-xs">{cubeConfig.faces.right.label}</div>
              </div>
            </button>

            {/* DOWN - Music/Extras */}
            <button
              onClick={() => handleFaceAction('down')}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 
                        px-4 py-2 bg-gradient-to-t from-purple-500/30 to-purple-600/40 
                        rounded-lg border border-purple-300/30 text-white text-sm
                        hover:from-purple-400/40 hover:to-purple-500/50 transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-60"
              data-test="gc-face-down"
              aria-label="Open Music / Extras panel"
            >
              <div className="text-center">
                <div className="text-lg mb-1">🎵</div>
                <div className="text-xs">{cubeConfig.faces.down.label}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Side - Status/Info */}
        <div className="w-80 p-6 border-l border-purple-400/20">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-white font-semibold mb-2">Hub Status</h3>
              <div className="text-green-400 text-sm">All Systems Online</div>
            </div>

            <div className="text-xs text-purple-300 space-y-1">
              <div>Current Face: {currentFace}</div>
              <div>Games Available: {allGames.length}</div>
              <div>Use WASD or Arrow Keys</div>
              <div>Press Enter to Select</div>
              <div>Press Esc to Close</div>
            </div>
          </div>
        </div>
      </div>

      {/* Front Overlay */}
      <AnimatePresence>
        {cubeConfig.frontOverlay.enabled && showFrontOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20"
            onClick={dismissOverlay}
          >
            <div className="text-center text-white max-w-md p-8">
              <h2 className="text-3xl font-bold mb-4">{cubeConfig.frontOverlay.title}</h2>
              <p className="text-purple-200 mb-6">{cubeConfig.frontOverlay.subtitle}</p>
              <div className="text-sm text-purple-300">
                Click anywhere or press Escape to continue
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Games Panel */}
      <AnimatePresence>
        {activePanel === 'games' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-end justify-center z-30 p-8"
          >
            <div className="bg-gradient-to-br from-purple-900/90 to-black/90 rounded-2xl border border-purple-300/30 p-6 max-w-6xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Mini-Games</h2>
                <button
                  onClick={() => setActivePanel(null)}
                  className="text-purple-300 hover:text-white transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handleGameSelect(game)}
                    disabled={loadingGame === game.id}
                    className="p-4 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl border border-purple-400/30 
                              hover:from-purple-500/30 hover:to-purple-700/30 hover:border-purple-300/50 
                              disabled:opacity-50 disabled:cursor-not-allowed
                              transition-all duration-300 text-left group relative"
                  >
                    {loadingGame === game.id && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        <div className="text-white text-sm">Loading disc...</div>
                      </div>
                    )}

                    <div className="text-2xl mb-2">{game.icon}</div>
                    <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-pink-300 transition-colors">
                      {game.label}
                    </h3>
                    <p className="text-purple-200 text-xs leading-relaxed opacity-80">
                      {game.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music/Extras Panel */}
      <AnimatePresence>
        {activePanel === 'extras' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-end justify-center z-30 p-8"
          >
            <div className="bg-gradient-to-br from-purple-900/90 to-black/90 rounded-2xl border border-purple-300/30 p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Music & Extras</h2>
                <button
                  onClick={() => setActivePanel(null)}
                  className="text-purple-300 hover:text-white transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-pink-300">Sound Test</h3>
                  <div className="space-y-2">
                    <button className="w-full p-3 bg-purple-600/20 hover:bg-purple-500/30 rounded-lg text-white text-left transition-colors">
                      🎵 Main Theme
                    </button>
                    <button className="w-full p-3 bg-purple-600/20 hover:bg-purple-500/30 rounded-lg text-white text-left transition-colors">
                      🎮 Game Selection
                    </button>
                    <button className="w-full p-3 bg-purple-600/20 hover:bg-purple-500/30 rounded-lg text-white text-left transition-colors">
                      ⚔️ Battle Theme
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-pink-300">Bonus Features</h3>
                  <div className="space-y-2">
                    <button className="w-full p-3 bg-purple-600/20 hover:bg-purple-500/30 rounded-lg text-white text-left transition-colors">
                      📊 Statistics
                    </button>
                    <button className="w-full p-3 bg-purple-600/20 hover:bg-purple-500/30 rounded-lg text-white text-left transition-colors">
                      🏆 Achievements
                    </button>
                    <button className="w-full p-3 bg-purple-600/20 hover:bg-purple-500/30 rounded-lg text-white text-left transition-colors">
                      🎨 Gallery
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility fallback navigation */}
      <div className="sr-only">
        <h2>Navigation Menu</h2>
        <ul>
          <li>
            <button onClick={() => handleFaceAction('up')}>Trade Center</button>
          </li>
          <li>
            <button onClick={() => handleFaceAction('left')}>Mini-Games</button>
          </li>
          <li>
            <button onClick={() => handleFaceAction('right')}>Avatar / Community Hub</button>
          </li>
          <li>
            <button onClick={() => handleFaceAction('down')}>Music / Extras</button>
          </li>
        </ul>
      </div>

      <style>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
