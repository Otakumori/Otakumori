'use client';

import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface PetalInstance {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
  life: number;
  maxLife: number;
  opacity: number;
  color: [number, number, number];
  size: number;
}

interface WebGLPetalStreamProps {
  variant: 'hero' | 'spacer';
  maxPetals?: number;
  className?: string;
  intensity?: number;
}

// Petal geometry component
function PetalGeometry() {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1, 1, 1);

    // Create petal shape with vertices
    const positions = geo.attributes.position.array as Float32Array;

    // Modify vertices to create petal shape
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];

      // Create petal shape using parametric equations
      const angle = Math.atan2(y, x);
      const radius = Math.sqrt(x * x + y * y);

      // Petal shape: r = a * (1 + cos(n*θ)) where n controls petal count
      const petalRadius = 0.5 * (1 + Math.cos(4 * angle));
      const newRadius = radius * petalRadius;

      positions[i] = newRadius * Math.cos(angle);
      positions[i + 1] = newRadius * Math.sin(angle);
    }

    geo.computeVertexNormals();
    return geo;
  }, []);

  return <primitive object={geometry} />;
}

// Petal material component
function PetalMaterial({ texture }: { texture: THREE.Texture | null }) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: texture },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
        uColor: { value: new THREE.Color(1, 0.5, 0.8) },
        uRimColor: { value: new THREE.Color(1, 0.8, 0.9) },
        uRimPower: { value: 2.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vOpacity;
        
        uniform float uTime;
        uniform float uOpacity;
        
        void main() {
          vUv = uv;
          vNormal = normal;
          vPosition = position;
          vOpacity = uOpacity;
          
          // Add subtle wind animation
          vec3 pos = position;
          pos.y += sin(position.x * 2.0 + uTime * 0.5) * 0.1;
          pos.x += cos(position.y * 2.0 + uTime * 0.3) * 0.05;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform float uOpacity;
        uniform vec3 uColor;
        uniform vec3 uRimColor;
        uniform float uRimPower;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec4 texColor = texture2D(uTexture, vUv);
          
          // Rim lighting effect
          float rim = 1.0 - max(0.0, dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
          rim = pow(rim, uRimPower);
          
          // Combine base color with rim lighting
          vec3 finalColor = mix(uColor, uRimColor, rim * 0.5);
          
          // Add subtle animation
          float pulse = sin(uTime * 2.0 + vPosition.x * 10.0) * 0.1 + 0.9;
          finalColor *= pulse;
          
          // Apply texture and opacity
          gl_FragColor = vec4(finalColor * texColor.rgb, texColor.a * uOpacity);
        }
      `,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
    });
  }, [texture]);

  useFrame((state) => {
    if (material.uniforms.uTime) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return <primitive object={material} />;
}

// Petal instances component
function PetalInstances({
  instances,
  texture,
  onUpdate,
}: {
  instances: PetalInstance[];
  texture: THREE.Texture | null;
  onUpdate: (instances: PetalInstance[]) => void;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    const updatedInstances = instances.map((instance, index) => {
      // Update physics
      instance.position[0] += instance.velocity[0] * delta;
      instance.position[1] += instance.velocity[1] * delta;
      instance.position[2] += instance.velocity[2] * delta;

      instance.rotation[0] += instance.angularVelocity[0] * delta;
      instance.rotation[1] += instance.angularVelocity[1] * delta;
      instance.rotation[2] += instance.angularVelocity[2] * delta;

      // Update life
      instance.life -= delta;
      instance.opacity = Math.max(0, instance.life / instance.maxLife);

      // Apply wind forces
      const windStrength = 0.5;
      instance.velocity[0] +=
        Math.sin(state.clock.elapsedTime + instance.position[1] * 0.01) * windStrength * delta;
      instance.velocity[1] +=
        Math.cos(state.clock.elapsedTime + instance.position[0] * 0.01) * windStrength * delta;

      // Apply gravity
      instance.velocity[1] -= 2.0 * delta;

      // Update instance matrix
      const matrix = new THREE.Matrix4();
      matrix.compose(
        new THREE.Vector3(...instance.position),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...instance.rotation)),
        new THREE.Vector3(instance.scale * instance.size, instance.scale * instance.size, 1),
      );

      meshRef.current!.setMatrixAt(index, matrix);

      return instance;
    });

    // Remove dead instances and add new ones
    const aliveInstances = updatedInstances.filter((instance) => instance.life > 0);
    const newInstances = generateNewPetals(aliveInstances.length, instances.length);
    const finalInstances = [...aliveInstances, ...newInstances];

    meshRef.current!.instanceMatrix.needsUpdate = true;
    onUpdate(finalInstances);
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, instances.length]}>
      <PetalGeometry />
      <PetalMaterial texture={texture} />
    </instancedMesh>
  );
}

// Generate new petals
function generateNewPetals(currentCount: number, maxCount: number): PetalInstance[] {
  const newPetals: PetalInstance[] = [];
  const needed = Math.min(maxCount - currentCount, 3); // Spawn up to 3 at a time

  for (let i = 0; i < needed; i++) {
    newPetals.push({
      id: `petal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: [
        (Math.random() - 0.5) * 20, // X: -10 to 10
        10 + Math.random() * 5, // Y: 10 to 15 (above view)
        (Math.random() - 0.5) * 10, // Z: -5 to 5
      ],
      rotation: [
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ],
      scale: 0.5 + Math.random() * 0.5,
      velocity: [
        (Math.random() - 0.5) * 2, // X velocity
        -1 - Math.random() * 2, // Y velocity (falling)
        (Math.random() - 0.5) * 1, // Z velocity
      ],
      angularVelocity: [
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      ],
      life: 8 + Math.random() * 4, // 8-12 seconds
      maxLife: 8 + Math.random() * 4,
      opacity: 1,
      color: [
        0.9 + Math.random() * 0.1, // R: 0.9-1.0
        0.3 + Math.random() * 0.4, // G: 0.3-0.7
        0.6 + Math.random() * 0.3, // B: 0.6-0.9
      ],
      size: 0.5 + Math.random() * 0.5,
    });
  }

  return newPetals;
}

// Camera controller
function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

// Main WebGL petal stream component
export default function WebGLPetalStream({
  maxPetals = 50,
  className = '',
}: WebGLPetalStreamProps) {
  const [instances, setInstances] = useState<PetalInstance[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load petal texture
  const texture = useTexture('/textures/petal.png', (texture) => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;
  });

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Pause animation when document is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Handle visibility change if needed
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Initialize instances
  useEffect(() => {
    if (reducedMotion) return;

    const initialInstances = generateNewPetals(0, Math.min(maxPetals, 10));
    setInstances(initialInstances);
  }, [maxPetals, reducedMotion]);

  // Don't render if reduced motion is preferred
  if (reducedMotion) {
    return null;
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]} // Limit pixel ratio for performance
      >
        <CameraController />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.6} />
        <pointLight position={[-10, -10, -5]} intensity={0.3} color="#ec4899" />

        {/* Petal instances */}
        <PetalInstances instances={instances} texture={texture} onUpdate={setInstances} />

        {/* Fog for depth */}
        <fog attach="fog" args={['#1a1320', 5, 20]} />
      </Canvas>
    </div>
  );
}
