'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarCard } from './AvatarCard';

interface AvatarSelectorProps {
  onSelect: (config: any) => void;
  selectedConfig?: any;
  className?: string;
  gameMode?: boolean; // If true, shows game-specific avatars
}

export function AvatarSelector({
  onSelect,
  selectedConfig,
  className = '',
  gameMode = false,
}: AvatarSelectorProps) {
  const { user } = useUser();
  const [showDefaultOptions, setShowDefaultOptions] = useState(false);

  // Fetch user's avatar configuration
  const { data: avatarData, isLoading } = useQuery({
    queryKey: ['user-avatar', user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/avatar/load`);
      if (!response.ok) throw new Error('Failed to load avatar');
      const result = await response.json();
      return result.data;
    },
    enabled: !!user?.id,
  });

  // Default avatar configurations for games
  const defaultAvatars = [
    {
      id: 'anime-warrior',
      name: 'Anime Warrior',
      config: {
        gender: 'female',
        age: 'young-adult',
        hair: { color: '#FF69B4', style: 'long', length: 0.8 },
        face: {
          eyes: { color: '#FFD700', size: 1.0 },
          skin: { tone: 0.7 },
        },
        outfit: {
          primary: { type: 'fantasy', color: '#8B0000' },
          secondary: { type: 'fantasy', color: '#FFD700' },
        },
      },
    },
    {
      id: 'cyberpunk-ninja',
      name: 'Cyberpunk Ninja',
      config: {
        gender: 'male',
        age: 'young-adult',
        hair: { color: '#00FFFF', style: 'short', length: 0.3 },
        face: {
          eyes: { color: '#00FF00', size: 0.9 },
          skin: { tone: 0.5 },
        },
        outfit: {
          primary: { type: 'cyberpunk', color: '#1A1A1A' },
          secondary: { type: 'cyberpunk', color: '#00FFFF' },
        },
      },
    },
    {
      id: 'kawaii-mage',
      name: 'Kawaii Mage',
      config: {
        gender: 'female',
        age: 'teen',
        hair: { color: '#FFB6C1', style: 'twintails', length: 0.9 },
        face: {
          eyes: { color: '#9370DB', size: 1.2 },
          skin: { tone: 0.8 },
        },
        outfit: {
          primary: { type: 'kawaii', color: '#FF69B4' },
          secondary: { type: 'kawaii', color: '#FFFFFF' },
        },
      },
    },
    {
      id: 'gothic-vampire',
      name: 'Gothic Vampire',
      config: {
        gender: 'male',
        age: 'adult',
        hair: { color: '#000000', style: 'long', length: 0.7 },
        face: {
          eyes: { color: '#FF0000', size: 0.8 },
          skin: { tone: 0.3 },
        },
        outfit: {
          primary: { type: 'gothic', color: '#2F2F2F' },
          secondary: { type: 'gothic', color: '#8B0000' },
        },
      },
    },
  ];

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Choose Your Avatar</h3>
        <p className="text-sm text-zinc-400">
          {gameMode ? 'Select an avatar for this game' : 'Select your character'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* User's Custom Avatar */}
        {avatarData?.avatarConfig && (
          <motion.div
            className="cursor-pointer"
            onClick={() => onSelect(avatarData.avatarConfig)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <AvatarCard
              config={avatarData.avatarConfig}
              size="large"
              showName={true}
              name="My Avatar"
              className={`border-2 ${
                selectedConfig === avatarData.avatarConfig ? 'border-pink-500' : 'border-white/20'
              }`}
            />
          </motion.div>
        )}

        {/* Default Options Button */}
        <motion.div
          className="cursor-pointer"
          onClick={() => setShowDefaultOptions(!showDefaultOptions)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div
            className={`w-24 h-24 rounded-xl border-2 border-dashed border-white/40 bg-white/5 flex flex-col items-center justify-center ${className}`}
          >
            <div className="text-2xl mb-1"></div>
            <p className="text-xs text-zinc-400 text-center">Default</p>
            <p className="text-xs text-zinc-400 text-center">Avatars</p>
          </div>
        </motion.div>
      </div>

      {/* Default Avatar Options */}
      <AnimatePresence>
        {showDefaultOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {defaultAvatars.map((avatar) => (
              <motion.div
                key={avatar.id}
                className="cursor-pointer"
                onClick={() => onSelect(avatar.config)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <AvatarCard
                  config={avatar.config}
                  size="medium"
                  showName={true}
                  name={avatar.name}
                  className={`border-2 ${
                    selectedConfig === avatar.config ? 'border-pink-500' : 'border-white/20'
                  }`}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Avatar Creation Link */}
      {!gameMode && (
        <div className="text-center pt-4 border-t border-white/10">
          <a
            href="/adults/editor"
            className="text-pink-400 hover:text-pink-300 text-sm transition-colors"
          >
            Create Custom Avatar →
          </a>
        </div>
      )}
    </div>
  );
}

export default AvatarSelector;
