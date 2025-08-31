'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group } from 'three';
import * as THREE from 'three';

interface CharacterEditorProps {
  config: any;
  selectedPreset: string | null;
  onConfigChange: (config: any) => void;
}

export default function CharacterEditor({
  config,
  selectedPreset,
  onConfigChange,
}: CharacterEditorProps) {
  const groupRef = useRef<Group>(null);
  const [animationState, setAnimationState] = useState<
    'idle' | 'happy' | 'excited' | 'focused' | 'sleepy'
  >('idle');
  const [isAnimating, setIsAnimating] = useState(false);

  // PS1/PS2 style low-poly character mesh
  const createLowPolyMesh = () => {
    // Simple box geometry for PS1 style
    const geometry = new THREE.BoxGeometry(1, 2, 0.5);
    const material = new THREE.MeshLambertMaterial({
      color: '#F6A8C7',
      flatShading: true, // PS1 style flat shading
    });
    return new THREE.Mesh(geometry, material);
  };

  // Animation system
  useFrame((state) => {
    if (groupRef.current && isAnimating) {
      const time = state.clock.getElapsedTime();

      switch (animationState) {
        case 'idle':
          groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
          groupRef.current.position.y = Math.sin(time * 2) * 0.05;
          break;
        case 'happy':
          groupRef.current.rotation.y = Math.sin(time * 2) * 0.2;
          groupRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.1);
          break;
        case 'excited':
          groupRef.current.rotation.y = time * 2;
          groupRef.current.position.y = Math.sin(time * 8) * 0.2;
          break;
        case 'focused':
          groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
          break;
        case 'sleepy':
          groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.2;
          groupRef.current.scale.y = 1 - Math.sin(time * 0.5) * 0.1;
          break;
      }
    }
  });

  // Handle preset changes
  useEffect(() => {
    if (selectedPreset && config) {
      // Apply preset to character
      const updatedConfig = {
        ...config,
        configData: {
          ...config.configData,
          selectedPreset,
        },
      };
      onConfigChange(updatedConfig);

      // Trigger animation based on preset
      setIsAnimating(true);
      setAnimationState('excited');

      setTimeout(() => {
        setAnimationState('idle');
        setIsAnimating(false);
      }, 2000);
    }
  }, [selectedPreset, config, onConfigChange]);

  // Context-based reactions
  useEffect(() => {
    const handleContextChange = () => {
      const path = window.location.pathname;

      if (path.includes('/shop')) {
        setAnimationState('excited');
      } else if (path.includes('/games')) {
        setAnimationState('focused');
      } else if (path.includes('/social')) {
        setAnimationState('happy');
      } else {
        setAnimationState('idle');
      }

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleContextChange);
    return () => window.removeEventListener('popstate', handleContextChange);
  }, []);

  return (
    <group ref={groupRef}>
      {/* Main Character Body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshLambertMaterial color="#F6A8C7" flatShading />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.6]} />
        <meshLambertMaterial color="#FFB6C1" flatShading />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.2, 1.3, 0.35]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>
      <mesh position={[0.2, 1.3, 0.35]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshLambertMaterial color="#000000" />
      </mesh>

      {/* Hair (if selected) */}
      {config?.configData?.hair && (
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[1, 0.3, 0.8]} />
          <meshLambertMaterial color="#8B4513" flatShading />
        </mesh>
      )}

      {/* Arms */}
      <mesh position={[-0.7, 0.5, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshLambertMaterial color="#FFB6C1" flatShading />
      </mesh>
      <mesh position={[0.7, 0.5, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshLambertMaterial color="#FFB6C1" flatShading />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.3, -1.2, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshLambertMaterial color="#4169E1" flatShading />
      </mesh>
      <mesh position={[0.3, -1.2, 0]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshLambertMaterial color="#4169E1" flatShading />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#F6A8C7" />
    </group>
  );
}
