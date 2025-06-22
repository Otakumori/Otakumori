'use strict';
'use client';
'use client';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = ProfilePage;
const react_1 = require('react');
const framer_motion_1 = require('framer-motion');
const useSound_1 = require('@/lib/hooks/useSound');
const useHaptic_1 = require('@/lib/hooks/useHaptic');
const useAchievements_1 = require('@/lib/hooks/useAchievements');
const userStore_1 = require('@/lib/store/userStore');
const leaderboardStore_1 = require('@/lib/store/leaderboardStore');
const friendSystemStore_1 = require('@/lib/store/friendSystemStore');
const AvatarCustomizer_1 = require('../../components/AvatarCustomizer');
const ReactiveAvatar_1 = require('../../components/ReactiveAvatar');
const Tutorial_1 = require('../../components/Tutorial');
// Kojima Easter Egg
const KOJIMA_CODE = 'kojima';
let currentInput = '';
function ProfilePage() {
  const [showAvatarCustomizer, setShowAvatarCustomizer] = (0, react_1.useState)(false);
  const [isTyping, setIsTyping] = (0, react_1.useState)(false);
  const [comments, setComments] = (0, react_1.useState)([]);
  const [newComment, setNewComment] = (0, react_1.useState)('');
  const { playSound } = (0, useSound_1.useSound)();
  const { vibrate } = (0, useHaptic_1.useHaptic)();
  const { achievements, unlockAchievement } = (0, useAchievements_1.useAchievements)();
  const { user, updateAvatar } = (0, userStore_1.useUserStore)();
  const { entries } = (0, leaderboardStore_1.useLeaderboardStore)();
  const { friends } = (0, friendSystemStore_1.useFriendSystemStore)();
  // Handle Kojima code
  (0, react_1.useEffect)(() => {
    const handleKeyPress = e => {
      currentInput += e.key.toLowerCase();
      if (currentInput.length > KOJIMA_CODE.length) {
        currentInput = currentInput.slice(-KOJIMA_CODE.length);
      }
      if (currentInput === KOJIMA_CODE) {
        playSound('achievement');
        vibrate('success');
        unlockAchievement('kojima_fan');
        currentInput = '';
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [playSound, vibrate, unlockAchievement]);
  // Stats calculation
  const stats = {
    petalsCollected: entries.reduce((sum, entry) => sum + entry.score, 0),
    gamesPlayed: entries.length,
    tradesCompleted: 0, // TODO: Implement trade system
    memoryPuzzlesSolved: 0, // TODO: Implement memory puzzle system
  };
  const handleAvatarComplete = data => {
    // Here you would typically process the image data and save it
    // For now, we'll just update the avatar with a placeholder
    updateAvatar('🎭');
    playSound('achievement');
    vibrate('success');
    unlockAchievement('avatar_creator');
    setShowAvatarCustomizer(false);
  };
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tutorial */}
      <Tutorial_1.Tutorial />

      {/* Header Section */}
      <framer_motion_1.motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-6 backdrop-blur-lg"
      >
        <div className="flex items-center gap-6">
          <ReactiveAvatar_1.ReactiveAvatar className="group relative" />
          <div>
            <h1 className="text-3xl font-bold text-pink-400">
              {user?.username || 'Wandering Soul'}
            </h1>
            <p className="text-white/70">Level {user?.level || 1} Chosen One</p>
            <p className="italic text-white/50">
              "{user?.statusMessage || 'Your legend awaits...'}"
            </p>
          </div>
        </div>
      </framer_motion_1.motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Achievements & Runes */}
        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-white/10 p-6 backdrop-blur-lg"
          data-tutorial="achievements"
        >
          <h2 className="mb-6 text-2xl font-bold text-pink-400">Trophies & Relics</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {achievements.map(achievement => (
              <framer_motion_1.motion.div
                key={achievement.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex aspect-square items-center justify-center rounded-lg text-2xl ${achievement.unlockedAt ? 'bg-pink-500/20' : 'bg-white/5'}`}
              >
                {achievement.icon}
              </framer_motion_1.motion.div>
            ))}
          </div>
        </framer_motion_1.motion.div>

        {/* Stats */}
        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-white/10 p-6 backdrop-blur-lg"
          data-tutorial="petals"
        >
          <h2 className="mb-6 text-2xl font-bold text-pink-400">Legend Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Petals Gathered</span>
              <span className="text-pink-400">{stats.petalsCollected}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Quests Completed</span>
              <span className="text-pink-400">{stats.gamesPlayed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Trades Made</span>
              <span className="text-pink-400">{stats.tradesCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/70">Puzzles Solved</span>
              <span className="text-pink-400">{stats.memoryPuzzlesSolved}</span>
            </div>
          </div>
        </framer_motion_1.motion.div>

        {/* Recent Activity */}
        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-white/10 p-6 backdrop-blur-lg md:col-span-2"
        >
          <h2 className="mb-6 text-2xl font-bold text-pink-400">Recent Chronicles</h2>
          <div className="space-y-4">
            {entries.slice(0, 5).map(entry => (
              <framer_motion_1.motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-white/5 p-4"
              >
                <p className="text-pink-400">
                  Claimed {entry.score} petals in {entry.game}
                </p>
                <p className="text-sm text-white/50">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </framer_motion_1.motion.div>
            ))}
          </div>
        </framer_motion_1.motion.div>

        {/* Avatar Creator Invitation */}
        <framer_motion_1.motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-6 backdrop-blur-lg md:col-span-2"
        >
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold text-pink-400">Show me your 'dudes'</h2>
            <p className="mb-6 text-white/70">
              Forge your legend and let your spirit shine through your chosen form
            </p>
            <button
              onClick={() => setShowAvatarCustomizer(true)}
              className="rounded-lg bg-pink-500 px-6 py-3 text-white transition-colors hover:bg-pink-600"
            >
              Begin Your Legend
            </button>
          </div>
        </framer_motion_1.motion.div>
      </div>

      {/* Hidden Easter Eggs */}
      <div className="fixed bottom-4 right-4">
        <div
          onClick={() => {
            playSound('achievement');
            vibrate('success');
            unlockAchievement('hidden_gem');
          }}
          className="h-4 w-4 rounded-full bg-pink-400/20"
        />
      </div>

      {/* Avatar Customizer Modal */}
      <framer_motion_1.AnimatePresence>
        {showAvatarCustomizer && (
          <AvatarCustomizer_1.AvatarCustomizer
            imageSrc="/placeholder-avatar.jpg"
            onComplete={handleAvatarComplete}
            onClose={() => setShowAvatarCustomizer(false)}
          />
        )}
      </framer_motion_1.AnimatePresence>
    </div>
  );
}
