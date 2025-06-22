'use strict';
'use client';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.SoundSettings = void 0;
const framer_motion_1 = require('framer-motion');
const useSound_1 = require('@/lib/hooks/useSound');
const useHaptic_1 = require('@/lib/hooks/useHaptic');
const react_1 = require('react');
const SoundSettings = () => {
  const { isMuted, toggleMute, playSound } = (0, useSound_1.useSound)();
  const { vibrate } = (0, useHaptic_1.useHaptic)();
  const [isOpen, setIsOpen] = (0, react_1.useState)(false);
  const handleToggle = () => {
    toggleMute();
    vibrate('light');
    playSound('click');
  };
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <framer_motion_1.motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full bg-gray-800/50 p-3 shadow-lg backdrop-blur-lg"
      >
        {isMuted ? '🔇' : '🔊'}
      </framer_motion_1.motion.button>

      <framer_motion_1.AnimatePresence>
        {isOpen && (
          <framer_motion_1.motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-0 rounded-lg bg-gray-800/50 p-4 shadow-lg backdrop-blur-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-white">Sound</span>
                <framer_motion_1.motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggle}
                  className={`rounded-lg p-2 ${isMuted ? 'bg-red-500/20' : 'bg-green-500/20'}`}
                >
                  {isMuted ? '🔇' : '🔊'}
                </framer_motion_1.motion.button>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-white">Haptic</span>
                <framer_motion_1.motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => vibrate('light')}
                  className="rounded-lg bg-blue-500/20 p-2"
                >
                  📳
                </framer_motion_1.motion.button>
              </div>
            </div>
          </framer_motion_1.motion.div>
        )}
      </framer_motion_1.AnimatePresence>
    </div>
  );
};
exports.SoundSettings = SoundSettings;
