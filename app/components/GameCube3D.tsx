'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { useRouter } from 'next/navigation';
import type * as THREE from 'three';
import { audio } from '@/app/lib/audio';
import { type CubeFace } from '@/types/gamecube';
import {
  detectSwipeDirection,
  snapToAngle,
  getShortestRotation,
  easeOutCubic,
  getFaceAngle,
  getFacePosition,
  isTap,
  type GestureState,
} from '@/app/lib/gesture-utils';

interface GameCube3DProps {
  faces: CubeFace[];
  onActivate?: (face: CubeFace) => void;
}

function Cube({ faces, onActivate }: { faces: CubeFace[]; onActivate?: (face: CubeFace) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const [currentFace, setCurrentFace] = useState(0);

  // Enable proper rendering settings
  useEffect(() => {
    if (gl) {
      gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      gl.setClearColor('#080611', 1);
    }
  }, [gl]);
  const [isRotating, setIsRotating] = useState(false);
  const [gestureState, setGestureState] = useState<GestureState>({
    startX: 0,
    startY: 0,
    isDragging: false,
    threshold: 30,
  });

  // Use camera for dynamic field of view adjustments
  useEffect(() => {
    if (camera && 'fov' in camera) {
      // TypeScript guard for PerspectiveCamera
      (camera as any).fov = 75;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  // Face mapping: 0=front, 1=right, 2=back, 3=left, 4=top, 5=down

  // Handle face rotation
  const rotateToFace = useCallback(
    (faceIndex: number) => {
      if (isRotating || faceIndex === currentFace) return;

      setIsRotating(true);
      const targetAngle = getFaceAngle(faceIndex);

      if (meshRef.current) {
        const startAngle = meshRef.current.rotation.y;
        const finalDiff = getShortestRotation(startAngle, targetAngle);

        const startTime = Date.now();
        const duration = 300; // ms

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeProgress = easeOutCubic(progress);

          if (meshRef.current) {
            meshRef.current.rotation.y = startAngle + finalDiff * easeProgress;
          }

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            if (meshRef.current) {
              meshRef.current.rotation.y = snapToAngle(meshRef.current.rotation.y);
            }
            setIsRotating(false);
            audio.play('snap_clack', { gain: 0.6 });
          }
        };

        animate();
      }

      setCurrentFace(faceIndex);
    },
    [currentFace, isRotating],
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRotating) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          audio.play('gamecube_menu', { gain: 0.4 });
          rotateToFace((currentFace + 1) % 4); // Cycle through sides
          break;
        case 'ArrowRight':
          e.preventDefault();
          audio.play('gamecube_menu', { gain: 0.4 });
          rotateToFace((currentFace - 1 + 4) % 4);
          break;
        case 'ArrowUp':
          e.preventDefault();
          audio.play('gamecube_menu', { gain: 0.4 });
          rotateToFace(4); // Top
          break;
        case 'ArrowDown':
          e.preventDefault();
          audio.play('gamecube_menu', { gain: 0.4 });
          rotateToFace(5); // Down
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const activeFace = faces[currentFace];
          if (activeFace?.enabled) {
            audio.play('samus_jingle', { gain: 0.5 });
            onActivate?.(activeFace);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFace, isRotating, faces, onActivate, rotateToFace]);

  // Handle gesture controls
  const handlePointerDown = useCallback((e: any) => {
    setGestureState({
      startX: e.clientX,
      startY: e.clientY,
      isDragging: false,
      threshold: 30,
    });
  }, []);

  const handlePointerMove = useCallback(
    (e: any) => {
      if (!gestureState.isDragging) {
        const deltaX = Math.abs(e.clientX - gestureState.startX);
        const deltaY = Math.abs(e.clientY - gestureState.startY);

        if (deltaX > gestureState.threshold || deltaY > gestureState.threshold) {
          setGestureState((prev) => ({ ...prev, isDragging: true }));
        }
      }
    },
    [gestureState],
  );

  const handlePointerUp = useCallback(
    (e: any) => {
      if (!gestureState.isDragging) {
        // Check if it's a tap
        if (
          isTap(
            gestureState.startX,
            gestureState.startY,
            e.clientX,
            e.clientY,
            gestureState.threshold,
          )
        ) {
          const activeFace = faces[currentFace];
          if (activeFace?.enabled) {
            audio.play('samus_jingle', { gain: 0.5 });
            onActivate?.(activeFace);
          }
        }
      } else {
        // Swipe gesture
        const swipe = detectSwipeDirection(
          gestureState.startX,
          gestureState.startY,
          e.clientX,
          e.clientY,
          gestureState.threshold,
        );

        switch (swipe.direction) {
          case 'left':
            audio.play('gamecube_menu', { gain: 0.4 });
            rotateToFace((currentFace + 1) % 4);
            break;
          case 'right':
            audio.play('gamecube_menu', { gain: 0.4 });
            rotateToFace((currentFace - 1 + 4) % 4);
            break;
          case 'up':
            audio.play('gamecube_menu', { gain: 0.4 });
            rotateToFace(4); // Top
            break;
          case 'down':
            audio.play('gamecube_menu', { gain: 0.4 });
            rotateToFace(5); // Down
            break;
        }
      }

      setGestureState({
        startX: 0,
        startY: 0,
        isDragging: false,
        threshold: 30,
      });
    },
    [gestureState, currentFace, faces, onActivate, rotateToFace],
  );

  // Gentle idle rotation
  useFrame((state) => {
    if (meshRef.current && !isRotating) {
      meshRef.current.rotation.y += Math.sin(state.clock.elapsedTime * 0.1) * 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={(e) => {
          e.stopPropagation();
          const activeFace = faces[currentFace];
          if (activeFace?.enabled) {
            audio.play('samus_jingle', { gain: 0.5 });
            onActivate?.(activeFace);
          }
        }}
      >
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial
          color="#ff69b4"
          metalness={0.3}
          roughness={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Face labels */}
      {faces.map((face) => {
        const position = getFacePosition(face.slot);
        const angle = getFaceAngle(face.slot);
        return (
          <Text
            key={face.key}
            position={position}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
            rotation={[0, angle, 0]}
          >
            {face.label}
          </Text>
        );
      })}
    </group>
  );
}

export default function GameCube3D({ faces, onActivate }: GameCube3DProps) {
  const router = useRouter();
  const [backgroundMusic, setBackgroundMusic] = useState<(() => void) | null>(null);

  // Handle face activation - passed down to Cube component
  const handleFaceActivation = useCallback(
    (face: CubeFace) => {
      // Call parent callback if provided
      if (onActivate) {
        onActivate(face);
      }

      // Only navigate if face is enabled
      if (face.enabled) {
        // Stop background music before navigation
        if (backgroundMusic) {
          backgroundMusic();
          setBackgroundMusic(null);
        }

        // Navigate to face route (use face.route or fallback to /panel/{slug})
        const route = face.route || `/panel/${face.slug}`;
        router.push(route);
      }
    },
    [router, backgroundMusic, onActivate],
  );

  // Start background menu music when component mounts
  useEffect(() => {
    const startBackgroundMusic = () => {
      const stopMusic = audio.play('gamecube_menu', {
        gain: 0.3,
        loop: true,
      });
      setBackgroundMusic(() => stopMusic);
    };

    // Start background music after a short delay
    const timer = setTimeout(startBackgroundMusic, 500);
    return () => {
      clearTimeout(timer);
      if (backgroundMusic) {
        backgroundMusic();
      }
    };
  }, []);

  // Cleanup background music on unmount
  useEffect(() => {
    return () => {
      if (backgroundMusic) {
        backgroundMusic();
      }
    };
  }, [backgroundMusic]);

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} />

        <Cube faces={faces} onActivate={handleFaceActivation} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          autoRotate={false}
        />
      </Canvas>

      {/* Instructions */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
        <div className="text-sm mb-2">Use arrow keys or swipe to navigate</div>
        <div className="text-xs text-gray-300">Press Enter, Space, or tap to activate</div>
      </div>
    </div>
  );
}
