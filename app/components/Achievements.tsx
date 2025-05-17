import { useState, useEffect } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  reward: string;
  category: 'petals' | 'crafting' | 'trading' | 'gaming' | 'social';
}

export default function Achievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([
    // Petal Collection Achievements
    {
      id: 'petal_master',
      title: 'Petal Master',
      description: 'Collect 100 petals in total',
      icon: '✦',
      progress: 0,
      maxProgress: 100,
      unlocked: false,
      reward: 'Golden Petal Skin',
      category: 'petals',
    },
    {
      id: 'combo_king',
      title: 'Combo King',
      description: 'Achieve a 20x combo',
      icon: '꧁𝔂𝓪𝓼𝓼 𝓺𝓾𝓮𝓮𝓷꧂',
      progress: 0,
      maxProgress: 20,
      unlocked: false,
      reward: 'Special Particle Effect',
      category: 'petals',
    },
    {
      id: 'power_collector',
      title: 'Power Collector',
      description: 'Collect 50 power-ups',
      icon: '˶ᵔ ᵕ ᵔ˶',
      progress: 0,
      maxProgress: 50,
      unlocked: false,
      reward: 'Extended Power-up Duration',
      category: 'petals',
    },
    // Dark Souls Themed Achievements
    {
      id: 'chosen_undead',
      title: 'Chosen Undead',
      description: 'Die 100 times in mini-games',
      icon: '𝖜𝖔𝖒𝖕 𝖜𝖔𝖒𝖕',
      progress: 0,
      maxProgress: 100,
      unlocked: false,
      reward: 'Dark Souls Emote Pack',
      category: 'gaming',
    },
    {
      id: 'sun_praise',
      title: 'Praise the Sun',
      description: 'Help 10 other players',
      icon: '٩>ᴗ<)و',
      progress: 0,
      maxProgress: 10,
      unlocked: false,
      reward: 'Sun Bro Badge',
      category: 'social',
    },
    // Kawaii Themed Achievements
    {
      id: 'kawaii_collector',
      title: 'Kawaii Collector',
      description: 'Collect 50 cute items',
      icon: '( • )( • )',
      progress: 0,
      maxProgress: 50,
      unlocked: false,
      reward: 'Special Kawaii Theme',
      category: 'crafting',
    },
    {
      id: 'senpai_noticed',
      title: 'Senpai Noticed Me',
      description: 'Get 100 likes on your profile',
      icon: '❤︎',
      progress: 0,
      maxProgress: 100,
      unlocked: false,
      reward: 'Special Profile Badge',
      category: 'social',
    },
    // Trading Achievements
    {
      id: 'merchant_king',
      title: 'Merchant King',
      description: 'Complete 50 trades',
      icon: '[̲̅$̲̅(̲̅∞)̲̅$̲̅]',
      progress: 0,
      maxProgress: 50,
      unlocked: false,
      reward: 'Special Trading Badge',
      category: 'trading',
    },
    {
      id: 'rare_collector',
      title: 'Rare Collector',
      description: 'Collect 10 legendary items',
      icon: '❤ (ɔˆз(ˆ⌣ˆc)',
      progress: 0,
      maxProgress: 10,
      unlocked: false,
      reward: 'Legendary Trader Title',
      category: 'trading',
    },
    // Gaming Achievements
    {
      id: 'speed_runner',
      title: 'Speed Runner',
      description: 'Complete any mini-game in under 30 seconds',
      icon: '⌨️🖱️💨',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      reward: 'Speed Runner Badge',
      category: 'gaming',
    },
    {
      id: 'completionist',
      title: 'Completionist',
      description: 'Unlock all achievements',
      icon: '‎٩(⸝⸝ᵕᴗᵕ⸝⸝)و*̣̩⋆̩*',
      progress: 0,
      maxProgress: 1,
      unlocked: false,
      reward: 'Platinum Trophy',
      category: 'gaming',
    },
  ]);

  const [showUnlock, setShowUnlock] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    // Load achievements from localStorage
    const savedAchievements = localStorage.getItem('achievements');
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  }, []);

  useEffect(() => {
    // Save achievements to localStorage
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  const updateProgress = (id: string, progress: number) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => {
        if (achievement.id === id) {
          const newProgress = Math.min(progress, achievement.maxProgress);
          const unlocked = newProgress >= achievement.maxProgress && !achievement.unlocked;
          if (unlocked) {
            setShowUnlock(id);
            setTimeout(() => setShowUnlock(null), 3000);
          }
          return {
            ...achievement,
            progress: newProgress,
            unlocked: unlocked || achievement.unlocked,
          };
        }
        return achievement;
      });
      return updated;
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <h2 className="drop-shadow-glow animate-glow mb-6 text-3xl font-bold text-pink-400">
        Achievements
      </h2>

      {/* Category Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {['all', 'petals', 'crafting', 'trading', 'gaming', 'social'].map(category => (
          <button
            key={category}
            className={`shadow-glow whitespace-nowrap rounded-lg px-4 py-2 font-bold transition-all ${
              activeCategory === category
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-pink-400/40'
                : 'bg-black/50 text-pink-300 hover:bg-pink-500/20'
            }`}
            onClick={() => setActiveCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievement Unlock Notification */}
      {showUnlock && (
        <div className="drop-shadow-glow fixed right-4 top-4 animate-bounce rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 p-4 text-white shadow-lg">
          Achievement Unlocked! 🎉
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {achievements
          .filter(a => activeCategory === 'all' || a.category === activeCategory)
          .map(achievement => (
            <div
              key={achievement.id}
              className={`shadow-glow rounded-xl border-2 p-4 transition-all duration-300 ${
                achievement.unlocked
                  ? 'border-pink-400 bg-gradient-to-r from-pink-500/20 to-purple-600/20 shadow-pink-400/40'
                  : 'border-pink-900 bg-black/60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="drop-shadow-glow animate-glow select-none text-3xl font-extrabold">
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <h3 className="drop-shadow-glow animate-glow text-xl font-bold text-pink-400">
                    {achievement.title}
                  </h3>
                  <p className="text-sm italic text-pink-200">{achievement.description}</p>
                  <div className="mt-2">
                    <div className="h-2 overflow-hidden rounded-full bg-pink-900/50">
                      <div
                        className="shadow-glow h-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-300"
                        style={{
                          width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-pink-300">
                      {achievement.progress} / {achievement.maxProgress}
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <div className="animate-glow mt-2 text-sm font-bold text-pink-300">
                      Reward: {achievement.reward}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
      <style jsx>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px #ff2ab8cc) drop-shadow(0 0 2px #fff3);
        }
        .shadow-glow {
          box-shadow:
            0 0 16px 2px #ff2ab8cc,
            0 0 2px #fff3;
        }
        @keyframes glow {
          0% {
            text-shadow:
              0 0 8px #ff2ab8,
              0 0 2px #fff3;
          }
          50% {
            text-shadow:
              0 0 16px #ff2ab8,
              0 0 4px #fff6;
          }
          100% {
            text-shadow:
              0 0 8px #ff2ab8,
              0 0 2px #fff3;
          }
        }
        .animate-glow {
          animation: glow 2s infinite alternate;
        }
      `}</style>
    </div>
  );
}
