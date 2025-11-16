'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import NextImage from 'next/image';
import cubeConfig from '../cube.map.json';
import MemoryCardDock from './MemoryCardDock';
import AccessibilitySettings, {
  type GameAccessibilitySettings,
  loadAccessibilitySettings,
  applyAccessibilitySettings,
} from '@/app/components/games/AccessibilitySettings';
import ErrorBoundary3D from '@/components/ErrorBoundary3D';
import { useCosmetics } from '@/app/lib/cosmetics/useCosmetics';
import { QuakeAvatarHud } from '@/app/components/arcade/QuakeAvatarHud';

// Import games from registry
import gamesRegistry from '@/lib/games.meta.json';

// Transform registry games to component format
const allGames = gamesRegistry.games
  .filter((game) => game.enabled)
  .sort((a, b) => a.order - b.order)
  .map((game) => ({
    id: game.id,
    label: game.title,
    desc: game.description,
    href: `/mini-games/${game.slug}`,
    icon: game.icon,
    status: 'available',
    category: game.category,
    ageRating: game.ageRating,
    nsfw: game.nsfw || false,
    tooltips: game.tooltips,
    features: game.features,
    slug: game.slug,
  }));

// Function to get thumbnail path for a game
const getGameThumbnail = (gameSlug: string): string => {
  // Map game slugs to their thumbnail files
  const thumbnailMap: Record<string, string> = {
    'petal-samurai': '/assets/games/petal-samurai.svg',
    'memory-match': '/assets/games/memory-match.svg',
    'puzzle-reveal': '/assets/games/puzzle-reveal.svg',
    'bubble-girl': '/assets/games/bubble-girl.svg',
    'petal-storm-rhythm': '/assets/games/petal-storm-rhythm.svg',
    blossomware: '/assets/games/blossomware.svg',
    'dungeon-of-desire': '/assets/games/dungeon-of-desire.svg',
    'thigh-coliseum': '/assets/games/thigh-coliseum.svg',
    'otaku-beat-em-up': '/assets/games/otaku-beat-em-up.svg',
  };

  return thumbnailMap[gameSlug] || '/assets/games/memory-match.svg'; // Fallback
};

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
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  
  // Cosmetics hook for HUD skin
  const { hudSkin, isHydrated } = useCosmetics();

  // Apply accessibility settings on mount and when they change
  useEffect(() => {
    applyAccessibilitySettings(accessibilitySettings);
  }, [accessibilitySettings]);

  // Initialize ambient music
  useEffect(() => {
    if (typeof window !== 'undefined' && accessibilitySettings.volume > 0) {
      ambientAudioRef.current = new Audio();
      ambientAudioRef.current.src = '/sfx/gamecube-menu.mp3';
      ambientAudioRef.current.volume = 0.2; // Subtle ambient volume
      ambientAudioRef.current.loop = true;
      ambientAudioRef.current.preload = 'auto';

      // Start ambient music after a short delay
      const startAmbient = setTimeout(() => {
        if (ambientAudioRef.current) {
          ambientAudioRef.current.play().catch(() => {
            // Ignore audio play errors (user might not have interacted with page yet)
          });
        }
      }, 1000);

      return () => {
        clearTimeout(startAmbient);
        if (ambientAudioRef.current) {
          ambientAudioRef.current.pause();
          ambientAudioRef.current = null;
        }
      };
    }
  }, [accessibilitySettings.volume]);

  // Keyboard navigation for GameCube face buttons
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isLoading) return; // Don't handle keys during loading

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          handleFaceAction('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          handleFaceAction('down');
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handleFaceAction('left');
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleFaceAction('right');
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (currentFace && currentFace !== 'front') {
            handleFaceAction(currentFace);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setCurrentFace('front');
          setActivePanel(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFace, isLoading]);

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

  const handleFaceAction = async (face: FacePosition) => {
    if (face === 'front') {
      setShowFrontOverlay(false);
      return;
    }

    if (isLoading) return; // Prevent multiple clicks during loading

    setCurrentFace(face);
    setIsLoading(true);

    const faceConfig = cubeConfig.faces[face as keyof typeof cubeConfig.faces];

    // Add loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (faceConfig.action === 'route') {
      router.push((faceConfig as any).href);
    } else if (faceConfig.action === 'panel') {
      setActivePanel((faceConfig as any).panel as ActivePanel);
    }

    setIsLoading(false);
  };

  const handleGameSelect = async (game: (typeof allGames)[0]) => {
    // Don't navigate if game is coming soon
    if (game.status === 'coming-soon') {
      return;
    }

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
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at center, #8b2d69 0%, #6b1d4a 25%, #4a0033 50%, #2d0019 100%)',
      }}
      aria-roledescription="3D menu"
      data-test="gc-cube"
    >
      {/* Background and ambient elements */}
      <div className="absolute inset-0">
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/20 via-transparent to-pink-900/20" />

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
        <div className="w-80 p-6 border-r border-pink-400/20">
          <MemoryCardDock />
        </div>

        {/* Center - GameCube */}
        <div className="flex-1 flex items-center justify-center relative">
          {/* GameCube Container */}
          <div className="relative w-96 h-96">
            {/* Central Rotating Chrome Cube - Authentic GameCube Style */}
            <ErrorBoundary3D>
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: '120px',
                  height: '120px',
                  transformStyle: 'preserve-3d',
                  animation: 'gamecubeRotate 8s linear infinite',
                }}
              >
                {/* Cube faces */}
                {['front', 'back', 'right', 'left', 'top', 'bottom'].map((face) => (
                  <div
                    key={face}
                    className="absolute w-full h-full"
                    style={{
                      background: 'linear-gradient(135deg, #e8e8e8 0%, #a0a0a0 50%, #707070 100%)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      transform:
                        face === 'front'
                          ? 'translateZ(60px)'
                          : face === 'back'
                            ? 'translateZ(-60px) rotateY(180deg)'
                            : face === 'right'
                              ? 'rotateY(90deg) translateZ(60px)'
                              : face === 'left'
                                ? 'rotateY(-90deg) translateZ(60px)'
                                : face === 'top'
                                  ? 'rotateX(90deg) translateZ(60px)'
                                  : 'rotateX(-90deg) translateZ(60px)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* Chrome highlights */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
                      }}
                    />
                    <div
                      className="absolute top-1 left-1 right-1 h-px pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)',
                      }}
                    />
                  </div>
                ))}
              </div>
            </ErrorBoundary3D>

            {/* Central Label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-16">
              <h1
                className="text-lg font-bold tracking-wider text-center"
                style={{
                  fontFamily: 'Orbitron, monospace',
                  fontWeight: 900,
                  background: 'linear-gradient(180deg, #fff 0%, #c0c0c0 50%, #808080 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)',
                }}
              >
                OTAKU-MORI
              </h1>
              <p className="text-pink-300 text-xs text-center mt-1">Select a face to navigate</p>
            </div>

            {/* Face Buttons - Positioned around the cube like authentic GameCube */}
            {/* UP - Trade Center */}
            <button
              onClick={() => handleFaceAction('up')}
              onTouchStart={() => {}} // Enable touch events
              className={`absolute top-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        w-16 h-16 md:w-16 md:h-16 sm:w-14 sm:h-14 rounded-full glass-card text-center
                        hover:bg-glass-bg-hover hover:border-glass-border-hover hover:scale-110
                        active:scale-95 touch-manipulation
                        transition-all duration-300 focus:outline-none 
                        focus:ring-2 focus:ring-accent-pink focus:ring-opacity-60
                        ${currentFace === 'up' ? 'ring-2 ring-pink-400 scale-110' : ''}`}
              data-test="gc-face-up"
              aria-label="Open Trade Center"
            >
              <div className="flex flex-col items-center justify-center h-full">
                {isLoading && currentFace === 'up' ? (
                  <div className="animate-spin w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <div className="text-2xl mb-1">
                      <span role="img" aria-label="Trade Center">
                        TC
                      </span>
                    </div>
                    <div className="text-xs font-medium">{cubeConfig.faces.up.label}</div>
                  </>
                )}
              </div>
            </button>

            {/* LEFT - Mini-Games */}
            <button
              onClick={() => handleFaceAction('left')}
              onTouchStart={() => {}} // Enable touch events
              className={`absolute left-8 top-1/2 transform -translate-x-1/2 -translate-y-1/2
                        w-16 h-16 md:w-16 md:h-16 sm:w-14 sm:h-14 rounded-full glass-card text-center
                        hover:bg-glass-bg-hover hover:border-glass-border-hover hover:scale-110
                        active:scale-95 touch-manipulation
                        transition-all duration-300 focus:outline-none 
                        focus:ring-2 focus:ring-accent-pink focus:ring-opacity-60
                        ${currentFace === 'left' ? 'ring-2 ring-pink-400 scale-110' : ''}`}
              data-test="gc-face-left"
              aria-label="Open Mini-Games panel"
            >
              <div className="flex flex-col items-center justify-center h-full">
                {isLoading && currentFace === 'left' ? (
                  <div className="animate-spin w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <div className="text-2xl mb-1">
                      <span role="img" aria-label="Mini-Games">
                        MG
                      </span>
                    </div>
                    <div className="text-xs font-medium">{cubeConfig.faces.left.label}</div>
                  </>
                )}
              </div>
            </button>

            {/* RIGHT - Avatar/Community */}
            <button
              onClick={() => handleFaceAction('right')}
              onTouchStart={() => {}} // Enable touch events
              className={`absolute right-8 top-1/2 transform translate-x-1/2 -translate-y-1/2
                        w-16 h-16 md:w-16 md:h-16 sm:w-14 sm:h-14 rounded-full glass-card text-center
                        hover:bg-glass-bg-hover hover:border-glass-border-hover hover:scale-110
                        active:scale-95 touch-manipulation
                        transition-all duration-300 focus:outline-none 
                        focus:ring-2 focus:ring-accent-pink focus:ring-opacity-60
                        ${currentFace === 'right' ? 'ring-2 ring-pink-400 scale-110' : ''}`}
              data-test="gc-face-right"
              aria-label="Open Avatar / Community Hub"
            >
              <div className="flex flex-col items-center justify-center h-full">
                {isLoading && currentFace === 'right' ? (
                  <div className="animate-spin w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <div className="text-2xl mb-1">
                      <span role="img" aria-label="Avatar Community">
                        AV
                      </span>
                    </div>
                    <div className="text-xs font-medium">{cubeConfig.faces.right.label}</div>
                  </>
                )}
              </div>
            </button>

            {/* DOWN - Music/Extras */}
            <button
              onClick={() => handleFaceAction('down')}
              onTouchStart={() => {}} // Enable touch events
              className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 translate-y-1/2
                        w-16 h-16 md:w-16 md:h-16 sm:w-14 sm:h-14 rounded-full glass-card text-center
                        hover:bg-glass-bg-hover hover:border-glass-border-hover hover:scale-110
                        active:scale-95 touch-manipulation
                        transition-all duration-300 focus:outline-none 
                        focus:ring-2 focus:ring-accent-pink focus:ring-opacity-60
                        ${currentFace === 'down' ? 'ring-2 ring-pink-400 scale-110' : ''}`}
              data-test="gc-face-down"
              aria-label="Open Music / Extras panel"
            >
              <div className="flex flex-col items-center justify-center h-full">
                {isLoading && currentFace === 'down' ? (
                  <div className="animate-spin w-4 h-4 border-2 border-pink-400 border-t-transparent rounded-full"></div>
                ) : (
                  <>
                    <div className="text-2xl mb-1">
                      <span role="img" aria-label="Music Extras">
                        ME
                      </span>
                    </div>
                    <div className="text-xs font-medium">{cubeConfig.faces.down.label}</div>
                  </>
                )}
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
              <div className="text-sm text-muted mb-6 space-y-2">
                <p className="font-semibold text-text-link-hover">How to Navigate:</p>
                <ul className="text-left space-y-1 list-disc list-inside">
                  <li>Use <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Arrow Keys</kbd> or <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">WASD</kbd> to rotate the cube</li>
                  <li>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Enter</kbd> or <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Space</kbd> to select a face</li>
                  <li>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Escape</kbd> to return to front or exit</li>
                </ul>
              </div>
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

                    {/* Game Thumbnail */}
                    <div className="w-full h-20 mb-3 flex items-center justify-center">
                      <NextImage
                        src={getGameThumbnail(game.slug)}
                        alt={`${game.label} thumbnail`}
                        width={80}
                        height={80}
                        className="w-16 h-16 object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          // Fallback to emoji if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<div class="text-2xl">${game.icon}</div>`;
                          }
                        }}
                      />
                    </div>

                    <h3 className="text-primary font-semibold text-sm mb-1 group-hover:text-accent-pink transition-colors">
                      {game.label}
                    </h3>
                    <p className="text-secondary text-xs leading-relaxed opacity-80">{game.desc}</p>

                    {/* Status Badge */}
                    {game.status === 'coming-soon' && (
                      <div className="absolute top-2 right-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                        Coming Soon
                      </div>
                    )}

                    {/* Age Rating Badge */}
                    {game.ageRating && game.status !== 'coming-soon' && (
                      <div className="absolute top-2 right-2 text-xs bg-glass-bg px-2 py-1 rounded">
                        {game.ageRating}
                      </div>
                    )}

                    {/* NSFW Indicator */}
                    {game.nsfw && (
                      <div className="absolute top-2 left-2 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">
                        NSFW
                      </div>
                    )}
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
                          AV
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
                            PR
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
                            💬
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
        @keyframes gamecubeRotate {
          0% {
            transform: translate(-50%, -50%) rotateX(0deg) rotateY(0deg);
          }
          25% {
            transform: translate(-50%, -50%) rotateX(2deg) rotateY(3deg);
          }
          50% {
            transform: translate(-50%, -50%) rotateX(0deg) rotateY(0deg);
          }
          75% {
            transform: translate(-50%, -50%) rotateX(-2deg) rotateY(-3deg);
          }
          100% {
            transform: translate(-50%, -50%) rotateX(0deg) rotateY(0deg);
          }
        }
      `}</style>
      
      {/* Quake HUD (passive mode) - only if unlocked and selected */}
      {isHydrated && hudSkin === 'quake' && (
        <QuakeAvatarHud mode="passive" petals={1000} />
      )}
    </div>
  );
}
