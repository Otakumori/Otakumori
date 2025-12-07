'use client';

import { useEffect, useState } from 'react';
import type { StyleRank, StyleMeter } from '../systems/StyleMeter';

interface GameHUDProps {
  health: number;
  maxHealth: number;
  score: number;
  combo: number;
  wave: number;
  dimensionShiftReady: boolean;
  dimensionShiftCooldown: number;
  styleMeter: StyleMeter;
  onDimensionShift: () => void;
  onPause: () => void;

export default function GameHUD({
  health,
  maxHealth,
  score,
  combo,
  wave,
  dimensionShiftReady,
  dimensionShiftCooldown,
  styleMeter,
  onDimensionShift,
  onPause,
}: GameHUDProps) {
  const [styleProgress, setStyleProgress] = useState(0);
  const [cooldownProgress, setCooldownProgress] = useState(1);

  // Update cooldown progress
  useEffect(() => {
    if (dimensionShiftReady) {
      setCooldownProgress(1);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / dimensionShiftCooldown, 1);
      setCooldownProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [dimensionShiftReady, dimensionShiftCooldown]);

  // Update style meter progress
  useEffect(() => {
    const interval = setInterval(() => {
      setStyleProgress(styleMeter.getProgress());
    }, 100);

    return () => clearInterval(interval);
  }, [styleMeter]);

  const healthPercent = (health / maxHealth) * 100;
  const rank = styleMeter.getRank();
  const rankColors: Record<StyleRank, string> = {
    D: 'text-gray-400',
    C: 'text-blue-400',
    B: 'text-green-400',
    A: 'text-yellow-400',
    S: 'text-pink-400',
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {/* Top Left - Health */}
      <div className="absolute left-4 top-4">
        <div className="rounded-lg bg-black/50 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-pink-200">Health</span>
            <span className="text-xs text-pink-300">{Math.ceil(health)}/{maxHealth}</span>
          </div>
          <div className="h-4 w-48 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Right - Score & Wave */}
      <div className="absolute right-4 top-4">
        <div className="rounded-lg bg-black/50 p-4 backdrop-blur-sm">
          <div className="mb-2 text-right">
            <div className="text-2xl font-bold text-pink-400">{score.toLocaleString()}</div>
            <div className="text-sm text-pink-300">Wave {wave}</div>
            {combo > 0 && (
              <div className="mt-1 text-lg font-semibold text-yellow-400">
                Combo x{combo}!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Left - Style Meter */}
      <div className="absolute bottom-4 left-4">
        <div className="rounded-lg bg-black/50 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-pink-200">Style</span>
            <span className={`text-xl font-bold ${rankColors[rank]}`}>{rank}</span>
          </div>
          <div className="h-3 w-48 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${styleProgress * 100}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-pink-300">
            {styleMeter.getMultiplier().toFixed(1)}x Multiplier
          </div>
        </div>
      </div>

      {/* Bottom Right - Dimension Shift */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={onDimensionShift}
          disabled={!dimensionShiftReady}
          className={`pointer-events-auto rounded-lg bg-black/50 p-4 backdrop-blur-sm transition-all ${
            dimensionShiftReady
              ? 'cursor-pointer hover:bg-purple-600/50 active:scale-95'
              : 'cursor-not-allowed opacity-50'
          }`}
        >
          <div className="text-center">
            <div className="mb-2 text-2xl">
              <span role="img" aria-label="Dimension Shift">⏱️</span>
            </div>
            <div className="text-sm font-semibold text-purple-200">Dimension Shift</div>
            {!dimensionShiftReady && (
              <>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                    style={{ width: `${cooldownProgress * 100}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-purple-300">
                  {Math.ceil((1 - cooldownProgress) * dimensionShiftCooldown / 1000)}s
                </div>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Center - Pause Button */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2">
        <button
          onClick={onPause}
          className="pointer-events-auto rounded-lg bg-black/50 p-2 backdrop-blur-sm transition-all hover:bg-gray-700/50"
          aria-label="Pause game"
        >
          <span role="img" aria-label="Pause" className="text-white">⏸️</span>
        </button>
      </div>
    </div>
  );
}

