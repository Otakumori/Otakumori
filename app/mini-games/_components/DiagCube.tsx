'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect } from 'react';

function Box() {
  return (
    <mesh rotation={[0.4, 0.8, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      {/* loud color for visibility */}
      <meshBasicMaterial color="hotpink" />
    </mesh>
  );
}

export default function DiagCube() {
  useEffect(() => {
    // Explicit boot signal to the console
    console.log('%c[DiagCube] mounted → attempting WebGL render', 'color:#9AE6B4');
  }, []);

  return (
    <div className="relative h-[70vh] w-full rounded-2xl overflow-hidden border border-white/10 bg-black/20">
      <Suspense fallback={<div className="p-4 text-sm text-gray-300">{<><span role='img' aria-label='emoji'>L</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>g</span>' '<span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>v</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>s</span>…</>}</div>}>
        <Canvas dpr={[1, 2]} camera={{ fov: 60, position: [2.5, 2, 2.5] }}>
          <ambientLight intensity={1.2} />
          <Box />
          <OrbitControls enablePan={false} />
        </Canvas>
      </Suspense>
    </div>
  );
}
