'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';
import { Suspense } from 'react';

function GameCubeScene() {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <Canvas camera={{ position: [3, 2, 3] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Box args={[1, 1, 1]} position={[0, 0, 0]}>
            <meshStandardMaterial color="hotpink" />
          </Box>
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default function GameCube() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white mb-2">Mini-Games</h1>
        <p className="text-gray-300">Interactive 3D experiences powered by React Three Fiber</p>
      </div>

      <div className="bg-gray-900/50 rounded-lg p-6">
        <h2 className="text-xl font-medium text-white mb-4">GameCube Demo</h2>
        <p className="text-gray-400 mb-4">
          Click and drag to orbit around the cube. Use scroll to zoom in/out.
        </p>
        <GameCubeScene />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-2">Coming Soon</h3>
          <p className="text-gray-400">More interactive 3D games and experiences</p>
        </div>

        <div className="bg-gray-900/50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-2">Performance</h3>
          <p className="text-gray-400">Optimized for smooth 60fps gameplay</p>
        </div>
      </div>
    </div>
  );
}
