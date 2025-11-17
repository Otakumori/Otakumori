'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { ACESFilmicToneMapping, Color, type Group, type Mesh } from 'three';

import type { AvatarSize } from '@/app/lib/avatar-sizes';

interface AvatarRendererProps {
  config: any;
  size?: AvatarSize;
  showInteractions?: boolean;
  physicsEnabled?: boolean;
  className?: string;
}

// AnimeToon Material Component
function AnimeToonMaterial({ config }: { config: any }) {
  const materialRef = useRef<any>(undefined);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.color = new Color(config.materials?.parameters?.colorA || '#FF6B9D');
      materialRef.current.metalness = config.materials?.parameters?.metallic || 0.1;
      materialRef.current.roughness = config.materials?.parameters?.roughness || 0.3;
      materialRef.current.emissive = new Color(config.materials?.parameters?.rimColor || '#FFD700');
      materialRef.current.emissiveIntensity = config.materials?.parameters?.rimStrength || 0.35;
    }
  }, [config]);

  return (
    <meshStandardMaterial
      ref={materialRef}
      color={config.materials?.parameters?.colorA || '#FF6B9D'}
      metalness={config.materials?.parameters?.metallic || 0.1}
      roughness={config.materials?.parameters?.roughness || 0.3}
      emissive={config.materials?.parameters?.rimColor || '#FFD700'}
      emissiveIntensity={config.materials?.parameters?.rimStrength || 0.35}
      transparent
      opacity={0.95}
    />
  );
}

// Simple Physics Component (Spring-based)
function SimplePhysics({ config, children }: { config: any; children: React.ReactNode }) {
  const groupRef = useRef<Group>(null);
  const [time, setTime] = useState(0);

  useFrame((state, delta) => {
    setTime(state.clock.getElapsedTime());

    if (groupRef.current && config.physics?.softBody?.enable) {
      // Simple spring-based physics
      const springIntensity = config.physics.softBody.stiffness || 0.4;
      const damping = config.physics.softBody.damping || 0.2;
      const maxDisplacement = config.physics.softBody.maxDisplacement || 0.06;

      // Apply subtle breathing motion with damping
      const breathScale = 1 + Math.sin(time * 2) * springIntensity * 0.02;
      const swayX = Math.sin(time * 0.5) * springIntensity * 0.01;
      const swayY = Math.cos(time * 0.3) * springIntensity * 0.005;

      // Apply damping to smooth out movement (frame-rate independent)
      const dampingFactor = Math.pow(1 - damping, delta * 60);

      // Clamp displacement to maxDisplacement
      const clampedSwayX = Math.max(-maxDisplacement, Math.min(maxDisplacement, swayX));
      const clampedSwayY = Math.max(-maxDisplacement, Math.min(maxDisplacement, swayY));

      // Apply with damping for smooth motion
      groupRef.current.scale.lerp(
        { x: breathScale, y: breathScale, z: breathScale } as any,
        dampingFactor,
      );
      groupRef.current.rotation.x += (clampedSwayY - groupRef.current.rotation.x) * dampingFactor;
      groupRef.current.rotation.z += (clampedSwayX - groupRef.current.rotation.z) * dampingFactor;

      // Clamp displacement
      groupRef.current.position.y = Math.min(
        maxDisplacement,
        Math.sin(time) * springIntensity * 0.01,
      );
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

// Character Mesh Component
function CharacterMesh({ config }: { config: any }) {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Apply morph targets based on configuration
      const morphTargets = meshRef.current.morphTargetDictionary;
      const morphInfluences = meshRef.current.morphTargetInfluences;
      if (morphTargets && morphInfluences) {
        // Use delta for smooth interpolation of morph targets (frame-rate independent)
        const interpSpeed = Math.min(delta * 5, 1); // Smooth interpolation

        // Apply face morphs with smooth transitions
        if (morphTargets.eyeSize) {
          const targetValue = (config.face?.eyes?.size || 1.0) - 1.0;
          morphInfluences[morphTargets.eyeSize] +=
            (targetValue - morphInfluences[morphTargets.eyeSize]) * interpSpeed;
        }
        if (morphTargets.jawStrength) {
          const targetValue = config.face?.faceShape?.jawline || 0.5;
          morphInfluences[morphTargets.jawStrength] +=
            (targetValue - morphInfluences[morphTargets.jawStrength]) * interpSpeed;
        }
        if (morphTargets.cheekbones) {
          const targetValue = config.face?.faceShape?.cheekbones || 0.5;
          morphInfluences[morphTargets.cheekbones] +=
            (targetValue - morphInfluences[morphTargets.cheekbones]) * interpSpeed;
        }

        // Apply body morphs with smooth transitions
        if (morphTargets.muscleMass) {
          const targetValue = config.body?.muscleMass || 0.5;
          morphInfluences[morphTargets.muscleMass] +=
            (targetValue - morphInfluences[morphTargets.muscleMass]) * interpSpeed;
        }
        if (morphTargets.bodyFat) {
          const targetValue = config.body?.bodyFat || 0.5;
          morphInfluences[morphTargets.bodyFat] +=
            (targetValue - morphInfluences[morphTargets.bodyFat]) * interpSpeed;
        }

        // Use state.clock for time-based animations (breathing effect)
        const time = state.clock.getElapsedTime();
        if (morphTargets.breathe) {
          morphInfluences[morphTargets.breathe] = Math.sin(time * 2) * 0.1;
        }
      }
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Base humanoid geometry - this would be replaced with actual character mesh */}
      <capsuleGeometry args={[0.5, 1.8, 8, 16]} />
      <AnimeToonMaterial config={config} />
    </mesh>
  );
}

// Hair Component
function HairComponent({ config }: { config: any }) {
  if (!config.hair) return null;

  return (
    <group>
      {/* Hair geometry would be loaded here */}
      <mesh>
        <sphereGeometry args={[0.6, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial
          color={config.hair.color?.primary || '#8B4513'}
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}

// Outfit Component
function OutfitComponent({ config }: { config: any }) {
  if (!config.outfit) return null;

  return (
    <group>
      {/* Outfit geometry would be loaded here */}
      <mesh>
        <cylinderGeometry args={[0.6, 0.4, 1.2, 16]} />
        <meshStandardMaterial
          color={config.outfit.primary?.color || '#FF6B9D'}
          metalness={0.2}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}

// Scene Component
function AvatarScene({ config, physicsEnabled = true }: { config: any; physicsEnabled?: boolean }) {
  const { camera } = useThree();

  useEffect(() => {
    // Set up camera
    camera.position.set(0, 1.5, 3);
    camera.lookAt(0, 1.5, 0);
  }, [camera]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ec4899" castShadow />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} color="#8b5cf6" />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Character */}
      {physicsEnabled ? (
        <SimplePhysics config={config}>
          <CharacterMesh config={config} />
          <HairComponent config={config} />
          <OutfitComponent config={config} />
        </SimplePhysics>
      ) : (
        <>
          <CharacterMesh config={config} />
          <HairComponent config={config} />
          <OutfitComponent config={config} />
        </>
      )}

      {/* Ground shadow */}
      <ContactShadows position={[0, -1, 0]} opacity={0.25} scale={10} blur={1.5} far={4.5} />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

// Main Avatar Renderer Component
export function AvatarRenderer({
  config,
  size = 'md',
  showInteractions = false,
  physicsEnabled = false,
  className = '',
}: AvatarRendererProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`bg-black/20 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-white text-sm">Loading Avatar...</p>
        </div>
      </div>
    );
  }

  // Map canonical sizes to container classes
  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'w-24 h-24',
    sm: 'w-32 h-32',
    md: 'w-64 h-64',
    lg: 'w-96 h-96',
    xl: 'w-[512px] h-[512px]',
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <Canvas
        camera={{ position: [0, 1.5, 3], fov: 50 }}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        className="rounded-lg"
      >
        <Suspense fallback={null}>
          <AvatarScene config={config} physicsEnabled={physicsEnabled} />
        </Suspense>
      </Canvas>

      {/* Interaction overlay */}
      {showInteractions && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/50 rounded-lg p-2">
              <div className="text-white text-xs text-center">
                {config.gender} • {config.age} • {(config.body?.height * 100)?.toFixed(0)}% height
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
