/**
 * Petal Hero - Guitar Hero-style Lane Rhythm Game
 * 
 * Core Fantasy: Hit notes in time for petals and rank - precision timing rhythm game.
 * 
 * Game Flow: menu → instructions → playing → results
 * Win Condition: Complete track with health > 0
 * Lose Condition: Health reaches 0
 * 
 * Progression: Difficulty increases with track selection (easy/normal/hard/expert)
 * Scoring: Base points per hit, accuracy bonuses, combo multipliers
 * Petals: Awarded on completion based on score, accuracy, combo, difficulty
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useGameAvatar } from '../_shared/useGameAvatarWithConfig';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { GameOverlay } from '../_shared/GameOverlay';
import { PhysicsAvatarCanvas, PhysicsAvatarCanvasRef } from '../_shared/PhysicsAvatarCanvas';
import { useGameHud } from '../_shared/useGameHud';
import { usePetalEarn } from '../_shared/usePetalEarn';
import { getGameVisualProfile, applyVisualProfile, getGameDisplayName } from '../_shared/gameVisuals';
import { MiniGameFrame } from '../_shared/MiniGameFrame';
import { usePetalBalance } from '@/app/hooks/usePetalBalance';
import { AvatarPresetChoice, type AvatarChoice } from '../_shared/AvatarPresetChoice';
import { getGameAvatarUsage } from '../_shared/miniGameConfigs';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';
import { createPetalBurst, updatePetalParticles, type PetalParticle } from '../_shared/vfx';

interface Note {
  id: string;
  lane: number;
  time: number;
  type: 'normal' | 'hold' | 'slide';
  duration?: number; // For hold notes
  direction?: 'left' | 'right'; // For slide notes
  hit?: boolean;
  accuracy?: 'perfect' | 'great' | 'good' | 'miss';
}

interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  duration: number;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  notes: Note[];
  preview?: string;
}

const SAMPLE_TRACKS: Track[] = [
  {
    id: 'sakura-dreams',
    title: 'Sakura Dreams',
    artist: 'Otaku-mori Orchestra',
    bpm: 128,
    duration: 180,
    difficulty: 'normal',
    notes: [],
  },
  {
    id: 'neon-pulse',
    title: 'Neon Pulse',
    artist: 'Digital Harmony',
    bpm: 140,
    duration: 165,
    difficulty: 'hard',
    notes: [],
  },
  {
    id: 'ancient-melody',
    title: 'Ancient Melody',
    artist: 'Mystic Winds',
    bpm: 92,
    duration: 220,
    difficulty: 'easy',
    notes: [],
  },
];

export default function PetalStormRhythm() {
  // Game configuration - difficulty tuning parameters (must be declared before state)
  const GAME_CONFIG = {
    LANE_COUNT: 5, // Guitar Hero-style: 5 lanes
    INITIAL_HEALTH: 100,
    HEALTH_DAMAGE_PER_MISS: 10,
    HEALTH_DAMAGE_PER_BAD_HIT: 5,
    COMBO_MULTIPLIER_THRESHOLDS: {
      x2: 10,
      x3: 25,
      x4: 50,
    },
    SCORE_PERFECT: 1000,
    SCORE_GREAT: 500,
    SCORE_GOOD: 200,
    SCORE_MISS: 0,
    NOTE_TRAVEL_TIME: 2000, // milliseconds
    PREPARATION_DELAY: 2000, // milliseconds before first note
  } as const;

  const [gameState, setGameState] = useState<'instructions' | 'menu' | 'playing' | 'win' | 'lose' | 'paused'>('menu');
  const [selectedTrack, setSelectedTrack] = useState<Track>(SAMPLE_TRACKS[0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [notes, setNotes] = useState<Note[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [accuracy, setAccuracy] = useState({ perfect: 0, great: 0, good: 0, miss: 0 });
  const [health, setHealth] = useState<number>(GAME_CONFIG.INITIAL_HEALTH);
  const [multiplier, setMultiplier] = useState(1);
  const [finalScore, setFinalScore] = useState(0);
  const [petalReward, setPetalReward] = useState<number | null>(null);
  
  // Hit VFX state
  const [laneFlashes, setLaneFlashes] = useState<Record<number, { type: 'perfect' | 'great' | 'good' | 'miss'; time: number }>>({});
  const [petalParticles, setPetalParticles] = useState<PetalParticle[]>([]);
  const physicsAvatarRef = useRef<PhysicsAvatarCanvasRef>(null);
  
  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [showAvatarChoice, setShowAvatarChoice] = useState(false);

  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('petal-storm-rhythm');
  const { avatarConfig, representationConfig, isLoading: avatarLoading } = useGameAvatar('petal-storm-rhythm', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile: avatarChoice === 'creator' ? selectedAvatar : null,
  });
  
  // Get real petal balance for Quake HUD
  const { balance: petalBalance } = usePetalBalance();
  
  // Handle avatar choice
  const handleAvatarChoice = useCallback((choice: AvatarChoice, avatar?: AvatarProfile | any) => {
    setAvatarChoice(choice);
    if (choice === 'creator' && avatar) {
      setSelectedAvatar(avatar);
    }
    setShowAvatarChoice(false);
    setGameState('instructions');
  }, []);

  // Refs for game loop
  const gameLoopRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const _audioRef = useRef<HTMLAudioElement | null>(null);

  // Visual profile and HUD
  const visualProfile = getGameVisualProfile('petal-storm-rhythm');
  const { backgroundStyle } = applyVisualProfile(visualProfile);
  const { Component: HudComponent, isQuakeHud, props: hudProps } = useGameHud('petal-storm-rhythm');
  const { earnPetals } = usePetalEarn();

  // Lane positions (4 lanes)
  const LANE_COUNT = GAME_CONFIG.LANE_COUNT;
  const LANES = Array.from({ length: LANE_COUNT }, (_, i) => i);

  // Timing windows (in milliseconds)
  const TIMING_WINDOWS = {
    perfect: 50,
    great: 100,
    good: 150,
    miss: 200,
  };

  // Generate notes for a track
  const generateNotes = useCallback((track: Track): Note[] => {
    const notes: Note[] = [];
    const noteInterval = 60000 / track.bpm; // ms per beat
    const totalBeats = Math.floor((track.duration * 1000) / noteInterval);

    for (let beat = 0; beat < totalBeats; beat++) {
      // Generate notes based on difficulty
      const shouldAddNote = Math.random() < getDifficulty(track.difficulty);

      if (shouldAddNote) {
        const note: Note = {
          id: `note_${beat}_${Math.random()}`,
          lane: Math.floor(Math.random() * LANE_COUNT),
          time: beat * noteInterval + 2000, // 2s delay for preparation
          type: 'normal',
        };

        // Add special notes based on difficulty
        if (track.difficulty === 'hard' || track.difficulty === 'expert') {
          const random = Math.random();
          if (random < 0.1) {
            note.type = 'hold';
            note.duration = noteInterval * 2; // 2 beat hold
          } else if (random < 0.15) {
            note.type = 'slide';
            note.direction = Math.random() < 0.5 ? 'left' : 'right';
          }
        }

        notes.push(note);
      }
    }

    return notes.sort((a, b) => a.time - b.time);
  }, []);

  const getDifficulty = (difficulty: string): number => {
    switch (difficulty) {
      case 'easy':
        return 0.3;
      case 'normal':
        return 0.5;
      case 'hard':
        return 0.7;
      case 'expert':
        return 0.9;
      default:
        return 0.5;
    }
  };

  // End game (game over)
  const endGame = useCallback(() => {
    setGameState('lose');

    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  // Complete game
  const completeGame = useCallback(async () => {
    setGameState('win');

    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }

    const totalNotes = accuracy.perfect + accuracy.great + accuracy.good + accuracy.miss;
    const finalAccuracy =
      totalNotes > 0 ? (accuracy.perfect + accuracy.great + accuracy.good) / totalNotes : 0;

    // Calculate final score with bonuses
    const comboBonus = maxCombo * 100;
    const accuracyBonus = Math.round(finalAccuracy * 10000);
    const healthBonus = health * 50;
    const finalScore = score + comboBonus + accuracyBonus + healthBonus;
    setFinalScore(finalScore);

    // Award completion petals using hook
    const result = await earnPetals({
      gameId: 'petal-storm-rhythm',
      score: finalScore,
      metadata: {
        accuracy: finalAccuracy,
        combo: maxCombo,
        difficulty: selectedTrack.difficulty,
        track: selectedTrack.id,
      },
    });
    
    if (result.success) {
      setPetalReward(result.earned);
    }

    // Submit to leaderboard
    try {
      await fetch('/api/v1/leaderboards/petal-storm-rhythm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: finalScore,
          metadata: {
            accuracy: finalAccuracy,
            maxCombo,
            track: selectedTrack.id,
            difficulty: selectedTrack.difficulty,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  }, [score, accuracy, maxCombo, health, selectedTrack]);

  // Game loop
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    setCurrentTime(elapsed);

    // Check for missed notes
    setNotes((prev) =>
      prev.map((note) => {
        if (!note.hit && elapsed > note.time + TIMING_WINDOWS.miss) {
          // Missed note
          setCombo(0);
          setMultiplier(1);
          setHealth((h) => Math.max(0, h - GAME_CONFIG.HEALTH_DAMAGE_PER_MISS));
          setAccuracy((acc) => ({ ...acc, miss: acc.miss + 1 }));

          return { ...note, hit: true, accuracy: 'miss' };
        }
        return note;
      }),
    );

    // Check for game over
    if (health <= 0) {
      endGame();
      return;
    }

    // Check for completion
    if (elapsed > selectedTrack.duration * 1000 + 2000) {
      completeGame();
      return;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, health, selectedTrack.duration, endGame, completeGame]);

  // Initialize game
  const startGame = useCallback(() => {
        const trackNotes = generateNotes(selectedTrack);
    setNotes(trackNotes);
    setCurrentTime(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setAccuracy({ perfect: 0, great: 0, good: 0, miss: 0 });
    setHealth(GAME_CONFIG.INITIAL_HEALTH);
    setMultiplier(1);
    setPetalReward(null);

    // Don't set to 'playing' here - let handleStart do it
    startTimeRef.current = Date.now();

    // Start game loop
    gameLoop();
  }, [selectedTrack, gameLoop]);

  // Handle note hit
  const hitNote = useCallback(
    (laneIndex: number) => {
      if (gameState !== 'playing') return;

      const currentTimeMs = currentTime;

      // Find the closest note in this lane
      const laneNotes = notes.filter(
        (note) =>
          note.lane === laneIndex &&
          !note.hit &&
          Math.abs(currentTimeMs - note.time) <= TIMING_WINDOWS.miss,
      );

      if (laneNotes.length === 0) {
        // Miss - no note hit
        setLaneFlashes((prev) => ({
          ...prev,
          [laneIndex]: { type: 'miss', time: Date.now() },
        }));
        setTimeout(() => {
          setLaneFlashes((prev) => {
            const updated = { ...prev };
            delete updated[laneIndex];
            return updated;
          });
        }, 300);
        return;
      }

      const closestNote = laneNotes.reduce((closest, note) =>
        Math.abs(currentTimeMs - note.time) < Math.abs(currentTimeMs - closest.time)
          ? note
          : closest,
      );

      const timeDiff = Math.abs(currentTimeMs - closestNote.time);
      let accuracy: 'perfect' | 'great' | 'good' | 'miss';
      let points = 0;

      // Determine accuracy
      if (timeDiff <= TIMING_WINDOWS.perfect) {
        accuracy = 'perfect';
        points = GAME_CONFIG.SCORE_PERFECT;
      } else if (timeDiff <= TIMING_WINDOWS.great) {
        accuracy = 'great';
        points = GAME_CONFIG.SCORE_GREAT;
      } else if (timeDiff <= TIMING_WINDOWS.good) {
        accuracy = 'good';
        points = GAME_CONFIG.SCORE_GOOD;
      } else {
        accuracy = 'miss';
        points = GAME_CONFIG.SCORE_MISS;
      }

      // Apply physics impact based on accuracy
      if (physicsAvatarRef.current) {
        const impactForce = 
          accuracy === 'perfect'
            ? { x: (Math.random() - 0.5) * 3, y: -4 - combo * 0.1 } // Strong upward impact for perfect
            : accuracy === 'great'
              ? { x: (Math.random() - 0.5) * 2, y: -3 }
              : accuracy === 'good'
                ? { x: (Math.random() - 0.5) * 1.5, y: -2 }
                : { x: (Math.random() - 0.5) * 1, y: 1 }; // Slight downward for miss
        physicsAvatarRef.current.applyImpact(impactForce, 'chest');
      }

      // Trigger hit VFX
      setLaneFlashes((prev) => ({
        ...prev,
        [laneIndex]: { type: accuracy, time: Date.now() },
      }));
      
      // Create petal burst for perfect/great hits
      if (accuracy === 'perfect' || accuracy === 'great') {
        const laneWidth = 100; // Approximate lane width
        const laneCenterX = (laneIndex + 0.5) * laneWidth;
        const hitZoneY = window.innerHeight - 120; // Hit zone position
        
        const burst = createPetalBurst(laneCenterX, hitZoneY, accuracy === 'perfect' ? 8 : 4, {
          speed: accuracy === 'perfect' ? 3 : 2,
          spread: Math.PI,
        });
        setPetalParticles((prev) => [...prev, ...burst]);
      }
      
      // Clear flash after animation
      setTimeout(() => {
        setLaneFlashes((prev) => {
          const updated = { ...prev };
          delete updated[laneIndex];
          return updated;
        });
      }, accuracy === 'perfect' ? 400 : accuracy === 'great' ? 300 : 200);

      // Update note
      setNotes((prev) =>
        prev.map((note) => (note.id === closestNote.id ? { ...note, hit: true, accuracy } : note)),
      );

      // Update score and combo
      if (accuracy !== 'miss') {
        const newCombo = combo + 1;
        setCombo(newCombo);
        setScore((prev) => prev + points * multiplier);
        setAccuracy((acc) => ({ ...acc, [accuracy]: acc[accuracy] + 1 }));

        // Update multiplier based on combo thresholds
        if (newCombo >= GAME_CONFIG.COMBO_MULTIPLIER_THRESHOLDS.x4) {
          setMultiplier(4);
        } else if (newCombo >= GAME_CONFIG.COMBO_MULTIPLIER_THRESHOLDS.x3) {
          setMultiplier(3);
        } else if (newCombo >= GAME_CONFIG.COMBO_MULTIPLIER_THRESHOLDS.x2) {
          setMultiplier(2);
        } else {
          setMultiplier(1);
        }
      } else {
        setCombo(0);
        setMultiplier(1);
        setHealth((h: number) => Math.max(0, h - GAME_CONFIG.HEALTH_DAMAGE_PER_MISS));
      }

      // Update max combo
      setMaxCombo((prev) => Math.max(prev, combo));
    },
    [gameState, currentTime, notes, combo, multiplier, score],
  );
  
  // Update petal particles
  useEffect(() => {
    if (gameState !== 'playing' || petalParticles.length === 0) {
      if (petalParticles.length > 0) {
        setPetalParticles([]);
      }
      return;
    }
    
    let animationId: number | null = null;
    let lastTime = performance.now();
    let isRunning = true;
    
    const updateParticles = () => {
      if (!isRunning) return;
      
      const now = performance.now();
      const deltaTime = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;
      
      setPetalParticles((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        const updated = updatePetalParticles(prev, deltaTime, 0.1);
        if (updated.length > 0 && isRunning) {
          animationId = requestAnimationFrame(updateParticles);
        }
        return updated;
      });
    };
    
    animationId = requestAnimationFrame(updateParticles);
    
    return () => {
      isRunning = false;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, petalParticles.length]);

  // Keyboard controls (5 lanes: A, S, D, F, G)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      switch (e.key) {
        case 'a':
        case 'A':
          hitNote(0);
          break;
        case 's':
        case 'S':
          hitNote(1);
          break;
        case 'd':
        case 'D':
          hitNote(2);
          break;
        case 'f':
        case 'F':
          hitNote(3);
          break;
        case 'g':
        case 'G':
          hitNote(4);
          break;
        case ' ':
          e.preventDefault();
          setGameState((prev) => (prev === 'playing' ? 'paused' : 'playing'));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, hitNote]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, []);

  // Format score
  const formatScore = (num: number) => num.toLocaleString();

  // Get visible notes
  const visibleNotes = notes.filter((note) => {
    const notePosition = (currentTime - note.time + GAME_CONFIG.NOTE_TRAVEL_TIME) / GAME_CONFIG.NOTE_TRAVEL_TIME;
    return notePosition >= -0.1 && notePosition <= 1.1 && !note.hit;
  });

  const handleRestart = useCallback(() => {
    startGame();
  }, [startGame]);

  const handleStart = useCallback(() => {
    // Check if avatar choice is needed
    if (avatarUsage === 'avatar-or-preset' && avatarChoice === null && isAvatarsEnabled()) {
      setShowAvatarChoice(true);
      return;
    }
    startGame();
    setGameState('playing');
  }, [startGame, avatarUsage, avatarChoice]);
  
  // Update startGame to check avatar choice
  const handleStartGame = useCallback(() => {
    if (avatarUsage === 'avatar-or-preset' && avatarChoice === null && isAvatarsEnabled()) {
      setShowAvatarChoice(true);
    } else {
      startGame();
    }
  }, [startGame, avatarUsage, avatarChoice]);

  const displayName = getGameDisplayName('petal-storm-rhythm');

  return (
    <MiniGameFrame gameId="petal-storm-rhythm">
      <div className="relative min-h-screen overflow-hidden" style={backgroundStyle}>
      {/* Header */}
      <div className="text-center p-4 relative">
        <div className="absolute top-4 right-4">
          <Link
            href="/mini-games"
            className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
          >
            Back to Arcade
          </Link>
        </div>
                <h1 className="text-4xl font-bold text-pink-400 mb-2">{displayName}</h1>
                <p className="text-slate-300 italic">
                  "Hit the notes in time—precision timing for petals."
                </p>
      </div>

      {/* Avatar vs Preset Choice */}
      {showAvatarChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <AvatarPresetChoice
            gameId="petal-storm-rhythm"
            onChoice={handleAvatarChoice}
            onCancel={() => setShowAvatarChoice(false)}
          />
        </div>
      )}

      {/* Avatar Display (Bust Mode) - MAIN CHARACTER CENTER STAGE */}
      {!showAvatarChoice && isAvatarsEnabled() && avatarConfig && !avatarLoading && (
        <div className="flex justify-center mb-8">
          <div className="relative w-80 h-80">
            <AvatarRenderer
              profile={avatarConfig}
              mode={representationConfig.mode}
              size="large"
            />
            {/* Physics Avatar Overlay */}
            {gameState === 'playing' && (
              <div className="absolute top-0 right-0 w-32 h-40">
                <PhysicsAvatarCanvas
                  ref={physicsAvatarRef}
                  characterType="player"
                  quality="high"
                  width={128}
                  height={160}
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}
      {/* Physics Avatar Standalone (when no avatar config) */}
      {!showAvatarChoice && (!isAvatarsEnabled() || !avatarConfig) && gameState === 'playing' && (
        <div className="flex justify-center mb-8">
          <div className="relative w-80 h-80 flex items-center justify-center">
            <PhysicsAvatarCanvas
              ref={physicsAvatarRef}
              characterType="player"
              quality="high"
              width={160}
              height={200}
              className="rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Track Selection Menu */}
      {gameState === 'menu' && !showAvatarChoice && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto max-w-4xl p-4"
        >
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-6 text-center">Select Track</h2>

            <div className="grid gap-4">
              {SAMPLE_TRACKS.map((track) => (
                <motion.button
                  key={track.id}
                  onClick={() => setSelectedTrack(track)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTrack.id === track.id
                      ? 'border-pink-400 bg-pink-400/20'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{track.title}</h3>
                      <p className="text-slate-300">{track.artist}</p>
                      <div className="flex gap-4 mt-2 text-sm text-slate-400">
                        <span>BPM: {track.bpm}</span>
                        <span>
                          Duration: {Math.floor(track.duration / 60)}:
                          {(track.duration % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        track.difficulty === 'easy'
                          ? 'bg-green-600/20 text-green-400'
                          : track.difficulty === 'normal'
                            ? 'bg-blue-600/20 text-blue-400'
                            : track.difficulty === 'hard'
                              ? 'bg-orange-600/20 text-orange-400'
                              : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {track.difficulty.toUpperCase()}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={handleStartGame}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-pink-400 hover:to-purple-500 transition-all"
              >
                Start Playing
              </button>
            </div>

            {/* Controls Info */}
            <div className="mt-6 bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-medium text-white mb-2">Controls:</h4>
              <div className="grid grid-cols-5 gap-2 text-center text-sm">
                <div className="bg-slate-600/50 rounded py-2">
                  <div className="font-bold text-pink-400">A</div>
                  <div className="text-slate-300">Lane 1</div>
                </div>
                <div className="bg-slate-600/50 rounded py-2">
                  <div className="font-bold text-pink-400">S</div>
                  <div className="text-slate-300">Lane 2</div>
                </div>
                <div className="bg-slate-600/50 rounded py-2">
                  <div className="font-bold text-pink-400">D</div>
                  <div className="text-slate-300">Lane 3</div>
                </div>
                <div className="bg-slate-600/50 rounded py-2">
                  <div className="font-bold text-pink-400">F</div>
                  <div className="text-slate-300">Lane 4</div>
                </div>
                <div className="bg-slate-600/50 rounded py-2">
                  <div className="font-bold text-pink-400">G</div>
                  <div className="text-slate-300">Lane 5</div>
                </div>
              </div>
              <p className="text-center text-slate-400 text-xs mt-2">Press SPACE to pause</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Game UI */}
      {(gameState === 'playing' || gameState === 'paused') && (
        <div className="h-screen flex flex-col">
          {/* HUD - uses loader for cosmetics */}
          {isQuakeHud ? (
            <HudComponent
              {...hudProps}
              petals={petalBalance}
              gameId="petal-storm-rhythm"
            />
          ) : (
            <div className="relative">
              <HudComponent
                {...hudProps}
                score={score}
                health={health}
                maxHealth={GAME_CONFIG.INITIAL_HEALTH}
                combo={combo}
                multiplier={multiplier}
              />
              {/* Combo Meter Glow - increases with combo */}
              {combo > 0 && (
                <motion.div
                  className="absolute left-1/2 top-8 -translate-x-1/2 pointer-events-none"
                  initial={{ scale: 1, opacity: 0.3 }}
                  animate={{
                    scale: 1 + (combo / 100) * 0.5,
                    opacity: Math.min(0.6, 0.3 + combo / 50),
                  }}
                  style={{
                    width: `${Math.min(200, 100 + combo * 2)}px`,
                    height: '40px',
                    background: `radial-gradient(circle, rgba(236, 72, 153, ${Math.min(0.8, combo / 30)}) 0%, transparent 70%)`,
                    filter: `blur(${Math.min(20, combo / 5)}px)`,
                  }}
                />
              )}
            </div>
          )}

          {/* Game Area */}
          <div className="flex-1 relative overflow-hidden">

            {/* Lanes */}
            <div className="h-full flex" style={{ perspective: '1000px' }}>
              {LANES.map((laneIndex) => {
                const flash = laneFlashes[laneIndex];
                const flashAge = flash ? Date.now() - flash.time : Infinity;
                const flashActive = flashAge < (flash?.type === 'perfect' ? 400 : flash?.type === 'great' ? 300 : flash?.type === 'good' ? 200 : 300);
                
                return (
                  <div
                    key={laneIndex}
                    className="flex-1 relative border-r border-slate-700/50 bg-gradient-to-b from-transparent to-slate-900/20"
                    style={{
                      transform: `rotateX(5deg)`, // Slight perspective tilt
                      transformStyle: 'preserve-3d',
                    }}
                    onClick={() => hitNote(laneIndex)}
                    onKeyDown={(e) => e.key === 'Enter' && hitNote(laneIndex)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Hit note in lane ${laneIndex}`}
                  >
                    {/* Lane Flash VFX */}
                    {flashActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: flash?.type === 'perfect' ? 0.8 : flash?.type === 'great' ? 0.6 : flash?.type === 'good' ? 0.4 : 0.3 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 rounded-lg ${
                          flash?.type === 'perfect'
                            ? 'bg-green-400/80 shadow-lg shadow-green-400/50'
                            : flash?.type === 'great'
                              ? 'bg-blue-400/60 shadow-md shadow-blue-400/40'
                              : flash?.type === 'good'
                                ? 'bg-yellow-400/40 shadow shadow-yellow-400/30'
                                : 'bg-red-400/30'
                        }`}
                        style={{ pointerEvents: 'none' }}
                      />
                    )}

                    {/* Hit Zone */}
                    <div className="absolute bottom-20 left-2 right-2 h-16 bg-pink-500/20 border-2 border-pink-400/50 rounded-lg" />

                    {/* Lane Label */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-pink-400 font-bold">
                      {['A', 'S', 'D', 'F', 'G'][laneIndex]}
                    </div>

                  {/* Notes */}
                  <AnimatePresence>
                    {visibleNotes
                      .filter((note) => note.lane === laneIndex)
                      .map((note) => {
                        const notePosition = (currentTime - note.time + 2000) / 2000;
                        const top = `${(1 - notePosition) * 100}%`;

                        return (
                          <motion.div
                            key={note.id}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            className={`absolute left-2 right-2 h-12 rounded-lg border-2 flex items-center justify-center ${
                              note.type === 'normal'
                                ? 'bg-pink-500/80 border-pink-400'
                                : note.type === 'hold'
                                  ? 'bg-purple-500/80 border-purple-400'
                                  : 'bg-blue-500/80 border-blue-400'
                            }`}
                            style={{ top }}
                          >
                            {note.type === 'normal' && ''}
                            {note.type === 'hold' && ''}
                            {note.type === 'slide' && (note.direction === 'left' ? '←' : '→')}
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>
                  </div>
                );
              })}
            </div>
            
            {/* Petal Particles Overlay */}
            {petalParticles.length > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none z-20"
                style={{ width: '100%', height: '100%' }}
              >
                {petalParticles.map((particle) => (
                  <g
                    key={particle.id}
                    transform={`translate(${particle.x}, ${particle.y}) rotate(${(particle.rotation * 180) / Math.PI}) scale(${particle.scale})`}
                    opacity={particle.alpha}
                  >
                    <circle r={4} fill="#ec4899" />
                  </g>
                ))}
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Game Overlay */}
      <GameOverlay
        state={gameState === 'instructions' ? 'instructions' : gameState === 'win' ? 'win' : gameState === 'lose' ? 'lose' : gameState === 'paused' ? 'paused' : 'playing'}
        instructions={[
          'Press A, S, D, F to hit notes in each lane',
          'Time your hits with the beat for perfect scores',
          'Build combos for multiplier bonuses',
          'Keep your health above 0 to survive',
          'Complete the track to win!',
        ]}
        winMessage={`Rhythm Master! You completed ${selectedTrack.title} with ${Math.round(((accuracy.perfect + accuracy.great + accuracy.good) / Math.max(1, accuracy.perfect + accuracy.great + accuracy.good + accuracy.miss)) * 100)}% accuracy and ${maxCombo} max combo!`}
        loseMessage="Your health reached zero. Try again!"
        score={finalScore}
        petalReward={petalReward}
        onRestart={handleRestart}
        onResume={handleStart}
      />

      {/* Completion Screen (Legacy - will be replaced by GameOverlay) */}
      {gameState === 'win' && false && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4"
        >
          <div className="bg-slate-800/90 rounded-2xl p-8 max-w-2xl w-full text-center">
            <h2 className="text-3xl font-bold text-pink-400 mb-4">
              {health > 0 ? ' Rhythm Master!' : ' Song Ended'}
            </h2>
            <p className="text-slate-300 mb-6">
              "Perfect timing creates the most beautiful storms."
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Final Score</div>
                <div className="text-white font-bold text-xl">{formatScore(finalScore)}</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Max Combo</div>
                <div className="text-pink-400 font-bold text-xl">{maxCombo}</div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Accuracy</div>
                <div className="text-white font-bold text-xl">
                  {Math.round(
                    ((accuracy.perfect + accuracy.great + accuracy.good) /
                      Math.max(
                        accuracy.perfect + accuracy.great + accuracy.good + accuracy.miss,
                        1,
                      )) *
                      100,
                  )}
                  %
                </div>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3">
                <div className="text-slate-400 text-sm">Perfect</div>
                <div className="text-green-400 font-bold text-xl">{accuracy.perfect}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6 text-sm">
              <div className="bg-green-600/20 rounded p-2">
                <div className="text-green-400">Perfect: {accuracy.perfect}</div>
              </div>
              <div className="bg-blue-600/20 rounded p-2">
                <div className="text-blue-400">Great: {accuracy.great}</div>
              </div>
              <div className="bg-yellow-600/20 rounded p-2">
                <div className="text-yellow-400">Good: {accuracy.good}</div>
              </div>
            </div>

            <div className="space-x-4">
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-400 hover:to-purple-500 transition-all"
              >
                Play Again
              </button>
              <button
                onClick={() => setGameState('menu')}
                className="bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-slate-600 transition-all"
              >
                Track Selection
              </button>
            </div>
          </div>
        </motion.div>
      )}
      </div>
    </MiniGameFrame>
  );
}
