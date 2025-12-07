'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { OrbitControls, Environment } from '@react-three/drei';
import Avatar3D from './Avatar3D';
import type { AvatarConfiguration } from '@/app/lib/3d/avatar-parts';

interface AvatarViewerProps {
  configuration: AvatarConfiguration;
  className?: string;
  enableControls?: boolean;
  autoRotate?: boolean;
  lighting?: 'studio' | 'dramatic' | 'soft' | 'anime' | 'intimate';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  }

export default function AvatarViewer({
  configuration,
  className = '',
  enableControls = true,
  autoRotate = false,
  lighting = 'studio',
  quality = 'medium',
}: AvatarViewerProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 1.5, 3], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          {/* Environment */}
          <Environment preset="studio" />

          {/* Camera controls */}
          {enableControls && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              minDistance={1}
              maxDistance={10}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI - Math.PI / 6}
            />
          )}

          {/* 3D Avatar */}
          <Avatar3D
            configuration={configuration}
            lighting={lighting}
            enableControls={false} // Controls are handled by OrbitControls
            enableAnimations={true}
            showOutline={false}
            quality={quality}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

// Compact viewer for small spaces (like profile cards)
export function AvatarViewerCompact({
  configuration,
  className = '',
}: {
  configuration: AvatarConfiguration;
  className?: string;
}) {
  return (
    <AvatarViewer
      configuration={configuration}
      className={className}
      enableControls={false}
      autoRotate={true}
      lighting="soft"
      quality="low"
    />
  );
}

// Interactive viewer for larger displays
export function AvatarViewerInteractive({
  configuration,
  className = '',
}: {
  configuration: AvatarConfiguration;
  className?: string;
}) {
  return (
    <AvatarViewer
      configuration={configuration}
      className={className}
      enableControls={true}
      autoRotate={false}
      lighting="studio"
      quality="high"
    />
  );
}
