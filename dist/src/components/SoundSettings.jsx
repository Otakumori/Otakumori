'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.SoundSettings = void 0;
const react_1 = __importDefault(require('react'));
const useSoundSettings_1 = require('@/hooks/useSoundSettings');
const SoundSettings = () => {
  const { volume, setVolume, isMuted, toggleMute } = (0, useSoundSettings_1.useSoundSettings)();
  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-full bg-gray-800/80 p-3 shadow-lg backdrop-blur-sm">
      <div className="flex items-center space-x-2">
        {/* Mute Toggle */}
        <button onClick={toggleMute} className="text-xl text-white focus:outline-none">
          {isMuted ? '🔇' : '🔊'}
        </button>

        {/* Volume Slider */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={e => setVolume(parseFloat(e.target.value))}
          className="h-2 w-24 cursor-pointer appearance-none rounded-lg bg-pink-600 outline-none focus:ring-2 focus:ring-pink-500"
          disabled={isMuted}
        />
      </div>
    </div>
  );
};
exports.SoundSettings = SoundSettings;
