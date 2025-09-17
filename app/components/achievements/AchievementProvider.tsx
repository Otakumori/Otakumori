"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  total: number;
  reward?: {
    type: "points" | "badge" | "discount";
    value: number | string;
  };
}

interface AchievementContextType {
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  getUnlockedCount: () => number;
}

const STORAGE_KEY = "otakumori:achievements";

const defaultAchievements: Achievement[] = [
  {
    id: "first_purchase",
    title: "First Purchase",
    description: "Make your first purchase",
    icon: "??",
    unlocked: false,
    progress: 0,
    total: 1,
    reward: {
      type: "points",
      value: 100,
    },
  },
  {
    id: "collector",
    title: "Collector",
    description: "Purchase 10 different items",
    icon: "??",
    unlocked: false,
    progress: 0,
    total: 10,
    reward: {
      type: "badge",
      value: "Collector Badge",
    },
  },
  {
    id: "big_spender",
    title: "Big Spender",
    description: "Spend 100,000 petals across the shop",
    icon: "??",
    unlocked: false,
    progress: 0,
    total: 100,
    reward: {
      type: "discount",
      value: 10,
    },
  },
  {
    id: "community_member",
    title: "Community Member",
    description: "Join the Bonfire community",
    icon: "??",
    unlocked: false,
    progress: 0,
    total: 1,
    reward: {
      type: "points",
      value: 50,
    },
  },
  {
    id: "reviewer",
    title: "Product Reviewer",
    description: "Write five product reviews",
    icon: "??",
    unlocked: false,
    progress: 0,
    total: 5,
    reward: {
      type: "points",
      value: 200,
    },
  },
];

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

const loadInitialAchievements = (): Achievement[] => {
  if (typeof window === "undefined") return defaultAchievements;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultAchievements;

    const parsed = JSON.parse(saved) as Achievement[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((achievement) => ({
        ...achievement,
        progress: Math.min(achievement.progress, achievement.total),
        unlocked: achievement.unlocked || achievement.progress >= achievement.total,
      }));
    }
  } catch (error) {
    console.warn("Unable to load achievements from storage", error);
  }

  return defaultAchievements;
};

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(loadInitialAchievements);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
  }, [achievements]);

  const unlockAchievement = (id: string) => {
    setAchievements((current) =>
      current.map((achievement) =>
        achievement.id === id
          ? { ...achievement, unlocked: true, progress: achievement.total }
          : achievement,
      ),
    );
  };

  const updateProgress = (id: string, progress: number) => {
    setAchievements((current) =>
      current.map((achievement) => {
        if (achievement.id !== id) {
          return achievement;
        }

        const nextProgress = Math.max(0, Math.min(progress, achievement.total));
        const unlocked = nextProgress >= achievement.total;
        return { ...achievement, progress: nextProgress, unlocked };
      }),
    );
  };

  const getUnlockedCount = () => achievements.filter((achievement) => achievement.unlocked).length;

  const value = useMemo(
    () => ({ achievements, unlockAchievement, updateProgress, getUnlockedCount }),
    [achievements],
  );

  return <AchievementContext.Provider value={value}>{children}</AchievementContext.Provider>;
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error("useAchievements must be used within an AchievementProvider");
  }
  return context;
}