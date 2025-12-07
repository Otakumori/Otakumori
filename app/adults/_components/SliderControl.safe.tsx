'use client';

import { useState } from 'react';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  description?: string;
  unit?: string;
  format?: 'percentage' | 'decimal' | 'integer';

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  description,
  unit = '%',
  format = 'percentage',
}: SliderControlProps) {
  const [isDragging, setIsDragging] = useState(false);

  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${Math.round(val * 100)}${unit}`;
      case 'decimal':
        return val.toFixed(2);
      case 'integer':
        return Math.round(val).toString();
      default:
        return val.toString();
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-white text-sm font-medium">{label}</label>
        <span className="text-pink-300 text-sm font-mono">{formatValue(value)}</span>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${percentage}%, rgba(255,255,255,0.1) ${percentage}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />

        {/* Custom slider thumb */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-pink-500 rounded-full shadow-lg cursor-pointer transition-all duration-150 hover:scale-110"
          style={{
            left: `calc(${percentage}% - 8px)`,
            transform: `translateY(-50%) ${isDragging ? 'scale(110%)' : ''}`,
          }}
        />
      </div>

      {/* Numeric input */}
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={format === 'percentage' ? value * 100 : value}
          onChange={handleInputChange}
          className="flex-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm"
          placeholder={formatValue(value)}
        />
        {format === 'percentage' && <span className="text-zinc-400 text-sm">{unit}</span>}
      </div>

      {description && <p className="text-zinc-400 text-xs">{description}</p>}

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          background: #ec4899;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(236, 72, 153, 0.4);
          transition: all 0.15s ease;
        }

        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.6);
        }

        .slider-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #ec4899;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(236, 72, 153, 0.4);
          transition: all 0.15s ease;
        }

        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(236, 72, 153, 0.6);
        }

        input[type='number']::-webkit-outer-spin-button,
        input[type='number']::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
