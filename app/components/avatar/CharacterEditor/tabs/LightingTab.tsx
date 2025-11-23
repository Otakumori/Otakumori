'use client';

import { CustomizationPanel } from '../CustomizationPanel';
import { SliderControl } from '../SliderControl';

export function LightingTab() {
  return (
    <div
      id="panel-lighting"
      role="tabpanel"
      aria-labelledby="tab-lighting"
      className="space-y-4"
    >
      <CustomizationPanel title="Lighting Preset">
        <div className="space-y-2">
          {['studio', 'dramatic', 'soft', 'anime', 'intimate'].map((preset) => (
            <label key={preset} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="lighting"
                value={preset}
                className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 focus:ring-pink-500"
              />
              <span className="text-sm text-white/80 capitalize">{preset}</span>
            </label>
          ))}
        </div>
      </CustomizationPanel>

      <CustomizationPanel title="Environment">
        <SliderControl
          label="Environment Intensity"
          value={0.8}
          min={0}
          max={2}
          step={0.1}
          onChange={() => {}}
        />
        <SliderControl
          label="Ambient Light"
          value={0.3}
          min={0}
          max={1}
          step={0.01}
          onChange={() => {}}
        />
      </CustomizationPanel>
    </div>
  );
}

