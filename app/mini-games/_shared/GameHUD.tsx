/**
 * Shared Game HUD Component
 * Consistent score/timer/health display across all games
 */

'use client';

import { getOtakumoriPalette } from '@om/avatar-engine/materials/palette';

export interface GameHUDProps {
  score?: number;
  timeLeft?: number;
  timer?: number; // Alias for timeLeft
  health?: number;
  maxHealth?: number;
  combo?: number;
  multiplier?: number;
  lives?: number;
  message?: string;
  className?: string;
}

/**
 * Shared HUD component for all games
 * Consistent styling (cel-shaded, Otaku-mori palette)
 */
export function GameHUD({ 
  score, 
  timeLeft, 
  timer, 
  health, 
  maxHealth, 
  combo, 
  multiplier,
  lives,
  message,
  className = '' 
}: GameHUDProps) {
  const palette = getOtakumoriPalette('combat');
  const time = timeLeft ?? timer;

  return (
    <div className={`pointer-events-none fixed inset-0 z-20 ${className}`}>
      {/* Score Display */}
      {score !== undefined && (
        <div
          className="absolute left-4 top-4 rounded-lg bg-black/50 px-4 py-2 backdrop-blur"
          style={{ border: `1px solid ${palette.accent}40` }}
        >
          <div className="text-xs text-zinc-400">Score</div>
          <div className="text-2xl font-bold" style={{ color: palette.accent }}>
            {score.toLocaleString()}
          </div>
        </div>
      )}

      {/* Timer Display */}
      {time !== undefined && (
        <div
          className="absolute left-4 top-24 rounded-lg bg-black/50 px-4 py-2 backdrop-blur"
          style={{ border: `1px solid ${palette.deepPurple}40` }}
        >
          <div className="text-xs text-zinc-400">Time</div>
          <div className="text-xl font-bold" style={{ color: palette.deepPurple }}>
            {Math.floor(time)}s
          </div>
        </div>
      )}

      {/* Lives Display */}
      {lives !== undefined && (
        <div
          className="absolute right-4 top-24 rounded-lg bg-black/50 px-4 py-2 backdrop-blur"
          style={{ border: `1px solid ${palette.petals}40` }}
        >
          <div className="text-xs text-zinc-400">Lives</div>
          <div className="text-xl font-bold" style={{ color: palette.petals }}>
            {lives}
          </div>
        </div>
      )}

      {/* Multiplier Display */}
      {multiplier !== undefined && multiplier > 1 && (
        <div
          className="absolute left-1/2 top-24 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 backdrop-blur"
          style={{ border: `1px solid ${palette.accent}80` }}
        >
          <div className="text-xs text-zinc-400">Multiplier</div>
          <div className="text-xl font-bold" style={{ color: palette.accent }}>
            {multiplier}x
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div
          className="absolute left-1/2 top-40 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 backdrop-blur"
          style={{ border: `1px solid ${palette.petals}80` }}
        >
          <div className="text-lg font-bold" style={{ color: palette.petals }}>
            {message}
          </div>
        </div>
      )}

      {/* Health Bar */}
      {health !== undefined && maxHealth !== undefined && (
        <div
          className="absolute top-4 right-4 rounded-lg bg-black/50 px-4 py-2 backdrop-blur"
          style={{ border: `1px solid ${palette.softPink}40` }}
        >
          <div className="text-xs text-zinc-400 mb-1">Health</div>
          <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${(health / maxHealth) * 100}%`,
                backgroundColor: palette.softPink,
              }}
            />
          </div>
          <div className="text-sm font-medium mt-1" style={{ color: palette.softPink }}>
            {health} / {maxHealth}
          </div>
        </div>
      )}

      {/* Combo Display */}
      {combo !== undefined && combo > 0 && (
        <div
          className="absolute left-1/2 top-8 -translate-x-1/2 rounded-lg bg-black/50 px-4 py-2 backdrop-blur animate-pulse"
          style={{ border: `1px solid ${palette.petals}80` }}
        >
          <div className="text-lg font-bold" style={{ color: palette.petals }}>
            {combo}x Combo!
          </div>
        </div>
      )}
    </div>
  );
}

