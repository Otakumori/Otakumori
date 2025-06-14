'use client';

import { useAchievements } from '@/components/achievements/AchievementProvider';
import AchievementCard from '@/components/achievements/AchievementCard';
import { Card } from '@/components/ui/card';

export default function AchievementsPage() {
  const { achievements, getUnlockedCount } = useAchievements();
  const unlockedCount = getUnlockedCount();

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Achievements</h1>
          <p className="text-xl text-pink-200">
            Unlocked {unlockedCount} of {achievements.length} achievements
          </p>
        </div>

        <Card className="p-6 bg-white/10 backdrop-blur-lg border-pink-500/30 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </Card>

        <div className="text-center">
          <p className="text-pink-200">
            Complete achievements to earn rewards, badges, and discounts!
          </p>
        </div>
      </div>
    </main>
  );
} 