'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useMemo, useEffect, useState } from 'react';
import { LayerPlane } from './LayerPlane';
import { useWorld } from '@/app/world/WorldProvider';
import Avatar from '../avatar/Avatar';
import PetalBurst from '../effects/PetalBurst';

export default function TreeStage() {
  const { settings } = useWorld();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Gate to prevent multiple Canvas components from mounting simultaneously
    // Always mount for now - can be controlled via environment variable later
    setIsMounted(true);
  }, []);

  // Layer definitions: tweak hue/sat/val bands to your artwork
  const layers = useMemo(
    () => [
      {
        name: 'foliageBack',
        hue: [310 / 360, 20 / 360] as [number, number], // magenta→red wrap; handled in shader
        sat: [0.25, 1.0] as [number, number],
        val: [0.25, 0.75] as [number, number], // darker values
        amp: settings.reducedMotion ? 0 : 0.12, // sway amplitude
        speed: 0.15,
        z: -0.08,
      },
      {
        name: 'foliageFront',
        hue: [310 / 360, 20 / 360] as [number, number],
        sat: [0.35, 1.0] as [number, number],
        val: [0.55, 1.0] as [number, number], // brighter values
        amp: settings.reducedMotion ? 0 : 0.18,
        speed: 0.22,
        z: -0.04,
      },
      {
        name: 'trunkRoots',
        hue: [0.03, 0.12] as [number, number], // brown/orange band
        sat: [0.05, 0.55] as [number, number],
        val: [0.18, 0.85] as [number, number],
        amp: settings.reducedMotion ? 0 : 0.05,
        speed: 0.12,
        z: 0.0,
        footerFade: 0.22, // bottom 22% fade into footer
      },
    ],
    [settings.reducedMotion],
  );

  if (!isMounted) return null;

  return (
    <div className="absolute inset-0">
      <Canvas
        orthographic
        dpr={[1, 2]}
        camera={{ position: [0, 0, 1], zoom: 320 }} // adjust zoom for page scale
        gl={{ antialias: true }}
      >
        {/* Subtle environment tone */}
        <color attach="background" args={['#0b0b0b']} />
        <Suspense fallback={null}>
          {layers.map((layer, i) => (
            <LayerPlane
              key={layer.name}
              src="/assets/images/CherryTree.png"
              hue={layer.hue}
              sat={layer.sat}
              val={layer.val}
              z={layer.z}
              amp={layer.amp}
              speed={layer.speed}
              footerFade={layer.footerFade ?? 0}
              leftJustify
            />
          ))}
          <Avatar />
          <PetalBurst />
        </Suspense>
      </Canvas>
    </div>
  );
}
