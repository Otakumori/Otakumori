'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import cubeConfig from '../cube.map.json';
import MemoryCardDock from './MemoryCardDock';
import AccessibilitySettings, {
  type GameAccessibilitySettings,
  loadAccessibilitySettings,
  applyAccessibilitySettings,
} from '@/app/components/games/AccessibilitySettings';

// Import the existing games list
const allGames = [
  {
    id: 'samurai-petal-slice',
    label: 'Samurai Petal Slice',
    desc: "Draw the Tetsusaiga's arc…",
    href: '/mini-games/samurai-petal-slice',
    icon: '><',
    status: 'available',
    category: 'action',
  },
  {
    id: 'anime-memory-match',
    label: 'Anime Memory Match',
    desc: 'Recall the faces bound by fate.',
    href: '/mini-games/anime-memory-match',
    icon: '[@]',
    status: 'available',
    category: 'puzzle',
  },
  {
    id: 'bubble-pop-gacha',
    label: 'Bubble-Pop Gacha',
    desc: 'Pop for spy-craft secrets…',
    href: '/mini-games/bubble-pop-gacha',
    icon: '(.)',
    status: 'available',
    category: 'puzzle',
  },
  {
    id: 'rhythm-beat-em-up',
    label: 'Rhythm Beat-Em-Up',
    desc: "Sync to the Moon Prism's pulse.",
    href: '/mini-games/rhythm-beat-em-up',
    icon: '',
    status: 'available',
    category: 'action',
  },
  {
    id: 'memory-match',
    label: 'Memory Match',
    desc: 'Flip cards and match pairs. Perfect recall earns bonuses.',
    href: '/mini-games/memory-match',
    icon: '[]',
    status: 'available',
    category: 'puzzle',
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
type ActivePanel = 'games' | 'extras' | 'avatar-community' | null;

export default function GameCubeHubV2() {
  const [currentFace, setCurrentFace] = useState<FacePosition>('front');
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [showFrontOverlay, setShowFrontOverlay] = useState(true);
  const [loadingGame, setLoadingGame] = useState<string | null>(null);
  const [showAccessibilitySettings, setShowAccessibilitySettings] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState<GameAccessibilitySettings>(
    loadAccessibilitySettings(),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Apply accessibility settings on mount and when they change
  useEffect(() => {
    applyAccessibilitySettings(accessibilitySettings);
  }, [accessibilitySettings]);

  // Check for reduced motion preference
  const prefersReducedMotion =
    accessibilitySettings.reducedMotion ||
    (typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false);

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
          setShowAccessibilitySettings(false);
          break;
        case 'KeyS':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowAccessibilitySettings(true);
          }
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

  const handleAccessibilitySettingsChange = (newSettings: GameAccessibilitySettings) => {
    setAccessibilitySettings(newSettings);
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-br from-purple-900 via-black to-purple-900 overflow-hidden"
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
            <div className="absolute inset-12 glass-card">
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-2xl font-bold text-primary tracking-wider mb-2">OTAKU-MORI</h1>
                <p className="text-secondary text-sm mb-4">
                  {cubeConfig.frontOverlay.enabled && showFrontOverlay
                    ? cubeConfig.frontOverlay.subtitle
                    : 'Select a face to navigate'}
                </p>
                <div className="text-xs text-muted opacity-75">
                  {allGames.length} Games Available
                </div>
              </div>
            </div>

            {/* Face Buttons */}
            {/* UP - Trade Center */}
            <button
              onClick={() => handleFaceAction('up')}
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 
                        px-4 py-2 glass-card text-primary text-sm
                        hover:bg-glass-bg-hover hover:border-glass-border-hover 
                        transition-all duration-300 focus:outline-none 
                        focus:ring-2 focus:ring-accent-pink focus:ring-opacity-60"
              data-test="gc-face-up"
              aria-label="Open Trade Center"
            >
              <div className="text-center">
                <div className="text-lg mb-1">
                  <span role="img" aria-label="Trade Center">
                    <span role="img" aria-label="emoji">�</span>�
                  </span>
                </div>
                <div className="text-xs">{cubeConfig.faces.up.label}</div>
              </div>
            </button>

            {/* LEFT - Mini-Games */}
            <button
              onClick={() => handleFaceAction('left')}
              className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2 
                        px-4 py-2 glass-card text-primary text-sm
                        hover:bg-glass-bg-hover hover:border-glass-border-hover 
                        transition-all duration-300 focus:outline-none 
                        focus:ring-2 focus:ring-accent-pink focus:ring-opacity-60"
              data-test="gc-face-left"
              aria-label="Open Mini-Games panel"
            >
              <div className="text-center">
                <div className="text-lg mb-1">
                  <span role="img" aria-label="Mini-Games">
                    <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
                  </span>
                </div>
                <div className="text-xs">{cubeConfig.faces.left.label}</div>
              </div>
            </button>

            {/* RIGHT - Avatar/Community */}
            <button
              onClick={() => handleFaceAction('right')}
              className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2 
                        px-4 py-2 glass-card text-primary text-sm
                        hover:bg-glass-bg-hover hover:border-glass-border-hover 
                        transition-all duration-300 focus:outline-none 
                        focus:ring-2 focus:ring-accent-pink focus:ring-opacity-60"
              data-test="gc-face-right"
              aria-label="Open Avatar / Community Hub"
            >
              <div className="text-center">
                <div className="text-lg mb-1">
                  <span role="img" aria-label="Avatar Community">
                    <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
                  </span>
                </div>
                <div className="text-xs">{cubeConfig.faces.right.label}</div>
              </div>
            </button>

            {/* DOWN - Music/Extras */}
            <button
              onClick={() => handleFaceAction('down')}
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 
                        px-4 py-2 glass-card text-primary text-sm
                        hover:bg-glass-bg-hover hover:border-glass-border-hover 
                        transition-all duration-300 focus:outline-none 
                        focus:ring-2 focus:ring-accent-pink focus:ring-opacity-60"
              data-test="gc-face-down"
              aria-label="Open Music / Extras panel"
            >
              <div className="text-center">
                <div className="text-lg mb-1">
                  <span role="img" aria-label="Music Extras">
                    <span role="img" aria-label="emoji">�</span>�
                  </span>
                </div>
                <div className="text-xs">{cubeConfig.faces.down.label}</div>
              </div>
            </button>
          </div>
        </div>

        {/* Right Side - Status/Info */}
        <div className="w-80 p-6 border-l border-purple-400/20">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-primary font-semibold mb-2">Hub Status</h3>
              <div className="text-green-400 text-sm">All Systems Online</div>
            </div>

            <div className="text-xs text-secondary space-y-1">
              <div>Current Face: {currentFace}</div>
              <div>Games Available: {allGames.length}</div>
              <div>Use WASD or Arrow Keys</div>
              <div>Press Enter to Select</div>
              <div>Press Esc to Close</div>
              <div>Ctrl+S for Settings</div>
            </div>

            <div className="pt-4 border-t border-purple-400/20">
              <button
                onClick={() => setShowAccessibilitySettings(true)}
                className="w-full p-3 glass-card hover:bg-glass-bg-hover 
                         text-primary text-sm transition-all duration-300 
                         focus:outline-none focus:ring-2 focus:ring-accent-pink focus:ring-opacity-50"
                aria-label="Open accessibility settings"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg" role="img" aria-label="Accessibility">
                    ♿
                  </span>
                  <span>Accessibility Settings</span>
                </div>
              </button>
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
            <div className="text-center text-primary max-w-md p-8">
              <h2 className="text-3xl font-bold mb-4">{cubeConfig.frontOverlay.title}</h2>
              <p className="text-secondary mb-6">{cubeConfig.frontOverlay.subtitle}</p>
              <div className="text-sm text-muted">Click anywhere or press Escape to continue</div>
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
            <div className="glass-card max-w-6xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">Mini-Games</h2>
                <button
                  onClick={() => setActivePanel(null)}
                  className="text-muted hover:text-primary transition-colors text-xl"
                  aria-label="Close games panel"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allGames.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => handleGameSelect(game)}
                    disabled={loadingGame === game.id}
                    className="p-4 glass-card 
                              hover:bg-glass-bg-hover hover:border-glass-border-hover 
                              disabled:opacity-50 disabled:cursor-not-allowed
                              transition-all duration-300 text-left group relative"
                  >
                    {loadingGame === game.id && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        <div className="text-white text-sm">Loading disc...</div>
                      </div>
                    )}

                    <div className="text-2xl mb-2">{game.icon}</div>
                    <h3 className="text-primary font-semibold text-sm mb-1 group-hover:text-accent-pink transition-colors">
                      {game.label}
                    </h3>
                    <p className="text-secondary text-xs leading-relaxed opacity-80">{game.desc}</p>
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
            <div className="glass-card max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">Music & Extras</h2>
                <button
                  onClick={() => setActivePanel(null)}
                  className="text-muted hover:text-primary transition-colors text-xl"
                  aria-label="Close music panel"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-accent-pink">Sound Test</h3>
                  <div className="space-y-2">
                    <button className="w-full p-3 glass-card hover:bg-glass-bg-hover text-primary text-left transition-colors">
                      Main Theme
                    </button>
                    <button className="w-full p-3 glass-card hover:bg-glass-bg-hover text-primary text-left transition-colors">
                      Game Selection
                    </button>
                    <button className="w-full p-3 glass-card hover:bg-glass-bg-hover text-primary text-left transition-colors">
                      Battle Theme
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-accent-pink">Bonus Features</h3>
                  <div className="space-y-2">
                    <button className="w-full p-3 glass-card hover:bg-glass-bg-hover text-primary text-left transition-colors">
                      Statistics
                    </button>
                    <button className="w-full p-3 glass-card hover:bg-glass-bg-hover text-primary text-left transition-colors">
                      Achievements
                    </button>
                    <button className="w-full p-3 glass-card hover:bg-glass-bg-hover text-primary text-left transition-colors">
                      Gallery
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar/Community Panel */}
      <AnimatePresence>
        {activePanel === 'avatar-community' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-end justify-center z-30 p-8"
          >
            <div className="glass-card max-w-6xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-primary">Avatar & Community Hub</h2>
                <button
                  onClick={() => setActivePanel(null)}
                  className="text-muted hover:text-primary transition-colors text-xl"
                  aria-label="Close community panel"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Avatar Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-accent-pink">Character Creator</h3>

                  <div className="glass-card p-6">
                    <div className="text-center mb-4">
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <span className="text-2xl" role="img" aria-label="Character Avatar">
                          <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
                        </span>
                      </div>
                      <h4 className="text-primary font-medium">Ultra Detailed Character Creator</h4>
                      <p className="text-secondary text-sm mt-1">Code Vein-level customization</p>
                    </div>

                    <button
                      onClick={() => router.push('/adults/editor')}
                      className="w-full p-3 btn-primary"
                    >
                      Create Your Avatar
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-primary">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => router.push('/profile')}
                        className="p-3 glass-card hover:bg-glass-bg-hover text-primary text-left transition-colors"
                      >
                        <div className="text-lg mb-1">
                          <span role="img" aria-label="Profile">
                            <span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>
                          </span>
                        </div>
                        <div className="text-sm font-medium">View Profile</div>
                      </button>
                      <button
                        onClick={() => router.push('/community')}
                        className="p-3 glass-card hover:bg-glass-bg-hover text-primary text-left transition-colors"
                      >
                        <div className="text-lg mb-1">
                          <span role="img" aria-label="Community">
                            <span role="img" aria-label="emoji">�</span>�
                          </span>
                        </div>
                        <div className="text-sm font-medium">Community</div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Community Section */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-accent-pink">Community Features</h3>

                  <div className="space-y-4">
                    <div className="glass-card p-4">
                      <h4 className="text-primary font-medium mb-2">Avatar Showcase</h4>
                      <p className="text-secondary text-sm mb-3">
                        Share your creations with the community
                      </p>
                      <button className="w-full p-2 btn-secondary text-sm">Browse Gallery</button>
                    </div>

                    <div className="glass-card p-4">
                      <h4 className="text-primary font-medium mb-2">Gated Content</h4>
                      <p className="text-secondary text-sm mb-3">
                        Access adult-only avatar features
                      </p>
                      <button className="w-full p-2 btn-secondary text-sm">Verify Age</button>
                    </div>

                    <div className="glass-card p-4">
                      <h4 className="text-primary font-medium mb-2">Avatar Packs</h4>
                      <p className="text-secondary text-sm mb-3">Premium outfits and accessories</p>
                      <button className="w-full p-2 btn-secondary text-sm">Shop Packs</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Accessibility Settings Modal */}
      <AccessibilitySettings
        isOpen={showAccessibilitySettings}
        onClose={() => setShowAccessibilitySettings(false)}
        onSettingsChange={handleAccessibilitySettingsChange}
        initialSettings={accessibilitySettings}
      />

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
