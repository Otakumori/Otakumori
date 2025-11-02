'use client';

import { useState, useId } from 'react';
import AdvancedPetalSystem from '@/app/components/effects/AdvancedPetalSystem';
import { useAdvancedPetals, SEASONAL_WINDS, PETAL_PRESETS } from '@/app/hooks/useAdvancedPetals';
import { type PhysicsPetal } from '@/lib/physics/petal-physics';

export default function PetalPhysicsDemo() {
  const [preset, setPreset] = useState<keyof typeof PETAL_PRESETS>('normal');
  const [season, setSeason] = useState<keyof typeof SEASONAL_WINDS>('spring');
  const [showControls, setShowControls] = useState(true);
  const presetSelectId = useId();
  const seasonSelectId = useId();

  const { spawnPetal, setWind, clearPetals, createWindBurst, addCollisionBox, getPetals } =
    useAdvancedPetals(PETAL_PRESETS[preset]);

  const handlePetalClick = (petal: PhysicsPetal) => {
    // Petal clicked - event handled
    // Create wind burst at petal location
    createWindBurst(petal.position.x, petal.position.y, 0.8);
  };

  const handlePresetChange = (newPreset: keyof typeof PETAL_PRESETS) => {
    setPreset(newPreset);
  };

  const handleSeasonChange = (newSeason: keyof typeof SEASONAL_WINDS) => {
    setSeason(newSeason);
    const wind = SEASONAL_WINDS[newSeason];
    setWind(wind.strength, wind.direction);
  };

  const spawnBurst = () => {
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        spawnPetal(Math.random() * window.innerWidth, Math.random() * 100);
      }, i * 50);
    }
  };

  const addObstacle = () => {
    addCollisionBox(
      Math.random() * (window.innerWidth - 200),
      Math.random() * (window.innerHeight - 100),
      200,
      100,
      'bouncy',
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-black">
      {/* Advanced Petal System */}
      <AdvancedPetalSystem
        {...PETAL_PRESETS[preset]}
        enableCollisions={true}
        enableMouseInteraction={true}
        enableTrails={true}
        onPetalClick={handlePetalClick}
      />

      {/* Demo Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-lg text-white p-6 rounded-xl max-w-sm z-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">
              <span role="img" aria-label="Cherry blossom" className="mr-2 inline-block">
                🌸
              </span>
              Physics Demo
            </h3>
            <button
              onClick={() => setShowControls(false)}
              className="text-white/60 hover:text-white"
              type="button"
              aria-label="Hide petal controls"
            >
              ×
            </button>
          </div>

          {/* Preset Controls */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor={presetSelectId}>
              Intensity Preset:
            </label>
            <select
              id={presetSelectId}
              value={preset}
              onChange={(event) => handlePresetChange(event.target.value as keyof typeof PETAL_PRESETS)}
              className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
            >
              {Object.keys(PETAL_PRESETS).map((key) => (
                <option key={key} value={key} className="bg-black">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Season Controls */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor={seasonSelectId}>
              Seasonal Wind:
            </label>
            <select
              id={seasonSelectId}
              value={season}
              onChange={(event) => handleSeasonChange(event.target.value as keyof typeof SEASONAL_WINDS)}
              className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
            >
              {Object.keys(SEASONAL_WINDS).map((key) => (
                <option key={key} value={key} className="bg-black">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={spawnBurst}
              className="w-full p-2 bg-pink-600 hover:bg-pink-700 rounded text-white font-medium transition-colors"
              type="button"
            >
              <span role="img" aria-label="Cherry blossom" className="mr-2 inline-block">
                🌸
              </span>
              Spawn Burst
            </button>

            <button
              onClick={addObstacle}
              className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-medium transition-colors"
              type="button"
            >
              <span role="img" aria-label="Box" className="mr-2 inline-block">
                📦
              </span>
              Add Obstacle
            </button>

            <button
              onClick={clearPetals}
              className="w-full p-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium transition-colors"
              type="button"
            >
              <span role="img" aria-label="Broom" className="mr-2 inline-block">
                🧹
              </span>
              Clear All
            </button>
          </div>

          {/* Stats */}
          <div className="mt-4 text-xs text-white/60">
            <div>Active Petals: {getPetals().length}</div>
            <div>Preset: {preset}</div>
            <div>Season: {season}</div>
            <div className="mt-2 text-white/40">
              <span role="img" aria-label="Light bulb" className="mr-2 inline-block">
                💡
              </span>
              Move mouse to create wind
              <br />
              <span role="img" aria-label="Computer mouse" className="mr-2 inline-block">
                🖱️
              </span>
              Click petals for wind burst
              <br />
              <span role="img" aria-label="Scroll" className="mr-2 inline-block">
                📜
              </span>
              Scroll for wind effects
              <br />
              <span role="img" aria-label="Keyboard" className="mr-2 inline-block">
                ⌨️
              </span>
              Ctrl+D for debug mode
            </div>
          </div>
        </div>
      )}

      {/* Show Controls Button */}
      {!showControls && (
        <button
          onClick={() => setShowControls(true)}
          className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full z-50 transition-colors"
          type="button"
          aria-label="Show petal controls"
        >
          <span role="img" aria-label="Settings gear">
            ⚙️
          </span>
        </button>
      )}

      {/* Demo Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen">
        <div className="text-center text-white max-w-2xl mx-auto p-8">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Advanced Petal Physics
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Real-time physics simulation with wind effects, collisions, and particle interactions
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-2 text-pink-300">
                <span role="img" aria-label="Tornado" className="mr-2 inline-block">
                  🌪️
                </span>
                Wind Physics
              </h3>
              <p className="text-sm text-white/70">
                Perlin noise-based wind patterns with turbulence, gusts, and mouse interaction
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-2 text-purple-300">
                <span role="img" aria-label="Collision" className="mr-2 inline-block">
                  💥
                </span>
                Collisions
              </h3>
              <p className="text-sm text-white/70">
                Realistic particle-to-particle interactions and boundary collisions with bounce
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-2 text-blue-300">
                <span role="img" aria-label="Sparkles" className="mr-2 inline-block">
                  ✨
                </span>
                Visual Effects
              </h3>
              <p className="text-sm text-white/70">
                Particle trails, collision highlighting, and seasonal color variations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
