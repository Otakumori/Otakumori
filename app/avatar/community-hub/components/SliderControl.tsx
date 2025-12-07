/**
 * Slider Control Component
 */

'use client';

import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showValue?: boolean;
  }

export default function SliderControl({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  className,
  showValue = true,
}: SliderControlProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white/90">{label}</label>
        {showValue && (
          <span className="text-xs text-white/70">{value.toFixed(2)}</span>
        )}
      </div>
      <Slider.Root
        className="relative flex h-5 w-full touch-none select-none items-center"
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        min={min}
        max={max}
        step={step}
      >
        <Slider.Track className="relative h-2 flex-1 rounded-full bg-white/10">
          <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
        </Slider.Track>
        <Slider.Thumb className="block h-5 w-5 cursor-pointer rounded-full border-2 border-white bg-pink-500 shadow-lg transition-all hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 focus:ring-offset-black" />
      </Slider.Root>
    </div>
  );
}

