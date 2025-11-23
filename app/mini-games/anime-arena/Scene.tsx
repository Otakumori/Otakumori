'use client';

import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera, Stats } from '@react-three/drei';
import * as THREE from 'three';
import { useUser } from '@clerk/nextjs';
import { useMutation } from '@tanstack/react-query';
import GameAvatarRenderer from '../_shared/GameAvatarRenderer';
import Arena from './components/Arena';
import Player from './components/Player';
import EnemyManager from './components/EnemyManager';
import CombatSystem from './systems/CombatSystem';
import GameHUD from './components/GameHUD';
import GameState from './systems/GameState';
import Controls from './systems/Controls';
import { DimensionShiftEffect } from './effects/DimensionShiftEffect';
import { StyleMeter } from './systems/StyleMeter';

// Game configuration
const GAME_CONFIG = {
  arenaSize: 50,
  playerSpeed: 5,
  playerHealth: 100,
  dimensionShiftCooldown: 10000, // 10 seconds
  dimensionShiftDuration: 3000, // 3 seconds
  dimensionShiftSlowFactor: 0.1, // 10% speed
  styleMeterDecay: 0.5, // Points per second
  baseScorePerKill: 100,
  comboMultiplier: 1.2,
  maxCombo: 50,
} as const;

export default function AnimeArenaScene() {
  const { user, isSignedIn } = useUser();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState<number>(GAME_CONFIG.playerHealth);
  const [wave, setWave] = useState(1);
  const [enemiesKilled, setEnemiesKilled] = useState(0);
  const [combo, setCombo] = useState(0);
  const [dimensionShiftReady, setDimensionShiftReady] = useState(true);
  const [dimensionShiftActive, setDimensionShiftActive] = useState(false);
  const gameStateRef = useRef(new GameState());
  const combatSystemRef = useRef(new CombatSystem());
  const styleMeterRef = useRef(new StyleMeter());

  // Initialize game systems on mount
  useEffect(() => {
    // Systems are initialized via refs, but we can add setup logic here if needed
    return () => {
      // Cleanup on unmount
      gameStateRef.current.reset();
      combatSystemRef.current.reset();
      styleMeterRef.current.reset();
    };
  }, []);

  // Score submission mutation
  const submitScoreMutation = useMutation({
    mutationFn: async (finalScore: number) => {
      if (!isSignedIn || !user?.id) return;

      // Submit to leaderboard
      const response = await fetch('/api/v1/leaderboards/anime-arena', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: finalScore,
          category: 'score',
          metadata: {
            wave,
            enemiesKilled,
            maxCombo: combo,
            styleRank: styleMeterRef.current.getRank(),
            playtime: gameStateRef.current.getPlaytime(),
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Award petals based on score
        const petalReward = Math.floor(finalScore / 100);
        if (petalReward > 0 && result.ok) {
          await fetch('/api/v1/petals/collect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: petalReward,
              source: 'game_reward',
              metadata: { gameId: 'anime-arena', score: finalScore },
            }),
          });
        }
        return result;
      }
      throw new Error('Failed to submit score');
    },
  });

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setHealth(GAME_CONFIG.playerHealth);
    setWave(1);
    setEnemiesKilled(0);
    setCombo(0);
    setDimensionShiftReady(true);
    setDimensionShiftActive(false);
    gameStateRef.current.reset();
    combatSystemRef.current.reset();
    styleMeterRef.current.reset();
  }, []);

  const endGame = useCallback(() => {
    setGameState('gameover');
    const finalScore = score + enemiesKilled * 50 + wave * 100;
    if (isSignedIn) {
      submitScoreMutation.mutate(finalScore);
    }
  }, [score, enemiesKilled, wave, isSignedIn, submitScoreMutation]);

  const handlePlayerDamage = useCallback((damage: number) => {
    setHealth((prev) => {
      const newHealth = Math.max(0, prev - damage);
      if (newHealth === 0) {
        endGame();
      }
      return newHealth;
    });
    styleMeterRef.current.addPenalty(10);
  }, [endGame]);

  const handleEnemyKilled = useCallback((enemyType: string, wasCombo: boolean) => {
    setEnemiesKilled((prev) => prev + 1);
    const basePoints = GAME_CONFIG.baseScorePerKill;
    const comboBonus = wasCombo ? combo * 10 : 0;
    const points = basePoints + comboBonus;
    setScore((prev) => prev + points);
    
    if (wasCombo) {
      setCombo((prev) => Math.min(prev + 1, GAME_CONFIG.maxCombo));
      styleMeterRef.current.addPoints(5);
    } else {
      setCombo(0);
      styleMeterRef.current.addPoints(2);
    }
  }, [combo]);

  const activateDimensionShift = useCallback(() => {
    if (!dimensionShiftReady || dimensionShiftActive) return;
    
    setDimensionShiftActive(true);
    setDimensionShiftReady(false);
    
    setTimeout(() => {
      setDimensionShiftActive(false);
    }, GAME_CONFIG.dimensionShiftDuration);
    
    setTimeout(() => {
      setDimensionShiftReady(true);
    }, GAME_CONFIG.dimensionShiftCooldown);
    
    styleMeterRef.current.addPoints(10);
  }, [dimensionShiftReady, dimensionShiftActive]);

  if (gameState === 'menu') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-purple-900 via-purple-800 to-black">
        <div className="text-center">
          <h1 className="mb-8 text-6xl font-bold text-pink-400 drop-shadow-lg">Anime Arena</h1>
          <p className="mb-8 text-xl text-pink-200">Enter the arena, traveler. Your avatar awaits.</p>
          <button
            onClick={startGame}
            className="rounded-lg bg-pink-600 px-8 py-4 text-xl font-semibold text-white transition-all hover:bg-pink-700 hover:shadow-lg"
          >
            Start Battle
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-purple-900 via-purple-800 to-black">
        <div className="text-center">
          <h2 className="mb-4 text-4xl font-bold text-pink-400">Game Over</h2>
          <p className="mb-2 text-xl text-pink-200">Final Score: {score}</p>
          <p className="mb-2 text-lg text-pink-300">Wave: {wave}</p>
          <p className="mb-2 text-lg text-pink-300">Enemies Defeated: {enemiesKilled}</p>
          <p className="mb-8 text-lg text-pink-300">Style Rank: {styleMeterRef.current.getRank()}</p>
          <button
            onClick={startGame}
            className="mr-4 rounded-lg bg-pink-600 px-8 py-4 text-xl font-semibold text-white transition-all hover:bg-pink-700"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: 60, position: [0, 10, 20] }}
      >
        <Suspense fallback={null}>
          {/* Camera controls for debug/development */}
          {process.env.NODE_ENV === 'development' && (
            <>
              <PerspectiveCamera makeDefault position={[0, 10, 20]} fov={60} />
              <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
              <Stats />
            </>
          )}
          <GameScene
            gameState={gameState}
            health={health}
            score={score}
            combo={combo}
            wave={wave}
            dimensionShiftActive={dimensionShiftActive}
            dimensionShiftReady={dimensionShiftReady}
            onPlayerDamage={handlePlayerDamage}
            onEnemyKilled={handleEnemyKilled}
            onDimensionShift={activateDimensionShift}
            onWaveComplete={() => setWave((prev) => prev + 1)}
            styleMeter={styleMeterRef.current}
          />
        </Suspense>
      </Canvas>
      
      <GameHUD
        health={health}
        maxHealth={GAME_CONFIG.playerHealth}
        score={score}
        combo={combo}
        wave={wave}
        dimensionShiftReady={dimensionShiftReady}
        dimensionShiftCooldown={GAME_CONFIG.dimensionShiftCooldown}
        styleMeter={styleMeterRef.current}
        onDimensionShift={activateDimensionShift}
        onPause={() => setGameState('paused')}
      />
    </div>
  );
}

// Main 3D Scene Component
function GameScene({
  gameState,
  health,
  score,
  combo,
  wave,
  dimensionShiftActive,
  dimensionShiftReady,
  onPlayerDamage,
  onEnemyKilled,
  onDimensionShift,
  onWaveComplete,
  styleMeter,
}: {
  gameState: string;
  health: number;
  score: number;
  combo: number;
  wave: number;
  dimensionShiftActive: boolean;
  dimensionShiftReady: boolean;
  onPlayerDamage: (damage: number) => void;
  onEnemyKilled: (enemyType: string, wasCombo: boolean) => void;
  onDimensionShift: () => void;
  onWaveComplete: () => void;
  styleMeter: StyleMeter;
}) {
  const { camera, scene } = useThree();
  const playerRef = useRef<THREE.Group>(null);
  const enemyManagerRef = useRef<any>(null);
  const controlsRef = useRef<Controls | null>(null);
  const playerPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  // Initialize controls system
  useEffect(() => {
    controlsRef.current = new Controls();
    return () => {
      controlsRef.current?.dispose();
    };
  }, []);

  // Use gameState to control scene behavior
  useEffect(() => {
    if (gameState === 'paused') {
      // Pause animations, etc.
    } else if (gameState === 'playing') {
      // Resume animations, etc.
    }
  }, [gameState]);

  // Use health to adjust visual effects (e.g., screen tint when low health)
  useEffect(() => {
    if (health < 30) {
      // Low health visual indicator could be added here
    }
  }, [health]);

  // Use score and combo for visual feedback
  useEffect(() => {
    if (combo > 5) {
      // High combo visual effects could be added here
    }
  }, [combo, score]);

  // Use dimensionShiftReady to show visual indicator
  useEffect(() => {
    if (dimensionShiftReady) {
      // Visual indicator that dimension shift is ready
    }
  }, [dimensionShiftReady]);

  // Use styleMeter for dynamic lighting/effects based on style rank
  useEffect(() => {
    const rank = styleMeter.getRank();
    // Adjust scene lighting/effects based on style rank
    if (rank === 'S') {
      // Maximum style effects
    }
  }, [styleMeter]);

  // Use scene for advanced operations (debugging, exports, etc.)
  useEffect(() => {
    if (scene && process.env.NODE_ENV === 'development') {
      // Scene is available for debugging or advanced operations
      // Could be used for scene inspection, export functionality, etc.
    }
  }, [scene]);

  // Setup camera to follow player
  useFrame(() => {
    if (playerRef.current && controlsRef.current) {
      const playerPos = playerRef.current.position;
      // Smooth camera follow
      camera.position.lerp(
        new THREE.Vector3(playerPos.x, playerPos.y + 8, playerPos.z + 12),
        0.05,
      );
      camera.lookAt(playerPos);
    }
  });

  // Handle dimension shift activation (could be triggered by keyboard shortcut)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ' && dimensionShiftReady && !dimensionShiftActive) {
        onDimensionShift();
      }
    };
    if (gameState === 'playing') {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [dimensionShiftReady, dimensionShiftActive, onDimensionShift, gameState]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      <pointLight position={[-10, 5, -10]} intensity={0.5} color="#ff69b4" />

      {/* Environment */}
      <Arena size={GAME_CONFIG.arenaSize} />

      {/* Player */}
      <Player
        ref={playerRef}
        speed={GAME_CONFIG.playerSpeed}
        onDamage={onPlayerDamage}
        dimensionShiftActive={dimensionShiftActive}
        onPositionUpdate={(pos) => {
          playerPositionRef.current.copy(pos);
          if (enemyManagerRef.current?.setPlayerPosition) {
            enemyManagerRef.current.setPlayerPosition(pos);
          }
        }}
      />

      {/* Enemies */}
      <EnemyManager
        ref={enemyManagerRef}
        wave={wave}
        arenaSize={GAME_CONFIG.arenaSize}
        onEnemyKilled={onEnemyKilled}
        onPlayerDamage={onPlayerDamage}
        dimensionShiftActive={dimensionShiftActive}
        onWaveComplete={onWaveComplete}
      />

      {/* Dimension Shift Effect */}
      {dimensionShiftActive && <DimensionShiftEffect />}

      {/* Post-processing effects */}
      <Environment preset="sunset" />
    </>
  );
}

