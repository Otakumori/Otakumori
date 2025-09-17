"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Trophy } from "lucide-react";

import { AchievementProvider, useAchievements } from "./achievements/AchievementProvider";
import { AchievementList } from "./achievements/AchievementList";
import { AchievementSearch } from "./achievements/AchievementSearch";

function AchievementsContent() {
  const { achievements, getUnlockedCount } = useAchievements();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return achievements;

    return achievements.filter((achievement) =>
      [achievement.title, achievement.description].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [achievements, searchQuery]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 rounded-xl border border-pink-100 bg-white p-6 shadow-sm dark:border-pink-500/30 dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Achievements</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getUnlockedCount()} unlocked · {achievements.length} total goals
            </p>
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500"
          >
            <Trophy className="h-6 w-6" />
          </motion.div>
        </div>
        <AchievementSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </header>

      <AchievementList achievements={filtered} />

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-pink-200 p-8 text-center text-sm text-gray-500 dark:border-pink-500/50 dark:text-gray-400">
          <Lock className="mb-2 h-6 w-6" />
          <p>No achievements match your search just yet.</p>
        </div>
      )}
    </section>
  );
}

export default function Achievements() {
  return (
    <AchievementProvider>
      <AchievementsContent />
    </AchievementProvider>
  );
}