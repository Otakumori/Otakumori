'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { useSound } from '@/lib/hooks/useSound';
import { useHaptic } from '@/lib/hooks/useHaptic';
import { useUserStore } from '@/lib/store/userStore';
import { useAchievements } from '@/lib/hooks/useAchievements';

interface AvatarPart {
  id: string;
  name: string;
  options: string[];
}

const AVATAR_PARTS: AvatarPart[] = [
  {
    id: 'hair',
    name: 'Crown',
    options: ['⚜️', '👑', '🎭', '🎪', '🎨'],
  },
  {
    id: 'eyes',
    name: 'Soul',
    options: ['✧', '❈', '❋', '❆', '❉'],
  },
  {
    id: 'mouth',
    name: 'Spirit',
    options: ['❀', '✿', '❁', '✾', '✽'],
  },
  {
    id: 'accessories',
    name: 'Relics',
    options: ['⚔️', '🛡️', '📜', '🎯', '🎲'],
  },
];

interface AvatarCreatorProps {
  onClose: () => void;
}

export const AvatarCreator = ({ onClose }: AvatarCreatorProps) => {
  const [selectedParts, setSelectedParts] = useState<Record<string, string>>({});
  const { playSound } = useSound();
  const { vibrate } = useHaptic();
  const { updateAvatar } = useUserStore();
  const { unlockAchievement } = useAchievements();

  const handlePartSelect = (partId: string, option: string) => {
    setSelectedParts(prev => ({ ...prev, [partId]: option }));
    playSound('click');
    vibrate('light');
  };

  const handleSave = () => {
    const avatar = Object.values(selectedParts).join('');
    updateAvatar(avatar);
    playSound('achievement');
    vibrate('success');
    unlockAchievement('avatar_creator');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="mx-4 w-full max-w-2xl rounded-lg bg-white/10 p-6 backdrop-blur-lg"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-pink-400">Forge Your Legend</h2>
          <button onClick={onClose} className="text-white/70 transition-colors hover:text-white">
            ✕
          </button>
        </div>

        {/* Avatar Preview */}
        <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-white/5 text-4xl">
          {Object.values(selectedParts).join('') || '?'}
        </div>

        {/* Customization Options */}
        <div className="space-y-6">
          {AVATAR_PARTS.map(part => (
            <div key={part.id}>
              <h3 className="mb-3 text-white/70">{part.name}</h3>
              <div className="flex gap-3">
                {part.options.map(option => (
                  <button
                    key={option}
                    onClick={() => handlePartSelect(part.id, option)}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg text-2xl transition-all ${
                      selectedParts[part.id] === option
                        ? 'scale-110 bg-pink-500'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={Object.keys(selectedParts).length < AVATAR_PARTS.length}
            className="rounded-lg bg-pink-500 px-6 py-3 text-white transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Seal Your Fate
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
