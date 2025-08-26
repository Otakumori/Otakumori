/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Zap, Palette, Sparkles } from 'lucide-react';

interface EquippedItem {
  id: string;
  name: string;
  type: 'frame' | 'overlay' | 'title' | 'badge';
  rarity: 'Common' | 'Rare' | 'Legendary';
  imageUrl?: string;
  color?: string;
}

interface UserEquippedState {
  frame?: EquippedItem;
  overlay?: EquippedItem;
  title?: EquippedItem;
  badges: EquippedItem[];
}

export default function ProfileHeader() {
  const [equippedState, setEquippedState] = useState<UserEquippedState | null>(null);
  const [loading, setLoading] = useState(true);
  const [colorfulTextEnabled, setColorfulTextEnabled] = useState(false);

  useEffect(() => {
    fetchEquippedState();
  }, []);

  const fetchEquippedState = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/state');
      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setEquippedState(data.data.equipped);
        }
      }
    } catch (error) {
      console.error('Failed to fetch equipped state:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return 'text-gray-400 border-gray-500';
      case 'Rare':
        return 'text-blue-400 border-blue-500';
      case 'Legendary':
        return 'text-yellow-400 border-yellow-500';
      default:
        return 'text-gray-400 border-gray-500';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return <Star className="h-3 w-3" />;
      case 'Rare':
        return <Zap className="h-3 w-3" />;
      case 'Legendary':
        return <Crown className="h-3 w-3" />;
      default:
        return <Star className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-800 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-neutral-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Profile</h1>
          <p className="text-neutral-400">Your anime identity and achievements</p>
        </div>
        
        {/* Colorful Text Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-300">Colorful Text</span>
          <button
            onClick={() => setColorfulTextEnabled(!colorfulTextEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              colorfulTextEnabled ? 'bg-pink-600' : 'bg-neutral-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                colorfulTextEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Profile Preview */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-800 mb-6">
        {/* Frame */}
        {equippedState?.frame && (
          <div className="absolute inset-0">
            <img 
              src={equippedState.frame.imageUrl || '/assets/ui/frames/default.png'} 
              alt={equippedState.frame.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Overlay */}
        {equippedState?.overlay && (
          <div className="absolute inset-0">
            <img 
              src={equippedState.overlay.imageUrl || '/assets/ui/overlays/default.png'} 
              alt={equippedState.overlay.name}
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
        )}

        {/* Profile Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {/* Avatar Placeholder */}
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full border-4 border-pink-500/30 mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            
            {/* Title */}
            {equippedState?.title && (
              <div className="mb-2">
                <span className={`text-lg font-semibold px-3 py-1 rounded-full border ${getRarityColor(equippedState.title.rarity)}`}>
                  {equippedState.title.name}
                </span>
              </div>
            )}
            
            {/* Username with Colorful Text Preview */}
            <h2 className={`text-2xl font-bold ${
              colorfulTextEnabled 
                ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent' 
                : 'text-white'
            }`}>
              Username
            </h2>
            
            {/* Badges */}
            {equippedState?.badges && equippedState.badges.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                {equippedState.badges.slice(0, 3).map((badge) => (
                  <div
                    key={badge.id}
                    className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full border border-green-500/30 flex items-center justify-center"
                    title={badge.name}
                  >
                    <span className="text-sm">🏅</span>
                  </div>
                ))}
                {equippedState.badges.length > 3 && (
                  <span className="text-xs text-neutral-400">+{equippedState.badges.length - 3}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Colorful Text Effect Overlay */}
        {colorfulTextEnabled && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-50"></div>
            <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-b from-pink-400 via-purple-400 to-cyan-400 opacity-50"></div>
          </div>
        )}
      </div>

      {/* Equipped Items Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {equippedState?.frame && (
          <div className="text-center p-3 bg-neutral-800/30 rounded-lg border border-neutral-700">
            <div className="text-2xl mb-2">🖼️</div>
            <div className="text-xs font-medium text-white truncate">{equippedState.frame.name}</div>
            <span className={`text-xs px-1 py-0.5 rounded border ${getRarityColor(equippedState.frame.rarity)}`}>
              {getRarityIcon(equippedState.frame.rarity)}
            </span>
          </div>
        )}
        
        {equippedState?.overlay && (
          <div className="text-center p-3 bg-neutral-800/30 rounded-lg border border-neutral-700">
            <div className="text-2xl mb-2">✨</div>
            <div className="text-xs font-medium text-white truncate">{equippedState.overlay.name}</div>
            <span className={`text-xs px-1 py-0.5 rounded border ${getRarityColor(equippedState.overlay.rarity)}`}>
              {getRarityIcon(equippedState.overlay.rarity)}
            </span>
          </div>
        )}
        
        {equippedState?.title && (
          <div className="text-center p-3 bg-neutral-800/30 rounded-lg border border-neutral-700">
            <div className="text-2xl mb-2">👑</div>
            <div className="text-xs font-medium text-white truncate">{equippedState.title.name}</div>
            <span className={`text-xs px-1 py-0.5 rounded border ${getRarityColor(equippedState.title.rarity)}`}>
              {getRarityIcon(equippedState.title.rarity)}
            </span>
          </div>
        )}
        
        <div className="text-center p-3 bg-neutral-800/30 rounded-lg border border-neutral-700">
          <div className="text-2xl mb-2">🏅</div>
          <div className="text-xs font-medium text-white">
            {equippedState?.badges?.length || 0} Badges
          </div>
          <span className="text-xs text-neutral-400">Equipped</span>
        </div>
      </div>

      {/* Colorful Text Info */}
      {colorfulTextEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg"
        >
          <div className="flex items-center gap-2 text-pink-400">
            <Palette className="h-4 w-4" />
            <span className="text-sm font-medium">Colorful Text Active</span>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Your profile text now displays with vibrant colors and effects
          </p>
        </motion.div>
      )}
    </div>
  );
}
