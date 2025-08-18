'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePetalContext } from '@/providers';
import { useOverlordContext } from '@/providers';

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
  const { user, isLoaded } = useUser();
  const [currentSection, setCurrentSection] = useState('main');
  const [isLoading, setIsLoading] = useState(true);
  const { petals, addPetals } = usePetalContext();
  const { quests, addQuest } = useOverlordContext();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in to access the Abyss</div>;
  }

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

  const handleStartQuest = quest => {
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
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-pink-500"></div>
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
        <h1 className="mb-4 text-4xl font-bold text-white">
          Welcome to the Abyss, {user?.firstName}
        </h1>
        <p className="text-gray-400">
          Your journey into the depths begins here. Collect petals, complete quests, and explore the
          mysteries that await.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              <span className="mb-4 block text-4xl">{feature.icon}</span>
              <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
              <p className="mb-4 text-gray-200">{feature.description}</p>
              <a
                href={feature.path}
                className="inline-block rounded-lg bg-white/10 px-4 py-2 text-white transition-colors hover:bg-white/20"
              >
                Explore
              </a>
            </div>
          </motion.div>
        ))}
      </div>

      {quests.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <h2 className="mb-4 text-2xl font-bold text-white">Active Quests</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {quests.map(quest => (
              <div
                key={quest.id}
                className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <h3 className="mb-2 text-lg font-semibold text-white">{quest.title}</h3>
                <p className="mb-2 text-gray-400">{quest.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-pink-500">Reward: {quest.reward} petals</span>
                  <button
                    onClick={() => handleStartQuest(quest)}
                    className="rounded bg-pink-500/20 px-3 py-1 text-white transition-colors hover:bg-pink-500/30"
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
