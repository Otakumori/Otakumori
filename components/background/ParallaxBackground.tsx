'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { ProceduralTextureGenerator, TEXTURE_PRESETS } from '@/lib/textures/procedural';

interface ParallaxLayer {
  id: string;
  depth: number;
  speed: number;
  scale: number;
  opacity: number;
  texture: THREE.Texture;
  position: [number, number, number];
  rotation: [number, number, number];
}

interface ParallaxBackgroundProps {
  theme: 'cherry' | 'sakura' | 'autumn' | 'night' | 'sunset';
  intensity?: number;
  className?: string;
}

// Parallax layer component
function ParallaxLayer({ layer }: { layer: ParallaxLayer }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Parallax movement based on depth
    const time = state.clock.elapsedTime;
    meshRef.current.position.x = layer.position[0] + Math.sin(time * layer.speed) * 0.5;
    meshRef.current.position.y = layer.position[1] + Math.cos(time * layer.speed * 0.7) * 0.3;
    meshRef.current.rotation.z = layer.rotation[2] + time * layer.speed * 0.1;
  });

  return (
    <mesh ref={meshRef} position={layer.position} rotation={layer.rotation}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial
        map={layer.texture}
        transparent
        opacity={layer.opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Sky component with theme-based colors
function ThemedSky({ theme }: { theme: string }) {
  const skyParams = getSkyParams(theme);

  return (
    <mesh position={[0, 0, -50]}>
      <sphereGeometry args={[100, 32, 32]} />
      <meshBasicMaterial color={skyParams.color} side={THREE.BackSide} fog={false} />
    </mesh>
  );
}

// Stars component with theme-based density
function ThemedStars({ theme }: { theme: string }) {
  const starParams = getStarParams(theme);

  return (
    <Stars
      radius={starParams.radius}
      depth={starParams.depth}
      count={starParams.count}
      factor={starParams.factor}
      saturation={starParams.saturation}
      fade={starParams.fade}
      speed={starParams.speed}
    />
  );
}

// Cloud component with theme-based appearance
function ThemedCloud({ theme }: { theme: string }) {
  const cloudRef = useRef<THREE.Group>(null);
  const cloudParams = getCloudParams(theme);

  useFrame((state) => {
    if (!cloudRef.current) return;

    const time = state.clock.elapsedTime;
    cloudRef.current.position.x = Math.sin(time * 0.1) * 2;
    cloudRef.current.position.y = Math.cos(time * 0.05) * 1;
  });

  return (
    <group ref={cloudRef}>
      <Cloud
        position={[0, 0, -10]}
        speed={cloudParams.speed}
        opacity={cloudParams.opacity}
        color={cloudParams.color}
        segments={cloudParams.segments}
      />
    </group>
  );
}

// Camera controller for parallax effect
function ParallaxCamera({ intensity = 1.0 }: { intensity: number }) {
  const { camera } = useThree();

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Subtle camera movement for parallax effect
    camera.position.x = Math.sin(time * 0.1) * 0.5 * intensity;
    camera.position.y = Math.cos(time * 0.05) * 0.3 * intensity;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// Main parallax background component
export default function ParallaxBackground({
  theme,
  intensity = 1.0,
  className = '',
}: ParallaxBackgroundProps) {
  const [layers, setLayers] = useState<ParallaxLayer[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const generator = useRef(new ProceduralTextureGenerator());

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Generate layers based on theme
  useEffect(() => {
    if (reducedMotion) return;

    const newLayers = generateLayersForTheme(theme, generator.current);
    setLayers(newLayers);
  }, [theme, reducedMotion]);

  // Don't render if reduced motion is preferred
  if (reducedMotion) {
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-b from-purple-900 via-purple-800 to-black ${className}`}
      />
    );
  }

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
      >
        <ParallaxCamera intensity={intensity} />

        {/* Sky and atmosphere */}
        <ThemedSky theme={theme} />
        <ThemedStars theme={theme} />
        <ThemedCloud theme={theme} />

        {/* Parallax layers */}
        {layers.map((layer) => (
          <ParallaxLayer key={layer.id} layer={layer} />
        ))}

        {/* Fog for depth */}
        <fog attach="fog" args={getFogParams(theme)} />
      </Canvas>
    </div>
  );
}

// Theme-based parameter generators
function getSkyParams(theme: string) {
  const themes = {
    cherry: { color: '#ec4899' },
    sakura: { color: '#f8fafc' },
    autumn: { color: '#f59e0b' },
    night: { color: '#1a1320' },
    sunset: { color: '#f97316' },
  };

  return themes[theme as keyof typeof themes] || themes.cherry;
}

function getStarParams(theme: string) {
  const themes = {
    cherry: {
      radius: 100,
      depth: 50,
      count: 2000,
      factor: 4,
      saturation: 0,
      fade: true,
      speed: 0.5,
    },
    sakura: {
      radius: 100,
      depth: 50,
      count: 1000,
      factor: 4,
      saturation: 0,
      fade: true,
      speed: 0.3,
    },
    autumn: {
      radius: 100,
      depth: 50,
      count: 1500,
      factor: 4,
      saturation: 0,
      fade: true,
      speed: 0.4,
    },
    night: {
      radius: 100,
      depth: 50,
      count: 5000,
      factor: 4,
      saturation: 0,
      fade: true,
      speed: 1.0,
    },
    sunset: {
      radius: 100,
      depth: 50,
      count: 1000,
      factor: 4,
      saturation: 0,
      fade: true,
      speed: 0.2,
    },
  };

  return themes[theme as keyof typeof themes] || themes.cherry;
}

function getCloudParams(theme: string) {
  const themes = {
    cherry: { speed: 0.4, opacity: 0.3, color: '#ec4899', segments: 20 },
    sakura: { speed: 0.2, opacity: 0.2, color: '#f8fafc', segments: 15 },
    autumn: { speed: 0.6, opacity: 0.4, color: '#f59e0b', segments: 25 },
    night: { speed: 0.1, opacity: 0.1, color: '#1a1320', segments: 10 },
    sunset: { speed: 0.8, opacity: 0.5, color: '#f97316', segments: 30 },
  };

  return themes[theme as keyof typeof themes] || themes.cherry;
}

function getFogParams(theme: string): [string, number, number] {
  const themes = {
    cherry: ['#1a1320', 5, 20] as [string, number, number],
    sakura: ['#f8fafc', 10, 30] as [string, number, number],
    autumn: ['#2d1b3d', 3, 15] as [string, number, number],
    night: ['#000000', 1, 10] as [string, number, number],
    sunset: ['#4c1d4d', 8, 25] as [string, number, number],
  };

  return themes[theme as keyof typeof themes] || themes.cherry;
}

function generateLayersForTheme(
  theme: string,
  generator: ProceduralTextureGenerator,
): ParallaxLayer[] {
  const layers: ParallaxLayer[] = [];

  // Background layer
  const themePresets = TEXTURE_PRESETS[theme as keyof typeof TEXTURE_PRESETS];
  const backgroundConfig = themePresets?.background || TEXTURE_PRESETS.cherryBlossom.background;
  const backgroundTexture = generator.generateBackgroundTexture(backgroundConfig);

  layers.push({
    id: 'background',
    depth: -20,
    speed: 0.1,
    scale: 1,
    opacity: 0.8,
    texture: backgroundTexture,
    position: [0, 0, -20],
    rotation: [0, 0, 0],
  });

  // Mid-ground layers
  for (let i = 0; i < 3; i++) {
    const petalConfig = themePresets?.petal || TEXTURE_PRESETS.cherryBlossom.petal;
    const petalTexture = generator.generatePetalTexture(petalConfig);

    layers.push({
      id: `midground-${i}`,
      depth: -10 - i * 3,
      speed: 0.2 + i * 0.1,
      scale: 0.5 + i * 0.2,
      opacity: 0.6 - i * 0.1,
      texture: petalTexture,
      position: [i * 2 - 2, i * 0.5, -10 - i * 3],
      rotation: [0, 0, i * 0.5],
    });
  }

  // Foreground layer
  const foregroundConfig = themePresets?.petal || TEXTURE_PRESETS.cherryBlossom.petal;
  const foregroundTexture = generator.generatePetalTexture(foregroundConfig);

  layers.push({
    id: 'foreground',
    depth: -2,
    speed: 0.5,
    scale: 0.3,
    opacity: 0.4,
    texture: foregroundTexture,
    position: [0, 0, -2],
    rotation: [0, 0, 0],
  });

  return layers;
}
