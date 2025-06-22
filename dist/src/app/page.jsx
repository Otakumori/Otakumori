'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = Home;
const CherryBlossomTree_1 = require('@/components/CherryBlossomTree');
const useAchievements_1 = require('@/hooks/useAchievements');
const usePetals_1 = require('@/hooks/usePetals');
const RunicText_1 = require('@/components/RunicText');
const useAudio_1 = require('@/hooks/useAudio');
const react_1 = require('react');
function Home() {
  const { showUnlock, setShowUnlock } = (0, useAchievements_1.useAchievements)();
  const { showReward, claimReward } = (0, usePetals_1.usePetals)();
  const { play: playAchievementUnlockSound } = (0, useAudio_1.useAudio)({
    src: '/assets/sounds/achievement-unlock.mp3',
  });
  (0, react_1.useEffect)(() => {
    if (showUnlock) {
      playAchievementUnlockSound();
    }
  }, [showUnlock, playAchievementUnlockSound]);
  return (
    <main className="relative min-h-screen">
      {/* Hero Section with Cherry Blossom Tree */}
      <section className="relative h-screen">
        <CherryBlossomTree_1.CherryBlossomTree />

        {/* Welcome Message */}
        <div className="absolute left-8 top-8 max-w-md space-y-4 text-white">
          <RunicText_1.RunicText
            text="Welcome to Otakumori"
            as="h1"
            className="text-4xl font-bold"
          />
          <RunicText_1.RunicText
            text="Collect cherry blossoms to unlock rewards and achievements"
            className="text-lg"
          />
        </div>
      </section>

      {/* Achievement Unlock Notification */}
      {showUnlock && (
        <div className="animate-fade-in fixed bottom-8 right-8 rounded-lg bg-black/80 p-4 text-white">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{showUnlock.icon}</span>
            <div>
              <h3 className="font-bold">{showUnlock.title}</h3>
              <p className="text-sm text-gray-300">{showUnlock.description}</p>
            </div>
          </div>
          <button
            onClick={() => setShowUnlock(null)}
            className="mt-2 w-full rounded bg-pink-600 px-4 py-2 text-sm font-medium hover:bg-pink-700"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Reward Notification */}
      {showReward && (
        <div className="animate-fade-in fixed bottom-8 right-8 rounded-lg bg-black/80 p-4 text-white">
          <h3 className="font-bold">Reward Unlocked! 🎉</h3>
          <p className="mt-1 text-sm text-gray-300">
            Use code <span className="font-mono">{showReward}</span> for your discount
          </p>
          <button
            onClick={() => claimReward(showReward)}
            className="mt-2 w-full rounded bg-pink-600 px-4 py-2 text-sm font-medium hover:bg-pink-700"
          >
            Claim Reward
          </button>
        </div>
      )}
    </main>
  );
}
