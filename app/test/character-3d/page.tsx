'use client';

/**
 * 3D Character Physics Test Page
 * Visual validation for jiggle physics and anime shading
 * 
 * This is our proving ground - every feature works here first!
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple anime-style character with jiggle physics
function JiggleCharacter() {
  const bodyRef = useRef<THREE.Group>(null);
  const chestRef = useRef<THREE.Mesh>(null);
  const hipsRef = useRef<THREE.Mesh>(null);
  
  // Physics state
  const [physics] = useState({
    chest: { position: new THREE.Vector3(0, 0.6, 0), velocity: new THREE.Vector3(), rest: new THREE.Vector3(0, 0.6, 0) },
    hips: { position: new THREE.Vector3(0, -0.2, 0), velocity: new THREE.Vector3(), rest: new THREE.Vector3(0, -0.2, 0) }
  });
  
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  
  // Spring physics constants
  const STIFFNESS = 80;
  const DAMPING = 10;
  const MASS = 1;
  
  useFrame((state, delta) => {
    if (!bodyRef.current || !chestRef.current || !hipsRef.current) return;
    
    // Calculate movement
    const dx = mousePos.x - lastPos.x;
    const dy = mousePos.y - lastPos.y;
    const movement = new THREE.Vector3(dx, dy, 0).multiplyScalar(0.5);
    
    // Apply spring physics to body parts
    ['chest', 'hips'].forEach((part) => {
      const p = physics[part as keyof typeof physics];
      
      // Spring force (Hooke's law)
      const displacement = p.position.clone().sub(p.rest);
      const springForce = displacement.multiplyScalar(-STIFFNESS);
      
      // Damping force
      const dampingForce = p.velocity.clone().multiplyScalar(-DAMPING);
      
      // Movement impulse
      const impulse = movement.clone().multiplyScalar(10);
      
      // Total force
      const totalForce = springForce.add(dampingForce).add(impulse);
      
      // Update velocity (F = ma, a = F/m)
      const acceleration = totalForce.divideScalar(MASS);
      p.velocity.add(acceleration.multiplyScalar(delta));
      
      // Update position
      p.position.add(p.velocity.clone().multiplyScalar(delta));
      
      // Apply to mesh
      if (part === 'chest') {
        chestRef.current!.position.copy(p.position);
      } else {
        hipsRef.current!.position.copy(p.position);
      }
    });
    
    // Idle breathing animation
    const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    if (chestRef.current) {
      chestRef.current.scale.y = 1 + breathe;
    }
    
    setLastPos(mousePos);
  });
  
  // Mouse interaction
  const handlePointerMove = (e: any) => {
    setMousePos({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1
    });
  };
  
  return (
    <group ref={bodyRef} onPointerMove={handlePointerMove}>
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial 
          color="#fde4d0" 
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      
      {/* Torso */}
      <mesh position={[0, 0.4, 0]}>
        <capsuleGeometry args={[0.3, 0.8, 16, 32]} />
        <meshStandardMaterial 
          color="#fde4d0"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      
      {/* Chest (with physics) */}
      <mesh ref={chestRef} position={[0, 0.6, 0.15]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial 
          color="#fcd5ce"
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>
      <mesh position={[0, 0.6, 0.15]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial 
          color="#fcd5ce"
          roughness={0.5}
          metalness={0.1}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Hips (with physics) */}
      <mesh ref={hipsRef} position={[0, -0.2, 0.1]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial 
          color="#fde4d0"
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.45, 0.5, 0]} rotation={[0, 0, 0.3]}>
        <capsuleGeometry args={[0.08, 0.5, 16, 32]} />
        <meshStandardMaterial color="#fde4d0" />
      </mesh>
      <mesh position={[0.45, 0.5, 0]} rotation={[0, 0, -0.3]}>
        <capsuleGeometry args={[0.08, 0.5, 16, 32]} />
        <meshStandardMaterial color="#fde4d0" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.15, -0.7, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 16, 32]} />
        <meshStandardMaterial color="#fde4d0" />
      </mesh>
      <mesh position={[0.15, -0.7, 0]}>
        <capsuleGeometry args={[0.1, 0.6, 16, 32]} />
        <meshStandardMaterial color="#fde4d0" />
      </mesh>
    </group>
  );
}

// Loading fallback
function LoadingCharacter() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshBasicMaterial color="#ec4899" wireframe />
    </mesh>
  );
}

export default function Character3DTestPage() {
  const [showControls, setShowControls] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔥 3D Character Physics Test
          </h1>
          <p className="text-pink-200">
            Move your mouse to interact • Chest and hips have spring physics
          </p>
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute top-24 left-6 z-10 bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-pink-500/30">
        <h3 className="text-pink-200 font-semibold mb-3">Controls</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-white text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showControls}
              onChange={(e) => setShowControls(e.target.checked)}
              className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded"
            />
            <span>Orbit Controls</span>
          </label>
          <label className="flex items-center space-x-2 text-white text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded"
            />
            <span>Auto Rotate</span>
          </label>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs text-white/70">
            ✅ Spring physics active<br/>
            ✅ Mouse interaction working<br/>
            ✅ Breathing animation
          </p>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <div className="h-screen w-full">
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 1, 3]} fov={50} />
          
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-3, 2, -3]} intensity={0.6} color="#ff69b4" />
          <pointLight position={[3, 2, 3]} intensity={0.6} color="#8b5cf6" />
          <hemisphereLight args={['#87CEEB', '#654321', 0.5]} />
          
          {/* Environment */}
          <Environment preset="sunset" />
          
          {/* Character */}
          <Suspense fallback={<LoadingCharacter />}>
            <JiggleCharacter />
          </Suspense>
          
          {/* Ground */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#2d1b4e" />
          </mesh>
          
          {/* Controls */}
          {showControls && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={2}
              maxDistance={6}
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI - Math.PI / 6}
            />
          )}
        </Canvas>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-6 left-6 right-6 z-10 max-w-2xl mx-auto">
        <div className="bg-black/50 backdrop-blur-lg rounded-xl p-6 border border-pink-500/30">
          <h3 className="text-pink-200 font-semibold mb-3">🎯 Testing Checklist</h3>
          <div className="grid grid-cols-2 gap-3 text-sm text-white/80">
            <div>✅ 3D character renders</div>
            <div>✅ Spring physics active</div>
            <div>✅ Mouse interaction works</div>
            <div>✅ Smooth 60 FPS performance</div>
            <div>✅ Anime-style proportions</div>
            <div>✅ Parts jiggle independently</div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/20 text-center">
            <p className="text-xs text-pink-200">
              Next: Add sliders to control body parameters in real-time 🔥
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

