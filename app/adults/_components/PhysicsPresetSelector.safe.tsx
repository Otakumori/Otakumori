'use client';

import { SliderControl } from './SliderControl.safe';

interface PhysicsPresetSelectorProps {
  config: any;
  onChange: (config: any) => void;
}

export function PhysicsPresetSelector({ config, onChange }: PhysicsPresetSelectorProps) {
  const updateConfig = (path: string, value: any) => {
    const newConfig = { ...config };
    const keys = path.split('.');
    let current = newConfig;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] = { ...current[keys[i]] };
    }

    current[keys[keys.length - 1]] = value;
    onChange(newConfig);
  };

  const physicsPresets = [
    {
      id: 'none',
      name: 'No Physics',
      description: 'Static character with no physics',
      config: {
        softBody: { enable: false },
        clothSim: { enable: false },
      },
    },
    {
      id: 'subtle',
      name: 'Subtle',
      description: 'Very subtle physics for realism',
      config: {
        softBody: {
          enable: true,
          mass: 1.0,
          stiffness: 0.2,
          damping: 0.4,
          maxDisplacement: 0.02,
          collision: { pelvis: true, chest: false, spine: false, thighs: false },
        },
        clothSim: {
          enable: true,
          bendStiffness: 0.8,
          stretchStiffness: 0.9,
          damping: 0.3,
          wind: 0.0,
          colliders: [],
        },
      },
    },
    {
      id: 'moderate',
      name: 'Moderate',
      description: 'Balanced physics for anime style',
      config: {
        softBody: {
          enable: true,
          mass: 1.0,
          stiffness: 0.4,
          damping: 0.2,
          maxDisplacement: 0.06,
          collision: { pelvis: true, chest: true, spine: false, thighs: false },
        },
        clothSim: {
          enable: true,
          bendStiffness: 0.5,
          stretchStiffness: 0.6,
          damping: 0.2,
          wind: 0.0,
          colliders: [],
        },
      },
    },
    {
      id: 'exaggerated',
      name: 'Exaggerated',
      description: 'Pronounced physics for dramatic effect',
      config: {
        softBody: {
          enable: true,
          mass: 0.8,
          stiffness: 0.6,
          damping: 0.15,
          maxDisplacement: 0.12,
          collision: { pelvis: true, chest: true, spine: true, thighs: true },
        },
        clothSim: {
          enable: true,
          bendStiffness: 0.3,
          stretchStiffness: 0.4,
          damping: 0.15,
          wind: 0.5,
          colliders: ['body', 'arms', 'legs'],
        },
      },
    },
    {
      id: 'extreme',
      name: 'Extreme',
      description: 'Maximum physics for adult content',
      config: {
        softBody: {
          enable: true,
          mass: 0.6,
          stiffness: 0.8,
          damping: 0.1,
          maxDisplacement: 0.15,
          collision: { pelvis: true, chest: true, spine: true, thighs: true },
        },
        clothSim: {
          enable: true,
          bendStiffness: 0.2,
          stretchStiffness: 0.3,
          damping: 0.1,
          wind: 1.0,
          colliders: ['body', 'arms', 'legs', 'hair'],
        },
      },
    },
  ];

  const applyPreset = (preset: any) => {
    onChange({
      ...config,
      ...preset.config,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-white font-semibold">Physics & Animation</h3>

      {/* Physics Presets */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Physics Presets</h4>

        <div className="grid grid-cols-1 gap-2">
          {physicsPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`p-3 rounded-lg text-left transition-colors ${
                config.softBody?.enable === preset.config.softBody.enable &&
                config.clothSim?.enable === preset.config.clothSim.enable
                  ? 'bg-pink-500/30 border border-pink-400/50'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
            >
              <div className="text-sm font-medium text-white">{preset.name}</div>
              <div className="text-xs text-zinc-400 mt-1">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Soft Body Physics */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Soft Body Physics</h4>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableSoftBody"
            checked={config.softBody?.enable || false}
            onChange={(e) => updateConfig('softBody.enable', e.target.checked)}
            className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
          />
          <label htmlFor="enableSoftBody" className="text-white text-sm">
            Enable soft body physics
          </label>
        </div>

        {config.softBody?.enable && (
          <div className="space-y-3 ml-6">
            <SliderControl
              label="Mass"
              value={config.softBody?.mass || 1.0}
              min={0.5}
              max={2.0}
              step={0.01}
              onChange={(value: number) => updateConfig('softBody.mass', value)}
              description="Weight of physics objects"
            />

            <SliderControl
              label="Stiffness"
              value={config.softBody?.stiffness || 0.4}
              min={0.1}
              max={1.0}
              step={0.01}
              onChange={(value: number) => updateConfig('softBody.stiffness', value)}
              description="How rigid the physics are"
            />

            <SliderControl
              label="Damping"
              value={config.softBody?.damping || 0.2}
              min={0.1}
              max={1.0}
              step={0.01}
              onChange={(value: number) => updateConfig('softBody.damping', value)}
              description="How quickly motion settles"
            />

            <SliderControl
              label="Max Displacement"
              value={config.softBody?.maxDisplacement || 0.06}
              min={0.01}
              max={0.15}
              step={0.001}
              onChange={(value: number) => updateConfig('softBody.maxDisplacement', value)}
              description="Maximum movement distance"
            />

            <div className="space-y-2">
              <h5 className="text-white text-sm font-medium">Collision Areas</h5>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'pelvis', label: 'Pelvis' },
                  { key: 'chest', label: 'Chest' },
                  { key: 'spine', label: 'Spine' },
                  { key: 'thighs', label: 'Thighs' },
                ].map((area) => (
                  <label key={area.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.softBody?.collision?.[area.key] || false}
                      onChange={(e) =>
                        updateConfig(`softBody.collision.${area.key}`, e.target.checked)
                      }
                      className="w-3 h-3 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
                    />
                    <span className="text-white text-xs">{area.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cloth Simulation */}
      <div className="space-y-4">
        <h4 className="text-pink-300 font-medium">Cloth Simulation</h4>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableClothSim"
            checked={config.clothSim?.enable || false}
            onChange={(e) => updateConfig('clothSim.enable', e.target.checked)}
            className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
          />
          <label htmlFor="enableClothSim" className="text-white text-sm">
            Enable cloth simulation
          </label>
        </div>

        {config.clothSim?.enable && (
          <div className="space-y-3 ml-6">
            <SliderControl
              label="Bend Stiffness"
              value={config.clothSim?.bendStiffness || 0.5}
              min={0.1}
              max={1.0}
              step={0.01}
              onChange={(value: number) => updateConfig('clothSim.bendStiffness', value)}
              description="Resistance to bending"
            />

            <SliderControl
              label="Stretch Stiffness"
              value={config.clothSim?.stretchStiffness || 0.6}
              min={0.1}
              max={1.0}
              step={0.01}
              onChange={(value: number) => updateConfig('clothSim.stretchStiffness', value)}
              description="Resistance to stretching"
            />

            <SliderControl
              label="Damping"
              value={config.clothSim?.damping || 0.2}
              min={0.1}
              max={1.0}
              step={0.01}
              onChange={(value: number) => updateConfig('clothSim.damping', value)}
              description="Cloth motion damping"
            />

            <SliderControl
              label="Wind Effect"
              value={config.clothSim?.wind || 0.0}
              min={0.0}
              max={2.0}
              step={0.01}
              onChange={(value: number) => updateConfig('clothSim.wind', value)}
              description="Wind simulation strength"
            />
          </div>
        )}
      </div>

      {/* Performance Warning */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
        <div className="text-yellow-300 text-sm font-medium">Performance Note</div>
        <div className="text-yellow-200 text-xs mt-1">
          Higher physics settings may impact performance on lower-end devices. Consider using
          presets for optimal balance.
        </div>
      </div>
    </div>
  );
}
