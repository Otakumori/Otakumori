'use client';

import * as THREE from 'three';
import type { ColorPickerProps } from './types';

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = new THREE.Color(e.target.value);
    onChange(color);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm text-white/80">{label}</label>
      <div className="flex items-center space-x-3">
        <input
          type="color"
          value={`#${value.getHexString()}`}
          onChange={handleColorChange}
          className="w-12 h-8 rounded border border-white/20 cursor-pointer"
          aria-label={label}
        />
        <span className="text-sm text-white/60 font-mono">#{value.getHexString()}</span>
      </div>
    </div>
  );
}

