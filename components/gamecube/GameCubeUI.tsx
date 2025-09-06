/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CubeFace } from '@/types/gamecube';
import { gaEvent } from '@/lib/ga';
import MemoryCardsDock from './MemoryCardsDock';

export default function GameCubeUI({ faces }: { faces: CubeFace[] }) {
  const router = useRouter();
  const [currentFace, setCurrentFace] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const cubeRef = useRef<HTMLDivElement>(null);

  const sortedFaces = useMemo(() => {
    return [...faces].sort((a, b) => a.slot - b.slot);
  }, [faces]);

  const handleFaceClick = (face: CubeFace) => {
    if (isRotating) return;

    gaEvent('nav_face_open', { face: face.slug });
    router.push(`/panel/${face.slug}`);
  };

  const rotateToFace = (targetSlot: number) => {
    if (isRotating) return;

    setIsRotating(true);
    setCurrentFace(targetSlot);

    setTimeout(() => setIsRotating(false), 300);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isRotating) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          rotateToFace(4); // Top
          break;
        case 'ArrowDown':
          e.preventDefault();
          rotateToFace(0); // Front
          break;
        case 'ArrowLeft':
          e.preventDefault();
          rotateToFace(3); // Left
          break;
        case 'ArrowRight':
          e.preventDefault();
          rotateToFace(1); // Right
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const activeFace = sortedFaces[currentFace];
          if (activeFace) {
            handleFaceClick(activeFace);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFace, isRotating, sortedFaces]);

  const getRotationClass = (slot: number) => {
    const rotations = {
      0: 'rotate-y-0', // Front
      1: 'rotate-y-90', // Right
      2: 'rotate-y-180', // Down
      3: 'rotate-y-270', // Left
      4: 'rotate-x-90', // Top
      5: 'rotate-x-90', // Top (second slot)
    };
    return rotations[slot as keyof typeof rotations] || 'rotate-y-0';
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900">
      <MemoryCardsDock />

      <div className="relative perspective-1000">
        <div
          ref={cubeRef}
          className={`w-96 h-96 transition-transform duration-300 ease-out ${getRotationClass(currentFace)}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {sortedFaces.map((face) => (
            <CubeFacePanel
              key={face.slot}
              slot={face.slot}
              label={face.label}
              onClick={() => handleFaceClick(face)}
              disabled={isRotating}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
        <div className="text-sm mb-2">Use arrow keys to navigate</div>
        <div className="text-xs text-gray-300">Press Enter to open face</div>
      </div>
    </div>
  );
}

function CubeFacePanel({
  slot,
  label,
  onClick,
  disabled,
}: {
  slot: 0 | 1 | 2 | 3 | 4 | 5;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  const getPositionClass = (slot: number) => {
    const positions = {
      0: 'translate-z-48', // Front
      1: 'translate-x-48', // Right
      2: 'translate-z-neg-48', // Back
      3: 'translate-x-neg-48', // Left
      4: 'translate-y-neg-48', // Top
      5: 'translate-y-neg-48', // Top (second slot)
    };
    return positions[slot as keyof typeof positions] || 'translate-z-48';
  };

  const getRotationClass = (slot: number) => {
    const rotations = {
      0: 'rotate-y-0', // Front
      1: 'rotate-y-90', // Right
      2: 'rotate-y-180', // Back
      3: 'rotate-y-270', // Left
      4: 'rotate-x-90', // Top
      5: 'rotate-x-90', // Top (second slot)
    };
    return rotations[slot as keyof typeof rotations] || 'rotate-y-0';
  };

  return (
    <div
      className={`absolute w-96 h-96 bg-gradient-to-br from-pink-500/20 to-purple-500/20 
                border-2 border-pink-300/50 rounded-lg cursor-pointer
                transition-all duration-200 hover:scale-105 hover:border-pink-300
                ${getPositionClass(slot)} ${getRotationClass(slot)}
                ${disabled ? 'pointer-events-none opacity-50' : ''}`}
      style={{ transformStyle: 'preserve-3d' }}
      onClick={onClick}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-2">{label}</div>
          <div className="text-sm text-pink-200">Click to open</div>
        </div>
      </div>
    </div>
  );
}
