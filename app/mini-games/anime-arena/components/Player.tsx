'use client';

import { forwardRef, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useUser } from '@clerk/nextjs';
import GameAvatarRenderer from '../../_shared/GameAvatarRenderer';
import Controls from '../systems/Controls';

interface PlayerProps {
  speed: number;
  onDamage: (damage: number) => void;
  dimensionShiftActive: boolean;
  onPositionUpdate?: (position: THREE.Vector3) => void;
}

const Player = forwardRef<THREE.Group, PlayerProps>(
  ({ speed, onDamage: _onDamage, dimensionShiftActive, onPositionUpdate }, ref) => {
    // onDamage is passed but damage handling is done by combat system via collisions
    const { user } = useUser();
    const internalRef = useRef<THREE.Group>(null);
    const controlsRef = useRef<Controls | null>(null);
    const velocity = useRef(new THREE.Vector3());
    const attackCooldown = useRef(0);

    // Use user data for avatar customization if available
    useEffect(() => {
      if (user) {
        // User data available for avatar customization
        // This can be used to load user's saved avatar configuration
      }
    }, [user]);

    // Initialize controls
    useEffect(() => {
      controlsRef.current = new Controls();
      return () => {
        controlsRef.current?.dispose();
      };
    }, []);

    // Expose ref to parent
    useEffect(() => {
      if (ref && internalRef.current) {
        if (typeof ref === 'function') {
          ref(internalRef.current);
        } else {
          ref.current = internalRef.current;
        }
      }
    }, [ref]);

    useFrame((state, delta) => {
      if (!internalRef.current || !controlsRef.current) return;

      const controls = controlsRef.current.getControlState();
      const moveVector = controlsRef.current.getMovementVector();

      // Apply dimension shift slowdown
      const timeScale = dimensionShiftActive ? 0.1 : 1.0;
      const adjustedDelta = delta * timeScale;

      // Update velocity
      velocity.current.lerp(moveVector.multiplyScalar(speed), 0.2);
      internalRef.current.position.add(velocity.current.clone().multiplyScalar(adjustedDelta));

      // Keep player in arena bounds
      const arenaSize = 25;
      internalRef.current.position.x = Math.max(
        -arenaSize,
        Math.min(arenaSize, internalRef.current.position.x),
      );
      internalRef.current.position.z = Math.max(
        -arenaSize,
        Math.min(arenaSize, internalRef.current.position.z),
      );

      // Notify parent of position update
      if (onPositionUpdate) {
        onPositionUpdate(internalRef.current.position.clone());
      }

      // Rotate player to face movement direction
      if (moveVector.length() > 0.1) {
        const targetRotation = Math.atan2(moveVector.x, moveVector.z);
        internalRef.current.rotation.y = THREE.MathUtils.lerp(
          internalRef.current.rotation.y,
          targetRotation,
          0.1,
        );
      }

      // Handle attack
      if (controls.attack && attackCooldown.current <= 0) {
        attackCooldown.current = 0.5; // 0.5 second cooldown
        // Attack logic handled by combat system
      }

      // Update cooldown
      if (attackCooldown.current > 0) {
        attackCooldown.current -= adjustedDelta;
      }
    });

    return (
      <group ref={internalRef} position={[0, 1, 0]}>
        {/* Player Avatar */}
        <group position={[0, 0, 0]} scale={[1, 1, 1]}>
          <GameAvatarRenderer
            gameId="anime-arena"
            gameMode="combat"
            position={[0, 0, 0]}
            scale={[1, 1, 1]}
            quality="medium"
            enableAnimations={true}
            animationState="idle"
          />
        </group>

        {/* Attack hitbox indicator (debug) */}
        {process.env.NODE_ENV === 'development' && (
          <mesh position={[0, 1, 1.5]}>
            <boxGeometry args={[1, 2, 1]} />
            <meshBasicMaterial color="red" transparent opacity={0.2} wireframe />
          </mesh>
        )}
      </group>
    );
  },
);

Player.displayName = 'Player';

export default Player;

