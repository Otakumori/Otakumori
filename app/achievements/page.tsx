'use client';

import React, { useState } from 'react';
import { AchievementHeader } from '@/components/achievements/AchievementHeader';
import { AchievementStats } from '@/components/achievements/AchievementStats';
import { AchievementSearch } from '@/components/achievements/AchievementSearch';
import { AchievementFilters } from '@/components/achievements/AchievementFilters';
import { AchievementSort } from '@/components/achievements/AchievementSort';
import { AchievementCategories } from '@/components/achievements/AchievementCategories';
import { AchievementList } from '@/components/achievements/AchievementList';
import { useAchievementContext } from '@/contexts/AchievementContext';

export default function AchievementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUnlocked, setShowUnlocked] = useState(true);
  const [showLocked, setShowLocked] = useState(true);
  const [showHidden, setShowHidden] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category' | 'progress'>('name');
  const { achievements } = useAchievementContext();

  const filteredAchievements = achievements.filter(achievement => {
    const matchesSearch = achievement.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || achievement.category === selectedCategory;
    const matchesUnlocked = showUnlocked && achievement.isUnlocked;
    const matchesLocked = showLocked && !achievement.isUnlocked;
    const matchesHidden = showHidden && achievement.isHidden;

    return matchesSearch && matchesCategory && (matchesUnlocked || matchesLocked || matchesHidden);
  });

  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        if (!a.unlockedAt) return 1;
        if (!b.unlockedAt) return -1;
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      case 'category':
        return a.category.localeCompare(b.category);
      case 'progress':
        const progressA = a.isUnlocked ? 100 : ((a.progress || 0) / (a.target || 1)) * 100;
        const progressB = b.isUnlocked ? 100 : ((b.progress || 0) / (b.target || 1)) * 100;
        return progressB - progressA;
      default:
        return 0;
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <AchievementHeader />
      <AchievementStats />
      <AchievementSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <AchievementFilters
        showUnlocked={showUnlocked}
        showLocked={showLocked}
        showHidden={showHidden}
        onToggleUnlocked={() => setShowUnlocked(!showUnlocked)}
        onToggleLocked={() => setShowLocked(!showLocked)}
        onToggleHidden={() => setShowHidden(!showHidden)}
      />
      <AchievementSort sortBy={sortBy} onSortChange={setSortBy} />
      <AchievementCategories
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <AchievementList achievements={sortedAchievements} />
    </div>
  );
}
