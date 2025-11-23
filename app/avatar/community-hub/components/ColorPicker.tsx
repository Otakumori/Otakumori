/**
 * Color Picker Component
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export default function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label className="text-sm font-medium text-white/90">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-20 cursor-pointer rounded-lg border border-white/20 bg-white/5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 flex-1 rounded-lg border border-white/20 bg-white/5 px-3 text-sm text-white placeholder:text-white/50 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );
}

