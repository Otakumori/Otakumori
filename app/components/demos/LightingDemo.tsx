'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { THEME_LIGHTING } from '@/app/components/effects/DynamicLightingSystem';
import {
  useDynamicLighting,
  LIGHTING_PRESETS,
  applyLightingPreset,
} from '@/app/hooks/useDynamicLighting';

export default function LightingDemo() {
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEME_LIGHTING>('all');
  const [preset, setPreset] = useState<keyof typeof LIGHTING_PRESETS>('gamecube');
  const [showControls, setShowControls] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const presetSelectId = useId();
  const themeOptionsLabelId = useId();

  const lighting = useDynamicLighting({
    enableMouseInteraction: true,
    enableVolumetricEffects: true,
    ambientIntensity: 0.3,
    autoStart: false,
  });

  // Initialize lighting when canvas is ready
  useEffect(() => {
    if (canvasRef.current && !lighting.isInitialized) {
      const engine = lighting.initialize(canvasRef.current);
      if (engine) {
        lighting.start();
      }
    }
  }, [lighting]);

  // Apply preset when changed
  useEffect(() => {
    if (lighting.isInitialized) {
      applyLightingPreset(lighting, preset);
    }
  }, [preset, lighting.isInitialized]);

  const handleThemeChange = (theme: keyof typeof THEME_LIGHTING) => {
    setCurrentTheme(theme);

    if (!lighting.engine) return;

    const themeConfig = THEME_LIGHTING[theme];

    // Update existing lights with theme colors
    lighting.updateLight('main', {
      color: themeConfig.primary,
      intensity: 0.9,
    });

    lighting.updateLight('rim', {
      color: themeConfig.secondary,
      intensity: 0.5,
    });

    // Update ambient
    lighting.setAmbientLight(
      themeConfig.ambient.r,
      themeConfig.ambient.g,
      themeConfig.ambient.b,
      0.3,
    );
  };

  const handlePresetChange = (newPreset: keyof typeof LIGHTING_PRESETS) => {
    setPreset(newPreset);
  };

  const createRandomBurst = () => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.random() * rect.width;
    const y = Math.random() * rect.height;

    const colors = [
      { r: 1, g: 0.2, b: 0.2 }, // Red
      { r: 0.2, g: 1, b: 0.2 }, // Green
      { r: 0.2, g: 0.2, b: 1 }, // Blue
      { r: 1, g: 1, b: 0.2 }, // Yellow
      { r: 1, g: 0.2, b: 1 }, // Magenta
      { r: 0.2, g: 1, b: 1 }, // Cyan
    ];

    const color = colors[Math.floor(Math.random() * colors.length)];
    lighting.createLightBurst(x, y, color, 2000);
  };

  const addPulsingLights = () => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const colors = [
      { r: 1, g: 0.3, b: 0.3 },
      { r: 0.3, g: 1, b: 0.3 },
      { r: 0.3, g: 0.3, b: 1 },
    ];

    colors.forEach((color, index) => {
      const angle = (index / colors.length) * Math.PI * 2;
      const radius = 150;
      const x = rect.width / 2 + Math.cos(angle) * radius;
      const y = rect.height / 2 + Math.sin(angle) * radius;

      lighting.createPulsingLight(`pulse-${index}`, x, y, color, 0.6, 0.8 + index * 0.2);
    });

    // Remove after 5 seconds
    setTimeout(() => {
      colors.forEach((_, index) => {
        lighting.removeLight(`pulse-${index}`);
      });
    }, 5000);
  };

  const clearAllLights = () => {
    lighting.clearLights();
    // Re-apply current preset
    setTimeout(() => {
      applyLightingPreset(lighting, preset);
    }, 100);
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          filter: 'blur(0.3px)',
          opacity: 0.7,
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(255, 152, 222, 0.3), transparent 40%), radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.4), transparent 35%), radial-gradient(circle at 50% 80%, rgba(244, 114, 182, 0.35), transparent 45%)',
          mixBlendMode: 'screen',
          opacity: 0.9,
        }}
      />

      {/* Demo Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-lg text-white p-6 rounded-xl max-w-sm z-50 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">
              <span role="img" aria-label="Light bulb" className="mr-2 inline-block">
                💡
              </span>
              Lighting Demo
            </h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-white/60 hover:text-white transition-colors"
              type="button"
              aria-label="Hide lighting controls"
            >
              ×
            </button>
          </div>

          {/* Preset Controls */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor={presetSelectId}>
              Lighting Preset:
            </label>
            <select
              id={presetSelectId}
              value={preset}
              onChange={(event) =>
                handlePresetChange(event.target.value as keyof typeof LIGHTING_PRESETS)
              }
              className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
            >
              {Object.keys(LIGHTING_PRESETS).map((key) => (
                <option key={key} value={key} className="bg-black">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Controls */}
          <div className="mb-4">
            <p id={themeOptionsLabelId} className="block text-sm font-medium mb-2">
              Game Theme:
            </p>
            <div
              className="grid grid-cols-2 gap-2"
              role="group"
              aria-labelledby={themeOptionsLabelId}
            >
              {Object.keys(THEME_LIGHTING).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme as keyof typeof THEME_LIGHTING)}
                  className={`p-2 rounded text-xs font-medium transition-colors ${
                    currentTheme === theme
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                  type="button"
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={createRandomBurst}
              className="w-full p-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded text-white font-medium transition-all transform hover:scale-105"
              type="button"
            >
              <span role="img" aria-label="Sparkles" className="mr-2 inline-block">
                ✨
              </span>
              Light Burst
            </button>

            <button
              onClick={addPulsingLights}
              className="w-full p-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded text-white font-medium transition-all transform hover:scale-105"
              type="button"
            >
              <span role="img" aria-label="Glowing star" className="mr-2 inline-block">
                🌟
              </span>
              Pulsing Lights
            </button>

            <button
              onClick={clearAllLights}
              className="w-full p-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 rounded text-white font-medium transition-all transform hover:scale-105"
              type="button"
            >
              <span role="img" aria-label="Broom" className="mr-2 inline-block">
                🧹
              </span>
              Reset Lights
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 text-xs text-white/60">
            <div>Active Lights: {lighting.getAllLights().length}</div>
            <div>Preset: {preset}</div>
            <div>Theme: {currentTheme}</div>
            <div>Status: {lighting.isRunning ? 'Running' : 'Stopped'}</div>
            <div className="mt-2 text-white/40">
              <span role="img" aria-label="Light bulb" className="mr-2 inline-block">
                💡
              </span>
              Move mouse for dynamic lighting
              <br />
              <span role="img" aria-label="Computer mouse" className="mr-2 inline-block">
                🖱️
              </span>
              Click anywhere for light burst
              <br />
              <span role="img" aria-label="Artist palette" className="mr-2 inline-block">
                🎨
              </span>
              Try different themes and presets
            </div>
          </div>
        </div>
      )}

      {/* Show Controls Button */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full z-50 transition-all transform hover:scale-110"
          type="button"
          aria-label="Show lighting controls"
        >
          <span role="img" aria-label="Light bulb">
            💡
          </span>
        </button>
      )}

      {/* Demo UI Elements (to cast shadows) */}
      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="text-center text-white max-w-4xl mx-auto p-8">
          <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Dynamic Lighting System
          </h1>
          <p className="text-2xl text-white/90 mb-12 leading-relaxed">
            Real-time lighting with shadows, volumetric effects, and interactive illumination
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-all">
              <div className="text-4xl mb-3">
                <span role="img" aria-label="Glowing star">
                  🌟
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-yellow-300">Real-time Shadows</h3>
              <p className="text-sm text-white/70">
                Dynamic shadow casting with realistic projection and soft edges
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-all">
              <div className="text-4xl mb-3">
                <span role="img" aria-label="Foggy weather">
                  🌫️
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-blue-300">Volumetric Effects</h3>
              <p className="text-sm text-white/70">
                Atmospheric fog, light rays, and particle effects for immersion
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-all">
              <div className="text-4xl mb-3">
                <span role="img" aria-label="Artist palette">
                  🎨
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-purple-300">Theme Integration</h3>
              <p className="text-sm text-white/70">
                Adaptive lighting that responds to game themes and user interactions
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transform hover:scale-105 transition-all">
              <div className="text-4xl mb-3">
                <span role="img" aria-label="High voltage">
                  ⚡
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-green-300">Performance</h3>
              <p className="text-sm text-white/70">
                Hardware-accelerated rendering with 60fps smooth animations
              </p>
            </div>
          </div>

          {/* Interactive Elements */}
          <div className="grid grid-cols-3 gap-8">
            <button
              type="button"
              className="bg-gradient-to-br from-red-500/20 to-red-700/20 backdrop-blur-lg rounded-3xl p-8 border border-red-500/30 cursor-pointer transform hover:scale-110 transition-all shadow-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              onClick={() => handleThemeChange('action')}
            >
              <div className="text-6xl mb-4">
                <span role="img" aria-label="Crossed swords">
                  ⚔️
                </span>
              </div>
              <h3 className="text-xl font-bold text-red-300">Action</h3>
            </button>

            <button
              type="button"
              className="bg-gradient-to-br from-blue-500/20 to-blue-700/20 backdrop-blur-lg rounded-3xl p-8 border border-blue-500/30 cursor-pointer transform hover:scale-110 transition-all shadow-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              onClick={() => handleThemeChange('puzzle')}
            >
              <div className="text-6xl mb-4">
                <span role="img" aria-label="Puzzle piece">
                  🧩
                </span>
              </div>
              <h3 className="text-xl font-bold text-blue-300">Puzzle</h3>
            </button>

            <button
              type="button"
              className="bg-gradient-to-br from-green-500/20 to-green-700/20 backdrop-blur-lg rounded-3xl p-8 border border-green-500/30 cursor-pointer transform hover:scale-110 transition-all shadow-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
              onClick={() => handleThemeChange('strategy')}
            >
              <div className="text-6xl mb-4">
                <span role="img" aria-label="Bullseye">
                  🎯
                </span>
              </div>
              <h3 className="text-xl font-bold text-green-300">Strategy</h3>
            </button>
          </div>
        </div>
      </div>

      {/* Click handler for light bursts */}
      <div
        className="absolute inset-0 z-10"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;
          lighting.createLightBurst(x, y, { r: 1, g: 1, b: 1 }, 1500);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const rect = event.currentTarget.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            lighting.createLightBurst(centerX, centerY, { r: 1, g: 1, b: 1 }, 1500);
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Create a light burst"
      />
    </div>
  );
}
