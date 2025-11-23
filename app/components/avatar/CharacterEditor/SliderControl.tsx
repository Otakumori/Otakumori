'use client';

import type { SliderControlProps } from './types';

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  format,
}: SliderControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-white/80">{label}</label>
        <span className="text-sm text-white/60 font-mono">
          {format ? format(value) : value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
        aria-label={label}
        style={{
          background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.2) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.2) 100%)`,
        }}
      />
    </div>
  );
}

