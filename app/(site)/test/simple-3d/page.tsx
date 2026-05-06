'use client';

/**
 * Simple 3D Test - Minimal version to debug white screen
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useState } from 'react';

export default function Simple3DTest() {
  const [breastSize, setBreastSize] = useState(1.0);
  
  return (
    <div className="h-screen bg-gradient-to-b from-purple-900 to-black flex">
      {/* Controls */}
      <div className="w-80 bg-black/70 p-6 space-y-4">
        <h1 className="text-white text-2xl font-bold mb-4">Simple 3D Test</h1>
        
        <div>
          <label className="text-white text-sm">Breast Size: {breastSize.toFixed(2)}</label>
          <input 
            type="range" 
            min="0.5" 
            max="2" 
            step="0.1" 
            value={breastSize}
            onChange={(e) => setBreastSize(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="pt-4 border-t border-white/20 text-white/60 text-xs">
          {`If you see a cube, Three.js is working!`}
        </div>
      </div>
      
      {/* 3D Canvas */}
      <div className="flex-1">
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          
          {/* Simple cube that changes size */}
          <mesh>
            <boxGeometry args={[breastSize, breastSize, breastSize]} />
            <meshStandardMaterial color="#ec4899" />
          </mesh>
          
          {/* Simple sphere */}
          <mesh position={[2, 0, 0]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#8b5cf6" />
          </mesh>
          
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}

