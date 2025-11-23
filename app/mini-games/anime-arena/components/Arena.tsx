'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshToonMaterial } from 'three';

interface ArenaProps {
  size: number;
}

export default function Arena({ size }: ArenaProps) {
  const floorRef = useRef<THREE.Mesh>(null);
  const petalsRef = useRef<THREE.InstancedMesh>(null);

  // Create sakura petals
  const petalCount = 200;
  const petalGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.2, 0.1, 0.4, 0);
    shape.quadraticCurveTo(0.2, -0.1, 0, 0);
    return new THREE.ShapeGeometry(shape);
  }, []);

  const petalMaterial = useMemo(
    () =>
      new MeshToonMaterial({
        color: '#ffb3d9',
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      }),
    [],
  );

  // Initialize petal positions
  const petalData = useMemo(() => {
    const data: Array<{ position: THREE.Vector3; rotation: THREE.Euler; velocity: number }> = [];
    for (let i = 0; i < petalCount; i++) {
      data.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * size * 2,
          Math.random() * 20 + 5,
          (Math.random() - 0.5) * size * 2,
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
        ),
        velocity: Math.random() * 0.5 + 0.2,
      });
    }
    return data;
  }, [size]);

  // Animate petals
  useFrame((state) => {
    if (petalsRef.current) {
      petalData.forEach((petal, i) => {
        // Update position
        petal.position.y -= petal.velocity * 0.01;
        petal.position.x += Math.sin(state.clock.elapsedTime + i) * 0.01;
        petal.position.z += Math.cos(state.clock.elapsedTime + i) * 0.01;

        // Reset if fallen
        if (petal.position.y < -5) {
          petal.position.y = 20;
          petal.position.x = (Math.random() - 0.5) * size * 2;
          petal.position.z = (Math.random() - 0.5) * size * 2;
        }

        // Update instance matrix
        if (petalsRef.current) {
          const matrix = new THREE.Matrix4();
          matrix.compose(
            petal.position,
            new THREE.Quaternion().setFromEuler(petal.rotation),
            new THREE.Vector3(0.1, 0.1, 0.1),
          );
          petalsRef.current.setMatrixAt(i, matrix);
        }
      });
      petalsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Floor */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size * 2, size * 2]} />
        <meshToonMaterial color="#2d1b3d" />
      </mesh>

      {/* Arena border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[size * 0.9, size, 64]} />
        <meshToonMaterial color="#8b5cf6" side={THREE.DoubleSide} />
      </mesh>

      {/* Cherry blossom trees (simplified) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = size * 0.85;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <group key={i} position={[x, 0, z]}>
            {/* Trunk */}
            <mesh position={[0, 2, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 4, 8]} />
              <meshToonMaterial color="#4a3728" />
            </mesh>
            {/* Foliage */}
            <mesh position={[0, 5, 0]} castShadow>
              <sphereGeometry args={[2, 8, 8]} />
              <meshToonMaterial color="#ff69b4" />
            </mesh>
          </group>
        );
      })}

      {/* Floating sakura petals */}
      <instancedMesh
        ref={petalsRef}
        args={[petalGeometry, petalMaterial, petalCount]}
        frustumCulled={false}
      />
    </group>
  );
}

