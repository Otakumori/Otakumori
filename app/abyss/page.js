'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePetalContext } from '../providers';
import { useOverlordContext } from '../providers';

const features = [
  {
    title: 'Games',
    description: 'Play games to earn petals and experience',
    icon: '🎮',
    path: '/abyss/games',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Gallery',
    description: 'Browse and collect artwork',
    icon: '🎨',
    path: '/abyss/gallery',
    color: 'from-blue-500 to-purple-500',
  },
  {
    title: 'Shop',
    description: 'Spend your petals on special items',
    icon: '🛍️',
    path: '/abyss/shop',
    color: 'from-green-500 to-blue-500',
  },
  {
    title: 'Community',
    description: 'Connect with other users',
    icon: '👥',
    path: '/abyss/community',
    color: 'from-yellow-500 to-orange-500',
  },
];

const sampleQuests = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first game in the Abyss',
    reward: 50,
  },
  {
    id: '2',
    title: 'Art Collector',
    description: 'Visit the gallery and view 5 artworks',
    reward: 30,
  },
  {
    id: '3',
    title: 'Social Butterfly',
    description: 'Make your first post in the community',
    reward: 25,
  },
];

export default function AbyssPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const { petals, addPetals } = usePetalContext();
  const { quests, addQuest } = useOverlordContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Add sample quests
    sampleQuests.forEach(quest => {
      if (!quests.find(q => q.id === quest.id)) {
        addQuest(quest);
      }
    });

    return () => clearTimeout(timer);
  }, [quests, addQuest]);

  const handleStartQuest = (quest) => {
    // Simulate quest completion
    setTimeout(() => {
      addPetals(quest.reward);
      // Remove quest from list
      const updatedQuests = quests.filter(q => q.id !== quest.id);
      // Update quests in store
      useOverlordStore.setState({ quests: updatedQuests });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to the Abyss, {session?.user?.name}
        </h1>
        <p className="text-gray-400">
          Your journey into the depths begins here. Collect petals, complete quests, and explore the mysteries that await.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-br ${feature.color} p-6`}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative z-10">
              <span className="text-4xl mb-4 block">{feature.icon}</span>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-200 mb-4">{feature.description}</p>
              <a
                href={feature.path}
                className="inline-block bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Explore
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {quests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Active Quests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{quest.title}</h3>
                <p className="text-gray-400 mb-2">{quest.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-pink-500">Reward: {quest.reward} petals</span>
                  <button
                    onClick={() => handleStartQuest(quest)}
                    className="text-white bg-pink-500/20 hover:bg-pink-500/30 px-3 py-1 rounded transition-colors"
                  >
                    Start Quest
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
