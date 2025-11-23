'use client';

import { forwardRef, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshToonMaterial } from 'three';

interface Enemy {
  id: string;
  position: THREE.Vector3;
  health: number;
  maxHealth: number;
  type: 'drone' | 'ninja' | 'yokai';
  velocity: THREE.Vector3;
  attackCooldown: number;
  state: 'idle' | 'chasing' | 'attacking' | 'dead';
}

interface EnemyManagerProps {
  wave: number;
  arenaSize: number;
  onEnemyKilled: (enemyType: string, wasCombo: boolean) => void;
  onPlayerDamage: (damage: number) => void;
  dimensionShiftActive: boolean;
  onWaveComplete: () => void;
}

const EnemyManager = forwardRef<any, EnemyManagerProps>(
  (
    { wave, arenaSize, onEnemyKilled, onPlayerDamage, dimensionShiftActive, onWaveComplete },
    ref,
  ) => {
    const [enemies, setEnemies] = useState<Enemy[]>([]);
    const playerPositionRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
    const lastKillTime = useRef(0);
    const comboWindow = 2000; // 2 seconds

    // Spawn enemies for current wave
    useEffect(() => {
      const enemyCount = 3 + wave * 2;
      const newEnemies: Enemy[] = [];

      for (let i = 0; i < enemyCount; i++) {
        const angle = (i / enemyCount) * Math.PI * 2;
        const radius = arenaSize * 0.8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const types: Enemy['type'][] = ['drone', 'ninja', 'yokai'];
        const type = types[Math.floor(Math.random() * types.length)];

        newEnemies.push({
          id: `enemy-${wave}-${i}`,
          position: new THREE.Vector3(x, 1, z),
          health: 50 + wave * 20,
          maxHealth: 50 + wave * 20,
          type,
          velocity: new THREE.Vector3(),
          attackCooldown: 0,
          state: 'chasing',
        });
      }

      setEnemies(newEnemies);
    }, [wave, arenaSize]);

    // Update enemy AI
    useFrame((state, delta) => {
      const timeScale = dimensionShiftActive ? 0.1 : 1.0;
      const adjustedDelta = delta * timeScale;

      setEnemies((prevEnemies) => {
        if (prevEnemies.length === 0) {
          onWaveComplete();
          return prevEnemies;
        }

        return prevEnemies
          .map((enemy) => {
            if (enemy.state === 'dead' || enemy.health <= 0) {
              return null;
            }

            const direction = playerPositionRef.current.clone().sub(enemy.position).normalize();
            const distance = enemy.position.distanceTo(playerPositionRef.current);

            // Update velocity based on enemy type
            let speed = 2;
            let attackRange = 2;
            let attackDamage = 10;

            switch (enemy.type) {
              case 'drone':
                speed = 3;
                attackRange = 3;
                attackDamage = 8;
                break;
              case 'ninja':
                speed = 4;
                attackRange = 1.5;
                attackDamage = 15;
                break;
              case 'yokai':
                speed = 1.5;
                attackRange = 2.5;
                attackDamage = 20;
                break;
            }

            // Move towards player
            if (distance > attackRange) {
              enemy.velocity.lerp(direction.multiplyScalar(speed), 0.1);
              enemy.position.add(enemy.velocity.clone().multiplyScalar(adjustedDelta));
              enemy.state = 'chasing';
            } else {
              // Attack player
              enemy.velocity.lerp(new THREE.Vector3(), 0.2);
              if (enemy.attackCooldown <= 0) {
                onPlayerDamage(attackDamage);
                enemy.attackCooldown = 1.5;
                enemy.state = 'attacking';
              }
            }

            // Update cooldown
            if (enemy.attackCooldown > 0) {
              enemy.attackCooldown -= adjustedDelta;
            }

            // Keep in bounds
            enemy.position.x = Math.max(-arenaSize, Math.min(arenaSize, enemy.position.x));
            enemy.position.z = Math.max(-arenaSize, Math.min(arenaSize, enemy.position.z));

            return enemy;
          })
          .filter((e): e is Enemy => e !== null);
      });
    });

    // Handle enemy damage
    const damageEnemy = (enemyId: string, damage: number) => {
      setEnemies((prev) => {
        return prev.map((enemy) => {
          if (enemy.id === enemyId) {
            const newHealth = Math.max(0, enemy.health - damage);
            if (newHealth === 0 && enemy.state !== 'dead') {
              enemy.state = 'dead';
              const now = Date.now();
              const wasCombo = now - lastKillTime.current < comboWindow;
              lastKillTime.current = now;
              onEnemyKilled(enemy.type, wasCombo);
            }
            return { ...enemy, health: newHealth };
          }
          return enemy;
        });
      });
    };

    // Expose methods to parent
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref({ damageEnemy, setPlayerPosition: (pos: THREE.Vector3) => (playerPositionRef.current = pos) });
        } else if (ref.current) {
          ref.current = { damageEnemy, setPlayerPosition: (pos: THREE.Vector3) => (playerPositionRef.current = pos) };
        }
      }
    }, [ref]);

    return (
      <group>
        {enemies.map((enemy) => (
          <Enemy
            key={enemy.id}
            enemy={enemy}
            onDamage={(damage) => damageEnemy(enemy.id, damage)}
            dimensionShiftActive={dimensionShiftActive}
          />
        ))}
      </group>
    );
  },
);

EnemyManager.displayName = 'EnemyManager';

// Individual Enemy Component
function Enemy({
  enemy,
  onDamage: _onDamage, // Passed to component but damage handling is done in EnemyManager
  dimensionShiftActive,
}: {
  enemy: Enemy;
  onDamage: (damage: number) => void;
  dimensionShiftActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<MeshToonMaterial | null>(null);

  // Create material based on enemy type
  useEffect(() => {
    let color = '#ff6b6b';
    switch (enemy.type) {
      case 'drone':
        color = '#4ecdc4';
        break;
      case 'ninja':
        color = '#95a5a6';
        break;
      case 'yokai':
        color = '#9b59b6';
        break;
    }
    materialRef.current = new MeshToonMaterial({ color });
  }, [enemy.type]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(enemy.position);
      // Slow rotation when dimension shift is active
      const rotationSpeed = dimensionShiftActive ? 0.005 : 0.01;
      meshRef.current.rotation.y += rotationSpeed;
    }
  });

  if (enemy.state === 'dead') return null;

  return (
    <group>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[1, 2, 1]} />
        {materialRef.current && <primitive object={materialRef.current} attach="material" />}
      </mesh>
      {/* Health bar */}
      <mesh position={[enemy.position.x, enemy.position.y + 1.5, enemy.position.z]}>
        <planeGeometry args={[1, 0.1]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh
        position={[enemy.position.x, enemy.position.y + 1.5, enemy.position.z]}
        scale={[enemy.health / enemy.maxHealth, 1, 1]}
      >
        <planeGeometry args={[1, 0.1]} />
        <meshBasicMaterial color="green" />
      </mesh>
    </group>
  );
}

export default EnemyManager;

