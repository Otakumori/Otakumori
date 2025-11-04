'use client';

/**
 * Side-scroller demo - 2.5D platformer with ECS
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { createWorld, type EntityId } from '@om/ecs';
import { useGameLoop } from '@om/ecs/react';
import {
  createInputSystem,
  pollInput,
  updateCharacter,
  applyVelocity,
  createSide2DAdapter,
  followTarget,
  createOrthoCamera,
  constrainPosition,
  spawnPlayer,
} from '@om/game-kit';
import { getPolicyFromClient } from '@/app/lib/policy/fromRequest';
import { resolveEquipmentForGame } from '@/app/lib/avatar/resolve-equipment';
import { InputHints } from '@/app/components/games/InputHints';
import { prefersReducedMotion } from '@/app/lib/device-profile';

export default function SideScrollerDemo() {
  const [isReady, setIsReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const world = useMemo(() => createWorld(), []);
  const inputSystem = useRef(createInputSystem());
  const playerEntity = useRef<EntityId | null>(null);
  const adapter = useRef(createSide2DAdapter(10, 0.1));
  const camera = useRef(
    createOrthoCamera(
      10,
      typeof window !== 'undefined' && window.innerHeight > 0
        ? window.innerWidth / window.innerHeight
        : 16 / 9,
    ),
  );

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
        adapter.current.followTarget = entity;

        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize game:', error);
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
          transform.position = constrainPosition(newPos);

          // Simple ground check
          if (transform.position.y <= 0) {
            transform.position.y = 0;
            controller.onGround = true;
          } else {
            controller.onGround = false;
          }
        }
      },

      // Camera follow system
      (_w: any, dt: number) => {
        if (!playerEntity.current) return;

        const transform = (world.components as any).get('Transform')?.get(playerEntity.current);
        if (transform) {
          followTarget(
            camera.current,
            transform.position,
            adapter.current.cameraOffset,
            adapter.current.followDamping,
            dt,
          );
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
        <OrthographicCamera
          makeDefault
          position={[camera.current.position.x, camera.current.position.y, 10]}
          zoom={50}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Platform */}
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[20, 1, 1]} />
          <meshStandardMaterial color="#4a5568" />
        </mesh>

        {/* Player placeholder */}
        {playerEntity.current && (
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[0.8, 1.6, 0.8]} />
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
          <h1 className="text-3xl font-bold text-white">Side-Scroller Demo</h1>
          <p className="text-zinc-300">2.5D Platformer with ECS</p>
        </div>
      </div>

      {/* Input Hints */}
      <InputHints gameMode="keyboard" />
    </div>
  );
}
