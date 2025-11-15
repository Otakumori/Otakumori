/**
 * Petal Samurai - Full-Body Avatar-Driven Combat Game
 * Rebuilt as combat game with proper mechanics
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameAvatar } from '@om/avatar-engine/gameIntegration';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { GameHUD } from '../_shared/GameHUD';
import { GameOverlay } from '../_shared/GameOverlay';

interface Enemy {
  id: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  mesh: THREE.Mesh | null;
}

interface PlayerState {
  health: number;
  maxHealth: number;
  position: [number, number, number];
  attackState: 'idle' | 'light' | 'heavy' | 'skill';
  attackCooldown: number;
}

export default function PetalSamuraiCombat() {
  const [gameState, setGameState] = useState<'instructions' | 'playing' | 'win' | 'lose' | 'paused'>(
    'instructions',
  );
  const [playerState, setPlayerState] = useState<PlayerState>({
    health: 100,
    maxHealth: 100,
    position: [0, 0, 0],
    attackState: 'idle',
    attackCooldown: 0,
  });
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [currentWave, setCurrentWave] = useState(1);
  const [score, setScore] = useState(0);
  const [keys, setKeys] = useState<Record<string, boolean>>({});

  const { avatarConfig, representationConfig } = useGameAvatar('petal-samurai');
  const playerRef = useRef<THREE.Group>(null);
  const enemiesRef = useRef<THREE.Group>(new THREE.Group());

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: true }));
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setKeys((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Spawn enemies in waves
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnWave = () => {
      const waveSize = 3 + currentWave;
      const newEnemies: Enemy[] = [];

      for (let i = 0; i < waveSize; i++) {
        const angle = (i / waveSize) * Math.PI * 2;
        const distance = 5 + currentWave * 2;
        newEnemies.push({
          id: `enemy-${currentWave}-${i}`,
          position: [Math.cos(angle) * distance, 0, Math.sin(angle) * distance],
          health: 50 + currentWave * 20,
          maxHealth: 50 + currentWave * 20,
          mesh: null,
        });
      }

      setEnemies(newEnemies);
    };

    spawnWave();
  }, [currentWave, gameState]);

  // Game loop
  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    // Update player attack cooldown
    setPlayerState((prev) => ({
      ...prev,
      attackCooldown: Math.max(0, prev.attackCooldown - delta),
    }));

    // Player movement
    const moveSpeed = 5 * delta;
    const newPosition: [number, number, number] = [...playerState.position];

    if (keys['w'] || keys['arrowup']) {
      newPosition[2] -= moveSpeed;
    }
    if (keys['s'] || keys['arrowdown']) {
      newPosition[2] += moveSpeed;
    }
    if (keys['a'] || keys['arrowleft']) {
      newPosition[0] -= moveSpeed;
    }
    if (keys['d'] || keys['arrowright']) {
      newPosition[0] += moveSpeed;
    }

    // Attack input
    if (keys[' '] && playerState.attackCooldown <= 0) {
      // Light attack
      setPlayerState((prev) => ({
        ...prev,
        attackState: 'light',
        attackCooldown: 0.5,
      }));

      // Check for enemy hits
      checkEnemyHits('light');
    }

    if (keys['shift'] && playerState.attackCooldown <= 0) {
      // Heavy attack
      setPlayerState((prev) => ({
        ...prev,
        attackState: 'heavy',
        attackCooldown: 1.0,
      }));

      checkEnemyHits('heavy');
    }

    // Update player position
    if (newPosition[0] !== playerState.position[0] || newPosition[2] !== playerState.position[2]) {
      setPlayerState((prev) => ({ ...prev, position: newPosition }));
      if (playerRef.current) {
        playerRef.current.position.set(...newPosition);
      }
    }

    // Reset attack state after animation
    if (playerState.attackState !== 'idle' && playerState.attackCooldown <= 0.3) {
      setPlayerState((prev) => ({ ...prev, attackState: 'idle' }));
    }

    // Check win condition
    if (enemies.length === 0 && currentWave >= 3) {
      setGameState('win');
    }

    // Check lose condition
    if (playerState.health <= 0) {
      setGameState('lose');
    }
  });

  // Check for enemy hits during attack
  const checkEnemyHits = useCallback(
    (attackType: 'light' | 'heavy') => {
      const attackRange = attackType === 'light' ? 2 : 3;
      const attackDamage = attackType === 'light' ? 25 : 50;

      setEnemies((prevEnemies) => {
        return prevEnemies
          .map((enemy) => {
            const distance = Math.sqrt(
              Math.pow(enemy.position[0] - playerState.position[0], 2) +
                Math.pow(enemy.position[2] - playerState.position[2], 2),
            );

            if (distance <= attackRange) {
              const newHealth = enemy.health - attackDamage;
              if (newHealth <= 0) {
                setScore((s) => s + 100);
                return null; // Remove enemy
              }
              return { ...enemy, health: newHealth };
            }
            return enemy;
          })
          .filter((e): e is Enemy => e !== null);
      });
    },
    [playerState.position],
  );

  // Enemy AI (simple - move toward player)
  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    setEnemies((prevEnemies) => {
      return prevEnemies.map((enemy) => {
        const dx = playerState.position[0] - enemy.position[0];
        const dz = playerState.position[2] - enemy.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > 0.5) {
          // Move toward player
          const moveSpeed = 2 * delta;
          const newPosition: [number, number, number] = [
            enemy.position[0] + (dx / distance) * moveSpeed,
            enemy.position[1],
            enemy.position[2] + (dz / distance) * moveSpeed,
          ];

          // Check if enemy hits player
          if (distance < 1.5) {
            // Enemy attack
            setPlayerState((prev) => ({
              ...prev,
              health: Math.max(0, prev.health - 10),
            }));
          }

          return { ...enemy, position: newPosition };
        }

        return enemy;
      });
    });
  });

  // Advance wave when all enemies defeated
  useEffect(() => {
    if (enemies.length === 0 && gameState === 'playing' && currentWave < 3) {
      setTimeout(() => {
        setCurrentWave((w) => w + 1);
      }, 2000);
    }
  }, [enemies.length, gameState, currentWave]);

  const handleRestart = useCallback(() => {
    setGameState('playing');
    setPlayerState({
      health: 100,
      maxHealth: 100,
      position: [0, 0, 0],
      attackState: 'idle',
      attackCooldown: 0,
    });
    setEnemies([]);
    setCurrentWave(1);
    setScore(0);
  }, []);

  const handleStart = useCallback(() => {
    setGameState('playing');
  }, []);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      {/* Game Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, 10, -5]} intensity={0.5} />

        {/* Arena Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>

        {/* Player Avatar */}
        {avatarConfig && (
          <group ref={playerRef} position={playerState.position}>
            <AvatarRenderer profile={avatarConfig} mode={representationConfig.mode} size="medium" />
          </group>
        )}

        {/* Enemies */}
        <group ref={enemiesRef}>
          {enemies.map((enemy) => (
            <mesh key={enemy.id} position={enemy.position} castShadow>
              <capsuleGeometry args={[0.5, 1.5, 8, 16]} />
              <meshStandardMaterial color="#f59e0b" />
            </mesh>
          ))}
        </group>
      </Canvas>

      {/* HUD */}
      <GameHUD
        health={playerState.health}
        maxHealth={playerState.maxHealth}
        score={score}
      />

      {/* Overlay */}
      <GameOverlay
        state={gameState}
        instructions={[
          'WASD/Arrow keys to move',
          'Space for light attack',
          'Shift for heavy attack',
          'Defeat all enemies in 3 waves to win',
          'Avoid enemy attacks or lose health',
        ]}
        winMessage="You have mastered the way of the Petal Samurai!"
        loseMessage="You have fallen in battle. Try again!"
        score={score}
        onRestart={handleRestart}
        onResume={handleStart}
      />
    </div>
  );
}

