'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatarRenderer } from './useAvatarForGame';
import { AvatarRenderer } from '@/app/components/avatar/AvatarRenderer';
import { AvatarSelector } from '@/app/components/avatar/AvatarSelector';

interface GameAvatarIntegrationProps {
  gameMode: 'action' | 'puzzle' | 'strategy' | 'rhythm';
  performance?: 'low' | 'balanced' | 'high';
  showSelector?: boolean;
  onAvatarSelect?: (config: any) => void;
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
}

export function GameAvatarIntegration({
  gameMode,
  performance = 'balanced',
  showSelector = false,
  onAvatarSelect,
  className = '',
  position = 'top-right',
  size = 'medium',
  interactive = true,
}: GameAvatarIntegrationProps) {
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);

  const {
    config,
    isLoading,
    isCustomAvatar,
    hasAvatar,
    mode,
    interactions,
    physics,
    fallbackTo2D,
  } = useAvatarRenderer(gameMode, performance);

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
  };

  const handleAvatarClick = () => {
    if (interactive && showSelector) {
      setShowAvatarSelector(true);
    }
  };

  const handleAvatarSelect = (config: any) => {
    setSelectedConfig(config);
    onAvatarSelect?.(config);
    setShowAvatarSelector(false);
  };

  // Use selected config if available, otherwise use loaded config
  const currentConfig = selectedConfig || config;

  if (isLoading) {
    return (
      <div className={`absolute ${positionClasses[position]} ${className}`}>
        <div
          className={`w-16 h-16 rounded-lg bg-white/10 animate-pulse flex items-center justify-center`}
        >
          <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!hasAvatar && !selectedConfig) {
    return (
      <div className={`absolute ${positionClasses[position]} ${className}`}>
        <div
          className={`${size === 'small' ? 'w-12 h-12' : size === 'medium' ? 'w-16 h-16' : 'w-24 h-24'} rounded-lg bg-white/10 border border-dashed border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors`}
          onClick={handleAvatarClick}
        >
          <span className="text-white/60 text-lg">👤</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Avatar Display */}
      <div className={`absolute ${positionClasses[position]} ${className}`}>
        <motion.div
          className="cursor-pointer"
          onClick={handleAvatarClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <AvatarRenderer
            config={currentConfig}
            mode={mode as '2d' | '3d' | 'hybrid' | 'auto'}
            size={size}
            interactions={interactions}
            physics={physics}
            fallbackTo2D={fallbackTo2D}
            className="rounded-lg overflow-hidden border-2 border-white/20"
          />

          {/* Custom Avatar Indicator */}
          {isCustomAvatar && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">★</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Avatar Selector Modal */}
      <AnimatePresence>
        {showAvatarSelector && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAvatarSelector(false)}
          >
            <motion.div
              className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-white/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Choose Avatar</h3>
                <button
                  onClick={() => setShowAvatarSelector(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <AvatarSelector
                onSelect={handleAvatarSelect}
                selectedConfig={selectedConfig}
                gameMode={true}
                className="max-h-96 overflow-y-auto"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Higher-order component for easy game integration
export function withAvatarIntegration<P extends object>(
  Component: React.ComponentType<P>,
  gameMode: 'action' | 'puzzle' | 'strategy' | 'rhythm',
  options?: Partial<GameAvatarIntegrationProps>,
) {
  return function AvatarIntegratedGame(props: P) {
    return (
      <div className="relative w-full h-full">
        <Component {...props} />
        <GameAvatarIntegration gameMode={gameMode} {...options} />
      </div>
    );
  };
}

export default GameAvatarIntegration;
