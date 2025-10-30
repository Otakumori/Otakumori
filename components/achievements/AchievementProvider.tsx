// DEPRECATED: This component is a duplicate. Use app\components\achievements\AchievementProvider.tsx instead.
import React, { createContext, useContext, useState, type ReactNode } from 'react';

// Achievement item type
export type Achievement = {
  id: string;
  name: string;
  description: string;
  image: string;
  unlocked: boolean;
};

// Achievement context type
interface AchievementContextType {
  achievements: Achievement[];
  addAchievement: (achievement: Achievement) => void;
  removeAchievement: (id: string) => void;
  clearAchievements: () => void;
  isOpen: boolean;
  openAchievements: () => void;
  closeAchievements: () => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export const useAchievements = () => {
  const ctx = useContext(AchievementContext);
  if (!ctx) throw new Error('useAchievements must be used within an AchievementProvider');
  return ctx;
};

export const AchievementProvider = ({ children }: { children: ReactNode }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addAchievement = (achievement: Achievement) => {
    setAchievements((prev) => {
      const existing = prev.find((a) => a.id === achievement.id);
      if (existing) {
        return prev.map((a) => (a.id === achievement.id ? { ...a, unlocked: true } : a));
      }
      return [...prev, achievement];
    });
    setIsOpen(true);
  };

  const removeAchievement = (id: string) => {
    setAchievements((prev) => prev.filter((achievement) => achievement.id !== id));
  };

  const clearAchievements = () => setAchievements([]);
  const openAchievements = () => setIsOpen(true);
  const closeAchievements = () => setIsOpen(false);

  return (
    <AchievementContext.Provider
      value={{
        achievements,
        addAchievement,
        removeAchievement,
        clearAchievements,
        isOpen,
        openAchievements,
        closeAchievements,
      }}
    >
      {children}
      <AchievementDrawer />
    </AchievementContext.Provider>
  );
};

// Aesthetic Achievement Drawer
const AchievementDrawer = () => {
  const { achievements, isOpen, closeAchievements, removeAchievement, clearAchievements } =
    useAchievements();

  return (
    <div
      className={`fixed right-0 top-0 z-50 h-full w-96 max-w-full transform border-l border-blue-200 bg-gradient-to-br from-blue-100/90 to-indigo-200/90 shadow-2xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } backdrop-blur-lg`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="flex items-center justify-between border-b border-blue-200 px-6 py-4">
        <h2 className="text-2xl font-bold tracking-tight text-blue-600 drop-shadow">
          <span role="img" aria-label="Trophy"></span> Achievements
        </h2>
        <button
          onClick={closeAchievements}
          className="text-2xl text-blue-400 hover:text-blue-600 focus:outline-none"
          aria-label="Close achievements"
        >
          &times;
        </button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {achievements.length === 0 ? (
          <div className="mt-16 text-center text-blue-400">
            <span
              className="mb-2 block animate-bounce text-5xl"
              role="img"
              aria-label="Star"
            ></span>
            <p className="text-lg font-medium">No achievements unlocked yet!</p>
            <p className="text-sm text-blue-300">Keep exploring to earn achievements~</p>
          </div>
        ) : (
          achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="group flex items-center rounded-xl bg-white/80 p-3 shadow transition hover:shadow-lg"
            >
              <img
                src={achievement.image}
                alt={achievement.name}
                className="mr-4 h-16 w-16 rounded-lg border-2 border-blue-200 object-cover shadow-sm"
              />
              <div className="flex-1">
                <div className="font-semibold text-blue-700 transition group-hover:text-blue-900">
                  {achievement.name}
                </div>
                <div className="text-sm text-blue-400">{achievement.description}</div>
              </div>
              <button
                onClick={() => removeAchievement(achievement.id)}
                className="ml-2 text-xl text-blue-300 transition hover:text-blue-600"
                aria-label="Remove achievement"
              >
                &times;
              </button>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-blue-200 bg-white/70 px-6 py-4">
        <button
          onClick={clearAchievements}
          className="mb-2 w-full rounded-lg bg-gradient-to-r from-blue-400 to-indigo-400 py-2 font-bold text-white shadow transition hover:from-blue-500 hover:to-indigo-500"
        >
          Clear Achievements
        </button>
      </div>
    </div>
  );
};
