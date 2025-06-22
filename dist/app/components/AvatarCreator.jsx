'use strict';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.AvatarCreator = void 0;
const react_1 = require('react');
const framer_motion_1 = require('framer-motion');
const useSound_1 = require('@/lib/hooks/useSound');
const useHaptic_1 = require('@/lib/hooks/useHaptic');
const userStore_1 = require('@/lib/store/userStore');
const useAchievements_1 = require('@/lib/hooks/useAchievements');
const AVATAR_PARTS = [
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
const AvatarCreator = ({ onClose }) => {
  const [selectedParts, setSelectedParts] = (0, react_1.useState)({});
  const { playSound } = (0, useSound_1.useSound)();
  const { vibrate } = (0, useHaptic_1.useHaptic)();
  const { updateAvatar } = (0, userStore_1.useUserStore)();
  const { unlockAchievement } = (0, useAchievements_1.useAchievements)();
  const handlePartSelect = (partId, option) => {
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
    <framer_motion_1.motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <framer_motion_1.motion.div
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
      </framer_motion_1.motion.div>
    </framer_motion_1.motion.div>
  );
};
exports.AvatarCreator = AvatarCreator;
