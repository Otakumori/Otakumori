'use client';

import { Suspense, useMemo, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { ACESFilmicToneMapping, Vector3, Color, DirectionalLight, AmbientLight } from 'three';
// Note: @react-three/rapier would be used for advanced physics in production
// For now, we'll use simple spring-based physics
import { useMediaQuery } from '@/hooks/use-media-query';
import { type AdultPackType, type AvatarRenderBundleType } from '@/app/adults/_schema/pack.safe';

// AnimeToon Material Component
function AnimeToonMaterial({
  glossStrength = 0.6,
  rimStrength = 0.35,
  colorA = '#ffffff',
  colorB = '#f0f0f0',
  rimColor = '#ff6b9d',
  ...props
}: {
  glossStrength?: number;
  rimStrength?: number;
  colorA?: string;
  colorB?: string;
  rimColor?: string;
  [key: string]: any;
}) {
  const materialRef = useRef<any>(undefined);

  useFrame(({ camera, gl }) => {
    if (materialRef.current) {
      // Update rim lighting based on camera position
      const cameraDirection = new Vector3();
      camera.getWorldDirection(cameraDirection);
      materialRef.current.uniforms.cameraDirection.value = cameraDirection;
    }
  });

  const material = useMemo(() => {
    // This would be a custom shader material in production
    // For now, we'll use a standard material with custom properties
    return {
      type: 'MeshStandardMaterial',
      uniforms: {
        glossStrength: { value: glossStrength },
        rimStrength: { value: rimStrength },
        colorA: { value: new Color(colorA) },
        colorB: { value: new Color(colorB) },
        rimColor: { value: new Color(rimColor) },
        cameraDirection: { value: new Vector3() },
      },
    };
  }, [glossStrength, rimStrength, colorA, colorB, rimColor]);

  return <primitive ref={materialRef} object={material} {...props} />;
}

// Soft Body Physics Component
function SoftBodyPhysics({
  enabled,
  mass = 1.0,
  stiffness = 0.4,
  damping = 0.2,
  maxDisplacement = 0.06,
  children,
}: {
  enabled: boolean;
  mass?: number;
  stiffness?: number;
  damping?: number;
  maxDisplacement?: number;
  children: React.ReactNode;
}) {
  const meshRef = useRef<any>(undefined);
  const [springPositions, setSpringPositions] = useState<Vector3[]>([]);

  useFrame((state, delta) => {
    if (!enabled || !meshRef.current) return;

    // Simple spring-based soft body simulation
    // In production, this would be more sophisticated
    const time = state.clock.elapsedTime;
    const basePosition = meshRef.current.position;

    // Apply subtle jiggle based on time and physics parameters
    const jiggleX = Math.sin(time * 2) * maxDisplacement * 0.1;
    const jiggleY = Math.cos(time * 1.5) * maxDisplacement * 0.05;
    const jiggleZ = Math.sin(time * 1.8) * maxDisplacement * 0.08;

    meshRef.current.position.set(
      basePosition.x + jiggleX,
      basePosition.y + jiggleY,
      basePosition.z + jiggleZ,
    );
  });

  return <group ref={meshRef}>{children}</group>;
}

// Cloth Simulation Component
function ClothSimulation({
  enabled,
  bendStiffness = 0.5,
  stretchStiffness = 0.6,
  damping = 0.2,
  wind = 0.0,
  children,
}: {
  enabled: boolean;
  bendStiffness?: number;
  stretchStiffness?: number;
  damping?: number;
  wind?: number;
  children: React.ReactNode;
}) {
  const meshRef = useRef<any>(undefined);

  useFrame((state, delta) => {
    if (!enabled || !meshRef.current) return;

    // Simple cloth simulation
    // In production, this would use a proper cloth solver
    const time = state.clock.elapsedTime;

    // Apply wind effect
    if (wind > 0) {
      const windEffect = Math.sin(time * 0.5) * wind * 0.1;
      meshRef.current.rotation.z = windEffect;
    }
  });

  return <group ref={meshRef}>{children}</group>;
}

// Avatar Model Component
function AvatarModel({
  bundle,
  physicsConfig,
}: {
  bundle: AvatarRenderBundleType;
  physicsConfig: any;
}) {
  const meshRef = useRef<any>(undefined);

  // Apply morph targets based on slider values
  useEffect(() => {
    if (meshRef.current && bundle.morphs) {
      // In production, this would apply actual morph targets
      // For now, we'll just log the morph values
      console.log('Applying morphs:', bundle.morphs);
    }
  }, [bundle.morphs]);

  return (
    <group>
      {/* Soft Body Physics */}
      <SoftBodyPhysics
        enabled={physicsConfig.softBody.enable}
        mass={physicsConfig.softBody.mass}
        stiffness={physicsConfig.softBody.stiffness}
        damping={physicsConfig.softBody.damping}
        maxDisplacement={physicsConfig.softBody.maxDisplacement}
      >
        {/* Cloth Simulation */}
        <ClothSimulation
          enabled={physicsConfig.clothSim.enable}
          bendStiffness={physicsConfig.clothSim.bendStiffness}
          stretchStiffness={physicsConfig.clothSim.stretchStiffness}
          damping={physicsConfig.clothSim.damping}
          wind={physicsConfig.clothSim.wind}
        >
          {/* Avatar Mesh */}
          <mesh ref={meshRef}>
            {/* In production, this would load the actual avatar model */}
            <boxGeometry args={[1, 2, 0.5]} />
            <AnimeToonMaterial
              glossStrength={bundle.materialParams.glossStrength}
              rimStrength={bundle.materialParams.rimStrength}
              colorA={bundle.materialParams.colorA}
              colorB={bundle.materialParams.colorB}
              rimColor={bundle.materialParams.rimColor}
            />
          </mesh>
        </ClothSimulation>
      </SoftBodyPhysics>
    </group>
  );
}

// Scene Setup Component
function SceneSetup({
  bundle,
  physicsConfig,
}: {
  bundle: AvatarRenderBundleType;
  physicsConfig: any;
}) {
  const { gl } = useThree();

  useEffect(() => {
    // Set up ACES tone mapping for better color grading
    gl.toneMapping = ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.0;
  }, [gl]);

  return (
    <>
      {/* Lighting Setup */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#ff6b9d" />

      {/* Environment */}
      <Environment preset="studio" />

      {/* Contact Shadows */}
      <ContactShadows position={[0, -1, 0]} opacity={0.25} scale={10} blur={2} far={4.5} />

      {/* Avatar Model */}
      <AvatarModel bundle={bundle} physicsConfig={physicsConfig} />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
      />
    </>
  );
}

// Main Preview Scene Component
export function AdultPreviewScene({
  pack,
  sliders = {},
  physicsConfig,
}: {
  pack: AdultPackType;
  sliders?: Record<string, number>;
  physicsConfig?: any;
}) {
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [isLoaded, setIsLoaded] = useState(false);

  // Create avatar bundle from pack data
  const avatarBundle = useMemo((): AvatarRenderBundleType => {
    return {
      albedoUrl: pack.assets.albedo,
      normalUrl: pack.assets.normal,
      ormUrl: pack.assets.orm,
      maskUrl: pack.assets.mask,
      decalsUrl: pack.assets.decals,
      shader: 'AnimeToon',
      materialParams: {
        glossStrength: pack.materials.params.glossStrength,
        rimStrength: pack.materials.params.rimStrength,
        colorA: pack.materials.params.colorA,
        colorB: pack.materials.params.colorB,
        rimColor: pack.materials.params.rimColor,
      },
      physics: {
        softBody: pack.physicsProfile.softBody,
        clothSim: pack.physicsProfile.clothSim,
      },
      morphs: sliders,
    };
  }, [pack, sliders]);

  // Disable physics for reduced motion
  const effectivePhysicsConfig = useMemo(() => {
    if (isReducedMotion) {
      return {
        softBody: { enable: false },
        clothSim: { enable: false },
      };
    }
    return physicsConfig || pack.physicsProfile;
  }, [isReducedMotion, physicsConfig, pack.physicsProfile]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-black">
      <Canvas
        camera={{ position: [0, 1, 5], fov: 50 }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        onCreated={() => setIsLoaded(true)}
      >
        <Suspense fallback={null}>
          <SceneSetup bundle={avatarBundle} physicsConfig={effectivePhysicsConfig} />
        </Suspense>
      </Canvas>

      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white text-lg">Loading preview...</div>
        </div>
      )}
    </div>
  );
}
