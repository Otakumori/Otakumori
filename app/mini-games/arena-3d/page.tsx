'use client';

/**
 * 3D Arena demo - Third-person action game with ECS
 */

import { logger } from '@/app/lib/logger';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { createWorld, type EntityId } from '@om/ecs';
import { useGameLoop } from '@om/ecs/react';
import {
  createInputSystem,
  pollInput,
  updateCharacter,
  applyVelocity,
  spawnPlayer,
} from '@om/game-kit';
import { getPolicyFromClient } from '@/app/lib/policy/fromRequest';
import { resolveEquipmentForGame } from '@/app/lib/avatar/resolve-equipment';
import { InputHints } from '@/app/components/games/InputHints';
import { prefersReducedMotion } from '@/app/lib/device-profile';

const DUMMY_POSITIONS: ReadonlyArray<[number, number, number]> = [
  [-5, 0, -5],
  [5, 0, -5],
  [0, 0, -8],
];

export default function Arena3DDemo() {
  const [isReady, setIsReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const world = useMemo(() => createWorld(), []);
  const inputSystem = useRef(createInputSystem());
  const playerEntity = useRef<EntityId | null>(null);

  // Initialize game
  useEffect(() => {
    (async () => {
      try {
        // Load avatar with policy
        const policy = getPolicyFromClient();
        const equipment = await resolveEquipmentForGame(
          {
            head: 'head_default',
            torso: 'torso_default',
            legs: 'legs_default',
            accessory: 'accessory_none',
          },
          policy,
        );

        // Spawn player
        const entity = spawnPlayer(world, {
          position: [0, 2, 0],
          avatarConfig: equipment,
        });

        playerEntity.current = entity;
        setIsReady(true);
      } catch (error) {
        logger.error('Failed to initialize game:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    })();
  }, [world]);

  // Game systems
  const gameSystems = useMemo(() => {
    return [
      // Input system
      (_world: any, _dt: number) => {
        if (inputSystem.current) {
          pollInput(inputSystem.current);
        }
      },

      // Character movement system
      (w: any, dt: number) => {
        if (!playerEntity.current) return;

        const input = pollInput(inputSystem.current);
        const controller = w.components.get('Character')?.get(playerEntity.current);
        const transform = w.components.get('Transform')?.get(playerEntity.current);

        if (controller && transform) {
          // Update character controller
          updateCharacter(controller, input, dt);

          // Apply velocity to position
          const newPos = applyVelocity(transform.position, controller.velocity, dt);
          transform.position = newPos;

          // Simple ground check
          if (transform.position.y <= 0) {
            transform.position.y = 0;
            controller.onGround = true;
          } else {
            controller.onGround = false;
          }
        }
      },
    ];
  }, [world]);

  // Game loop
  const { start, pause, resume, fps } = useGameLoop({
    world,
    systems: gameSystems,
    autoStart: isReady && !prefersReducedMotion(),
  });

  const togglePause = () => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
    setIsPaused(!isPaused);
  };

  return (
    <div className="relative h-screen w-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      {/* Game Canvas */}
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <hemisphereLight args={['#87CEEB', '#654321', 0.6]} />

        {/* Arena Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>

        {/* Arena Walls */}
        {[-15, 15].map((x) => (
          <mesh key={`wall-x-${x}`} position={[x, 2.5, 0]} castShadow>
            <boxGeometry args={[1, 5, 30]} />
            <meshStandardMaterial color="#2d3748" />
          </mesh>
        ))}
        {[-15, 15].map((z) => (
          <mesh key={`wall-z-${z}`} position={[0, 2.5, z]} castShadow>
            <boxGeometry args={[30, 5, 1]} />
            <meshStandardMaterial color="#2d3748" />
          </mesh>
        ))}

        {/* Target Dummies */}
        {DUMMY_POSITIONS.map(([x, y, z], i) => (
          <mesh key={`dummy-${i}`} position={[x, y + 1, z]} castShadow>
            <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        ))}

        {/* Player placeholder */}
        {playerEntity.current && (
          <mesh position={[0, 1, 0]} castShadow>
            <capsuleGeometry args={[0.4, 1.2, 16, 32]} />
            <meshStandardMaterial color="#ec4899" />
          </mesh>
        )}
      </Canvas>

      {/* UI Overlay */}
      <div className="pointer-events-none fixed inset-0 z-10">
        {/* FPS Counter */}
        <div className="absolute left-4 top-4 rounded-lg bg-black/50 px-3 py-2 font-mono text-sm text-white backdrop-blur">
          FPS: {fps}
        </div>

        {/* Controls */}
        <div className="pointer-events-auto absolute right-4 top-4 space-x-2">
          {!isReady ? (
            <button
              onClick={start}
              className="rounded-lg bg-pink-500 px-4 py-2 font-medium text-white transition-colors hover:bg-pink-600"
            >
              Start
            </button>
          ) : (
            <button
              onClick={togglePause}
              className="rounded-lg bg-pink-500 px-4 py-2 font-medium text-white transition-colors hover:bg-pink-600"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
        </div>

        {/* Title */}
        <div className="absolute left-1/2 top-8 -translate-x-1/2 text-center">
          <h1 className="text-3xl font-bold text-white">3D Arena Demo</h1>
          <p className="text-zinc-300">Third-Person Action with ECS</p>
        </div>
      </div>

      {/* Input Hints */}
      <InputHints gameMode="keyboard" />
    </div>
  );
}
