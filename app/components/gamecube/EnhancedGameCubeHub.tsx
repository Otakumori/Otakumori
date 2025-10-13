'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useDynamicLighting, applyLightingPreset } from '@/app/hooks/useDynamicLighting';
import { THEME_LIGHTING } from '@/app/components/effects/DynamicLightingSystem';
import { type LightSource } from '@/lib/lighting/dynamic-lighting';

interface EnhancedGameCubeHubProps {
  selectedFace?: 'action' | 'puzzle' | 'strategy' | 'all' | null;
  onFaceSelect?: (face: string) => void;
  className?: string;
}

export default function EnhancedGameCubeHub({
  selectedFace = null,
  onFaceSelect,
  className = '',
}: EnhancedGameCubeHubProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(0);

  const lighting = useDynamicLighting({
    enableMouseInteraction: true,
    enableVolumetricEffects: true,
    ambientIntensity: 0.2,
    autoStart: false,
  });

  // Initialize lighting system
  useEffect(() => {
    if (canvasRef.current && !lighting.isInitialized) {
      const engine = lighting.initialize(canvasRef.current);
      if (engine) {
        setupGameCubeLighting();
        lighting.start();
      }
    }
  }, [lighting]);

  // Setup GameCube-specific lighting
  const setupGameCubeLighting = useCallback(() => {
    if (!lighting.engine) return;

    // Apply GameCube preset as base
    applyLightingPreset(lighting, 'gamecube');

    // Add GameCube-specific accent lights
    const cubeCenter = { x: 400, y: 300 }; // Adjust based on actual cube position

    // Top light (simulating overhead lighting)
    const topLight: LightSource = {
      id: 'cube-top',
      type: 'directional',
      position: { x: cubeCenter.x, y: cubeCenter.y - 100, z: 150 },
      color: { r: 0.9, g: 0.9, b: 1 },
      intensity: 0.6,
      range: 350,
      falloff: 1.8,
      castsShadows: true,
      animated: false,
    };

    // Bottom rim light
    const bottomLight: LightSource = {
      id: 'cube-bottom',
      type: 'point',
      position: { x: cubeCenter.x, y: cubeCenter.y + 120, z: 30 },
      color: { r: 0.6, g: 0.4, b: 1 },
      intensity: 0.4,
      range: 200,
      falloff: 2.5,
      castsShadows: false,
      animated: true,
      animationSpeed: 0.4,
    };

    lighting.addLight(topLight);
    lighting.addLight(bottomLight);

    // Add face-specific lights (initially dim)
    const facePositions = {
      action: { x: cubeCenter.x - 80, y: cubeCenter.y - 80 },
      puzzle: { x: cubeCenter.x + 80, y: cubeCenter.y - 80 },
      strategy: { x: cubeCenter.x, y: cubeCenter.y + 80 },
      all: { x: cubeCenter.x, y: cubeCenter.y },
    };

    Object.entries(facePositions).forEach(([face, pos]) => {
      const faceLight: LightSource = {
        id: `face-${face}`,
        type: 'point',
        position: { x: pos.x, y: pos.y, z: 80 },
        color: THEME_LIGHTING[face as keyof typeof THEME_LIGHTING]?.primary || { r: 1, g: 1, b: 1 },
        intensity: 0.1, // Start dim
        range: 120,
        falloff: 2,
        castsShadows: false,
        animated: false,
      };

      lighting.addLight(faceLight);
    });
  }, [lighting]);

  // Update lighting based on selected face
  useEffect(() => {
    if (!lighting.engine || !selectedFace) return;

    const themeConfig = THEME_LIGHTING[selectedFace];

    // Brighten the selected face light
    Object.keys(THEME_LIGHTING).forEach((face) => {
      const intensity = face === selectedFace ? 0.8 : 0.1;
      const color = face === selectedFace ? themeConfig.primary : { r: 0.3, g: 0.3, b: 0.3 };

      lighting.updateLight(`face-${face}`, {
        intensity,
        color,
        animated: face === selectedFace,
        animationSpeed: 1.2,
      });
    });

    // Update main lights with theme colors
    lighting.updateLight('main', {
      color: themeConfig.primary,
      intensity: 0.9,
    });

    lighting.updateLight('rim', {
      color: themeConfig.secondary,
      intensity: 0.6,
    });

    // Update ambient lighting
    lighting.setAmbientLight(
      themeConfig.ambient.r,
      themeConfig.ambient.g,
      themeConfig.ambient.b,
      0.25,
    );
  }, [selectedFace, lighting]);

  // Mouse interaction for cube rotation and lighting
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Calculate rotation based on mouse position
      const rotY = ((mouseX - centerX) / centerX) * 15; // Max 15 degrees
      const rotX = ((mouseY - centerY) / centerY) * -10; // Max 10 degrees

      setRotationY(rotY);
      setRotationX(rotX);

      // Update lighting mouse position
      if (canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const canvasX = event.clientX - canvasRect.left;
        const canvasY = event.clientY - canvasRect.top;
        lighting.setMousePosition(canvasX, canvasY);
      }
    },
    [lighting],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);

    // Intensify lighting on hover
    lighting.updateLight('main', { intensity: 1.1 });
    lighting.updateLight('cube-top', { intensity: 0.8 });

    // Add hover glow effect
    const hoverLight: LightSource = {
      id: 'hover-glow',
      type: 'point',
      position: { x: 400, y: 300, z: 60 },
      color: { r: 1, g: 1, b: 1 },
      intensity: 0.3,
      range: 250,
      falloff: 1.5,
      castsShadows: false,
      animated: true,
      animationSpeed: 2,
    };

    lighting.addLight(hoverLight);
  }, [lighting]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setRotationY(0);
    setRotationX(0);

    // Reset lighting intensity
    lighting.updateLight('main', { intensity: 0.8 });
    lighting.updateLight('cube-top', { intensity: 0.6 });
    lighting.removeLight('hover-glow');
  }, [lighting]);

  const handleFaceClick = useCallback(
    (face: string) => {
      onFaceSelect?.(face);

      // Create light burst effect at face position
      const facePositions = {
        action: { x: 320, y: 220 },
        puzzle: { x: 480, y: 220 },
        strategy: { x: 400, y: 380 },
        all: { x: 400, y: 300 },
      };

      const pos = facePositions[face as keyof typeof facePositions];
      if (pos) {
        const themeColor = THEME_LIGHTING[face as keyof typeof THEME_LIGHTING]?.primary || {
          r: 1,
          g: 1,
          b: 1,
        };
        lighting.createLightBurst(pos.x, pos.y, themeColor, 1500);
      }
    },
    [onFaceSelect, lighting],
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Lighting Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          mixBlendMode: 'screen',
          opacity: 0.85,
        }}
      />

      {/* GameCube Container */}
      <div
        className="relative z-10 w-full h-full flex items-center justify-center"
        style={{
          transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
          transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* GameCube Structure */}
        <div className="relative">
          {/* Main Cube Body */}
          <div
            className={`w-32 h-32 bg-gradient-to-br from-purple-900/40 to-black/60 backdrop-blur-lg border-2 border-white/20 rounded-lg transform transition-all duration-300 ${
              isHovered ? 'scale-110 shadow-2xl' : 'scale-100'
            }`}
            style={{
              boxShadow: isHovered
                ? '0 20px 40px rgba(168, 85, 247, 0.4)'
                : '0 10px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Center Logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-2xl font-bold text-white/90 tracking-wider">OTAKU</div>
            </div>
          </div>

          {/* Face Buttons */}
          <div className="absolute inset-0">
            {/* Action Face (Top-Left) */}
            <button
              onClick={() => handleFaceClick('action')}
              className={`absolute -top-8 -left-8 w-16 h-16 rounded-lg border-2 transition-all duration-300 transform hover:scale-110 ${
                selectedFace === 'action'
                  ? 'bg-red-600/80 border-red-400 shadow-lg shadow-red-500/50'
                  : 'bg-red-600/40 border-red-600/60 hover:bg-red-600/60'
              }`}
            >
              <div className="text-white text-xs font-bold">ACTION</div>
            </button>

            {/* Puzzle Face (Top-Right) */}
            <button
              onClick={() => handleFaceClick('puzzle')}
              className={`absolute -top-8 -right-8 w-16 h-16 rounded-lg border-2 transition-all duration-300 transform hover:scale-110 ${
                selectedFace === 'puzzle'
                  ? 'bg-blue-600/80 border-blue-400 shadow-lg shadow-blue-500/50'
                  : 'bg-blue-600/40 border-blue-600/60 hover:bg-blue-600/60'
              }`}
            >
              <div className="text-white text-xs font-bold">PUZZLE</div>
            </button>

            {/* Strategy Face (Bottom) */}
            <button
              onClick={() => handleFaceClick('strategy')}
              className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-lg border-2 transition-all duration-300 hover:scale-110 ${
                selectedFace === 'strategy'
                  ? 'bg-green-600/80 border-green-400 shadow-lg shadow-green-500/50'
                  : 'bg-green-600/40 border-green-600/60 hover:bg-green-600/60'
              }`}
            >
              <div className="text-white text-xs font-bold">STRATEGY</div>
            </button>

            {/* All Games Face (Left) */}
            <button
              onClick={() => handleFaceClick('all')}
              className={`absolute top-1/2 -left-8 transform -translate-y-1/2 w-16 h-16 rounded-lg border-2 transition-all duration-300 hover:scale-110 ${
                selectedFace === 'all'
                  ? 'bg-purple-600/80 border-purple-400 shadow-lg shadow-purple-500/50'
                  : 'bg-purple-600/40 border-purple-600/60 hover:bg-purple-600/60'
              }`}
            >
              <div className="text-white text-xs font-bold">ALL</div>
            </button>
          </div>
        </div>
      </div>

      {/* Selection Indicator */}
      {selectedFace && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/80 backdrop-blur-lg text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
            Selected: {selectedFace.charAt(0).toUpperCase() + selectedFace.slice(1)}
          </div>
        </div>
      )}

      {/* Instruction Text */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-center">
        <div className="text-white/60 text-sm">Select a face to navigate</div>
      </div>
    </div>
  );
}
