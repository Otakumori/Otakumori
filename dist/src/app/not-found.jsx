'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = NotFound;
const link_1 = __importDefault(require('next/link'));
const RunicText_1 = require('@/components/RunicText');
const useAudio_1 = require('@/hooks/useAudio');
const react_1 = require('react');
function NotFound() {
  const { play: play404Sound } = (0, useAudio_1.useAudio)({ src: '/assets/sounds/404-error.mp3' });
  (0, react_1.useEffect)(() => {
    play404Sound();
  }, [play404Sound]);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-4 text-center">
      <div className="space-y-8">
        <h1 className="text-6xl font-bold text-pink-500">404</h1>

        <div className="space-y-4">
          <RunicText_1.RunicText text="YOU DIED" as="h2" className="text-4xl font-bold" />

          <RunicText_1.RunicText
            text="The path you seek is lost in the abyss..."
            className="text-xl"
          />
        </div>

        <div className="space-y-4">
          <RunicText_1.RunicText
            text="Perhaps you should return to the bonfire?"
            className="text-lg text-gray-400"
          />

          <link_1.default
            href="/"
            className="inline-block rounded-lg bg-pink-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-pink-700"
          >
            Return to Safety
          </link_1.default>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <RunicText_1.RunicText text="Try not to go hollow..." className="text-sm" />
        </div>
      </div>
    </div>
  );
}
