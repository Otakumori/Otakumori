'use client';
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/lib/hooks/useSound';
import { useHaptic } from '@/lib/hooks/useHaptic';
import { useAchievements } from '@/lib/hooks/useAchievements';
import { useUserStore } from '@/lib/store/userStore';
import { useLeaderboardStore } from '@/lib/store/leaderboardStore';
import { useFriendSystemStore } from '@/lib/store/friendSystemStore';
import { AvatarCustomizer } from '@/components/AvatarCustomizer';
import { ReactiveAvatar } from '@/components/ReactiveAvatar';
import { Tutorial } from '@/components/Tutorial';

// Kojima Easter Egg
const KOJIMA_CODE = 'kojima';
let currentInput = '';

export default function ProfilePage() {
  const [showAvatarCustomizer, setShowAvatarCustomizer] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const { playSound } = useSound();
  const { vibrate } = useHaptic();
  const { achievements, unlockAchievement } = useAchievements();
  const { user, updateAvatar } = useUserStore();
  const { entries } = useLeaderboardStore();
  const { friends } = useFriendSystemStore();

  // Handle Kojima code
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
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

  const handleAvatarComplete = (data: any) => {
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
      <Tutorial />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-6 backdrop-blur-lg"
      >
        <div className="flex items-center gap-6">
          <ReactiveAvatar className="group relative" />
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
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Achievements & Runes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-white/10 p-6 backdrop-blur-lg"
          data-tutorial="achievements"
        >
          <h2 className="mb-6 text-2xl font-bold text-pink-400">Trophies & Relics</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {achievements.map(achievement => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex aspect-square items-center justify-center rounded-lg text-2xl ${
                  achievement.unlockedAt ? 'bg-pink-500/20' : 'bg-white/5'
                }`}
              >
                {achievement.icon}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
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
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-white/10 p-6 backdrop-blur-lg md:col-span-2"
        >
          <h2 className="mb-6 text-2xl font-bold text-pink-400">Recent Chronicles</h2>
          <div className="space-y-4">
            {entries.slice(0, 5).map(entry => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg bg-white/5 p-4"
              >
                <p className="text-pink-400">
                  Claimed {entry.score} petals in {entry.game}
                </p>
                <p className="text-sm text-white/50">
                  {new Date(entry.timestamp || Date.now()).toLocaleString()}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Avatar Creator Invitation */}
        <motion.div
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
        </motion.div>
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
      <AnimatePresence>
        {showAvatarCustomizer && (
          <AvatarCustomizer
            imageSrc="/placeholder-avatar.jpg"
            onComplete={handleAvatarComplete}
            onClose={() => setShowAvatarCustomizer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
