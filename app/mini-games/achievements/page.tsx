'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'skill' | 'collector' | 'social';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  reward: {
    petals: number;
    items?: string[];
    title?: string;
  };
  unlockedAt?: Date;
}

export default function AchievementsPage() {
  const [_activeCategory, _setActiveCategory] = useState<
    'all' | 'daily' | 'weekly' | 'skill' | 'collector' | 'social'
  >('all');
  const [_achievements, _setAchievements] = useState<Achievement[]>([]);
  const [_totalProgress, _setTotalProgress] = useState({ completed: 0, total: 0 });
  const params = useSearchParams();
  const router = useRouter();

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const next = new URLSearchParams(params.toString());
    next.set('face', '1');
    router.replace(`/mini-games?${next.toString()}`);
  }, [params, router]);
  return null;
}
