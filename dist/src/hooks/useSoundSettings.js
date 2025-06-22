'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useSoundSettings = void 0;
const react_1 = require('react');
const useLocalStorage_1 = require('./useLocalStorage');
const useSoundSettings = () => {
  const [volume, setVolume] = (0, useLocalStorage_1.useLocalStorage)('soundVolume', 0.5); // Default volume 50%
  const [isMuted, setIsMuted] = (0, useLocalStorage_1.useLocalStorage)('isSoundMuted', false);
  (0, react_1.useEffect)(() => {
    // Ensure volume is between 0 and 1
    setVolume(prevVolume => Math.max(0, Math.min(1, prevVolume)));
  }, [setVolume]);
  const toggleMute = () => {
    setIsMuted(prevMuted => !prevMuted);
  };
  return {
    volume,
    setVolume,
    isMuted,
    toggleMute,
  };
};
exports.useSoundSettings = useSoundSettings;
