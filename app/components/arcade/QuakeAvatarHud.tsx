/**
 * Quake-Style Avatar HUD Component
 * Retro arena shooter-inspired HUD overlay with avatar integration
 * Unlocked via petal shop as a cosmetic HUD skin
 */

'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameAvatar } from '@/app/mini-games/_shared/useGameAvatarWithConfig';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { OmButton, OmCard, OmPanel } from '@/app/components/ui/om';

export type HudEvent = {
  type: 'achievement' | 'petals-earned' | 'purchase';
  label: string;
  timestamp: number;
};

export interface QuakeAvatarHudProps {
  gameId?: string;
  mode?: 'passive' | 'overlay';
  petals?: number;
  lastEvent?: HudEvent | null;
  onOverlayClose?: () => void;
}

/**
 * Quake-style HUD component
 * Renders avatar in portrait/bust mode with retro metal/CRT styling
 */
export function QuakeAvatarHud({
  gameId,
  mode = 'passive',
  petals = 0,
  lastEvent = null,
  onOverlayClose,
}: QuakeAvatarHudProps) {
  // Load avatar if gameId provided
  const avatarResult = gameId
    ? useGameAvatar(gameId, {
        forcePreset: false,
      })
    : { avatarConfig: null, representationConfig: null };

  const avatarConfig = gameId ? avatarResult.avatarConfig : null;
  const representationConfig = gameId ? avatarResult.representationConfig : null;

  // Determine avatar mode (portrait or bust for HUD)
  const avatarMode = useMemo(() => {
    if (!representationConfig) return 'portrait';
    // Prefer portrait for HUD, fallback to bust
    return representationConfig.mode === 'portrait' ? 'portrait' : 'bust';
  }, [representationConfig]);

  // Passive mode: slim HUD bar
  if (mode === 'passive') {
    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
      >
        <div
          className="bg-gradient-to-t from-black/90 via-slate-900/80 to-transparent backdrop-blur-sm border-t-2 border-pink-500/30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(236,72,153,0.03) 2px, rgba(236,72,153,0.03) 4px)',
          }}
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            {/* Left: Avatar */}
            {avatarConfig && (
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 border-2 border-pink-500/50 bg-black/60 rounded">
                  <AvatarRenderer profile={avatarConfig} mode={avatarMode} size="small" />
                </div>
                <div className="text-xs text-pink-200 font-mono">
                  <div className="text-pink-400">AVATAR</div>
                  <div className="text-zinc-400">ONLINE</div>
                </div>
              </div>
            )}

            {/* Center: Event */}
            {lastEvent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="text-xs text-pink-400 font-mono uppercase">{lastEvent.type}</div>
                <div className="text-sm text-white font-bold">{lastEvent.label}</div>
              </motion.div>
            )}

            {/* Right: Petals */}
            <div className="flex items-center gap-2">
              <span className="text-pink-200 font-mono font-bold">{petals.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Overlay mode: full-screen achievement/event display
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onOverlayClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-2xl w-full mx-4"
        >
          <OmPanel variant="modal" size="lg" className="relative overflow-hidden">
            {/* Quake-style scanline overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(236,72,153,0.1) 2px, rgba(236,72,153,0.1) 4px)',
              }}
            />

            {/* Metal border effect */}
            <div className="absolute inset-0 border-4 border-pink-500/30 pointer-events-none" />

            <div className="relative p-8 space-y-6">
              {/* Header */}
              <div className="text-center border-b-2 border-pink-500/30 pb-4">
                <h2 className="text-3xl font-bold text-pink-400 font-mono uppercase tracking-wider mb-2">
                  {lastEvent?.type === 'achievement' ? 'Achievement Unlocked' : 'Event'}
                </h2>
                {lastEvent && <p className="text-xl text-white font-mono">{lastEvent.label}</p>}
              </div>

              {/* Avatar Display */}
              {avatarConfig && (
                <div className="flex justify-center">
                  <div className="relative border-4 border-pink-500/50 bg-black/80 p-4 rounded">
                    <div className="w-48 h-48">
                      <AvatarRenderer profile={avatarConfig} mode={avatarMode} size="medium" />
                    </div>
                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-pink-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-pink-400" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-pink-400" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-pink-400" />
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-center">
                <OmCard className="bg-black/40 border-pink-500/30">
                  <div className="text-xs text-pink-400 font-mono uppercase mb-1">Petals</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    {petals.toLocaleString()}
                  </div>
                </OmCard>
                {gameId && (
                  <OmCard className="bg-black/40 border-pink-500/30">
                    <div className="text-xs text-pink-400 font-mono uppercase mb-1">Game</div>
                    <div className="text-lg font-bold text-white font-mono">{gameId}</div>
                  </OmCard>
                )}
              </div>

              {/* Continue Button */}
              {onOverlayClose && (
                <div className="flex justify-center pt-4">
                  <OmButton
                    variant="primary"
                    size="lg"
                    onClick={onOverlayClose}
                    className="font-mono uppercase"
                  >
                    Continue
                  </OmButton>
                </div>
              )}
            </div>
          </OmPanel>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
