'use client';

import { BACKGROUND_PRESETS } from '../constants';
import type { BackgroundPreset } from '../types';
import { CustomizationPanel } from '../CustomizationPanel';
import { SliderControl } from '../SliderControl';

interface BackgroundTabProps {
  currentBackground: BackgroundPreset;
  setCurrentBackground: (preset: BackgroundPreset) => void;
  backgroundIntensity: number;
  setBackgroundIntensity: (intensity: number) => void;
}

export function BackgroundTab({
  currentBackground,
  setCurrentBackground,
  backgroundIntensity,
  setBackgroundIntensity,
}: BackgroundTabProps) {
  return (
    <div
      id="panel-background"
      role="tabpanel"
      aria-labelledby="tab-background"
      className="space-y-4"
    >
      <CustomizationPanel title="Background Presets">
        <div className="grid grid-cols-2 gap-2">
          {BACKGROUND_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setCurrentBackground(preset)}
              className={`p-3 rounded-lg border transition-all text-left ${
                currentBackground.id === preset.id
                  ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
              }`}
            >
              <div className="text-xs font-medium">{preset.name}</div>
              <div className="text-xs text-white/60 capitalize mt-1">{preset.type}</div>
            </button>
          ))}
        </div>
      </CustomizationPanel>

      <CustomizationPanel title="Background Controls">
        <SliderControl
          label="Intensity"
          value={backgroundIntensity}
          min={0}
          max={2}
          step={0.1}
          onChange={setBackgroundIntensity}
          format={(value) => `${(value * 100).toFixed(0)}%`}
        />
        <div className="space-y-2">
          <label className="text-sm text-white/80" htmlFor="background-custom-color">
            Custom Color
          </label>
          <input
            type="color"
            id="background-custom-color"
            value={currentBackground.type === 'color' ? currentBackground.value : '#FFFFFF'}
            onChange={(e) =>
              setCurrentBackground({
                id: 'custom',
                name: 'Custom Color',
                type: 'color',
                value: e.target.value,
              })
            }
            className="w-full h-10 rounded border border-white/20 cursor-pointer"
          />
        </div>
      </CustomizationPanel>
    </div>
  );
}

