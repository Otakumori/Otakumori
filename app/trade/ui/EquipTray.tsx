'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, Zap, Heart } from 'lucide-react';

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

export default function EquipTray() {
  const [equippedState, setEquippedState] = useState<UserEquippedState | null>(null);
  const [loading, setLoading] = useState(true);

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
          <div className="h-4 bg-neutral-800 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-neutral-800 rounded"></div>
            <div className="h-20 bg-neutral-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Heart className="h-5 w-5 text-pink-400" />
        Currently Equipped
      </h3>

      <div className="space-y-4">
        {/* Frame */}
        {equippedState?.frame && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              {equippedState.frame.imageUrl ? (
                <img
                  src={equippedState.frame.imageUrl}
                  alt={equippedState.frame.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="text-2xl">️</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{equippedState.frame.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(equippedState.frame.rarity)}`}
                >
                  {getRarityIcon(equippedState.frame.rarity)}
                </span>
              </div>
              <span className="text-xs text-neutral-400">Profile Frame</span>
            </div>
          </motion.div>
        )}

        {/* Overlay */}
        {equippedState?.overlay && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
              {equippedState.overlay.imageUrl ? (
                <img
                  src={equippedState.overlay.imageUrl}
                  alt={equippedState.overlay.name}
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="text-2xl"></span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{equippedState.overlay.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(equippedState.overlay.rarity)}`}
                >
                  {getRarityIcon(equippedState.overlay.rarity)}
                </span>
              </div>
              <span className="text-xs text-neutral-400">Profile Overlay</span>
            </div>
          </motion.div>
        )}

        {/* Title */}
        {equippedState?.title && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl"></span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{equippedState.title.name}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full border ${getRarityColor(equippedState.title.rarity)}`}
                >
                  {getRarityIcon(equippedState.title.rarity)}
                </span>
              </div>
              <span className="text-xs text-neutral-400">Display Title</span>
            </div>
          </motion.div>
        )}

        {/* Badges */}
        {equippedState?.badges && equippedState.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <span className="text-sm font-medium text-neutral-300">Badges</span>
            <div className="grid grid-cols-2 gap-2">
              {equippedState.badges.map((badge, _index) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 p-2 bg-neutral-800/30 rounded border border-neutral-700"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded flex items-center justify-center">
                    <span className="text-lg"></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{badge.name}</div>
                    <span
                      className={`text-xs px-1 py-0.5 rounded border ${getRarityColor(badge.rarity)}`}
                    >
                      {getRarityIcon(badge.rarity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* No items equipped */}
        {!equippedState?.frame &&
          !equippedState?.overlay &&
          !equippedState?.title &&
          (!equippedState?.badges || equippedState.badges.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-neutral-500"
            >
              <div className="text-4xl mb-3"></div>
              <p className="text-sm">No items equipped yet</p>
              <p className="text-xs text-neutral-600 mt-1">Visit the petal store to get started!</p>
            </motion.div>
          )}
      </div>

      {/* Preview Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full mt-6 py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg transition-colors"
        onClick={() => window.open('/profile', '_blank')}
      >
        View Full Profile
      </motion.button>
    </div>
  );
}
