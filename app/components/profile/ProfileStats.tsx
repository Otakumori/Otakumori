 
 
import React from 'react';
import { motion } from 'framer-motion';

// Placeholder data types
interface Achievement {
  id: string;
  name: string;
  icon: string;
  isErotic?: boolean;
  tooltip: string;
}

interface ProfileStatsProps {
  achievements?: Achievement[];
  echoLog?: string[];
  memoryUnlocked?: number;
  vaultProgress?: number; // percent
  cgsUnlocked?: number;
  fragmentsCollected?: number;
  petalsTotal?: number;
  miniGames?: { name: string; value: number }[];
}

const sampleAchievements: Achievement[] = [
  {
    id: '1',
    name: 'Petal Initiate',
    icon: '/assets/achievements/tier-1-petal.png',
    tooltip: 'First bloom.',
  },
  {
    id: '2',
    name: 'Blossom Whisper',
    icon: '/assets/achievements/tier-2-petal.png',
    tooltip: 'Unlocked a secret.',
    isErotic: true,
  },
  {
    id: '3',
    name: 'Memory Keeper',
    icon: '/assets/achievements/tier-3-petal.png',
    tooltip: 'Vault explorer.',
  },
];

const sampleEchoLog = [
  'I can still change this',
  "I broke it and don't know how to fix it",
  'I am soft locked',
];

const sampleMiniGames = [
  { name: 'Games Played', value: 12 },
  { name: 'Rare Drops', value: 3 },
  { name: 'Secrets Found', value: 5 },
];

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  achievements = sampleAchievements,
  echoLog = sampleEchoLog,
  memoryUnlocked = 156,
  vaultProgress = 82,
  cgsUnlocked = 24,
  fragmentsCollected = 47,
  petalsTotal = 24573,
  miniGames = sampleMiniGames,
}) => {
  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      {/* Achievements */}
      <div>
        <h2 className="font-cormorant-garamond mb-2 text-lg tracking-wide text-pink-200">
          Achievements
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {achievements.map((ach) => (
            <motion.div
              key={ach.id}
              whileHover={{ scale: 1.08 }}
              className={`relative flex flex-col items-center rounded-lg border border-pink-400/30 bg-pink-200/10 p-2 shadow-md transition-all ${ach.isErotic ? 'animate-pulse shadow-pink-400/30' : ''}`}
            >
              <img src={ach.icon} alt={ach.name} className="mb-1 h-10 w-10" />
              <span className="font-roboto-condensed whitespace-nowrap text-xs text-pink-100">
                {ach.name}
              </span>
              {/* Tooltip */}
              <span className="font-cormorant-garamond pointer-events-none absolute bottom-[-2.2rem] left-1/2 z-20 -translate-x-1/2 rounded bg-[#2d2233] px-2 py-1 text-xs text-pink-200 opacity-0 shadow-lg transition group-hover:opacity-100">
                {ach.tooltip}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Echo Log */}
      <div>
        <h2 className="font-cormorant-garamond mb-2 text-lg tracking-wide text-pink-200">
          Whisper Submissions
        </h2>
        <ul className="rounded-lg border border-pink-400/20 bg-pink-200/10 p-4 shadow-inner">
          {echoLog.map((line, idx) => (
            <li
              key={idx}
              className="font-cormorant-garamond animate-fade-in mb-1 italic text-pink-100 last:mb-0"
            >
              {line}
            </li>
          ))}
        </ul>
      </div>
      {/* Memory Vault Progress */}
      <div>
        <h2 className="font-cormorant-garamond mb-2 text-lg tracking-wide text-pink-200">
          Memory Unlocked
        </h2>
        <div className="flex items-center gap-4">
          <span className="font-roboto-condensed text-2xl font-bold text-pink-100">
            {memoryUnlocked}
          </span>
          <div className="flex-1">
            <div className="h-3 w-full overflow-hidden rounded-full bg-pink-200/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${vaultProgress}%` }}
                transition={{ duration: 1.2 }}
                className="h-full rounded-full bg-pink-400 shadow-lg shadow-pink-200/30"
              />
            </div>
            <div className="font-roboto-condensed mt-1 flex justify-between text-xs text-pink-200">
              <span>{vaultProgress}% Explored</span>
              <span>
                {cgsUnlocked} CGs • {fragmentsCollected} Fragments
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Petals Collected */}
      <div>
        <h2 className="font-cormorant-garamond mb-2 text-lg tracking-wide text-pink-200">
          Petal Total
        </h2>
        <div className="flex items-center gap-4">
          {/* Animated flower (placeholder SVG) */}
          <motion.svg
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2 }}
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            className="drop-shadow-pink-200/30"
          >
            <circle cx="24" cy="24" r="20" fill="#F7C6D9" fillOpacity="0.3" />
            <ellipse cx="24" cy="14" rx="8" ry="14" fill="#F7C6D9" fillOpacity="0.7" />
            <ellipse cx="24" cy="34" rx="8" ry="14" fill="#F7C6D9" fillOpacity="0.7" />
            <ellipse cx="14" cy="24" rx="14" ry="8" fill="#F7C6D9" fillOpacity="0.7" />
            <ellipse cx="34" cy="24" rx="14" ry="8" fill="#F7C6D9" fillOpacity="0.7" />
          </motion.svg>
          <span className="font-roboto-condensed text-3xl font-bold tracking-wider text-pink-100">
            {petalsTotal.toLocaleString('en-US', { minimumFractionDigits: 3 })}
          </span>
        </div>
      </div>
      {/* Mini-Games Played */}
      <div>
        <h2 className="font-cormorant-garamond mb-2 text-lg tracking-wide text-pink-200">
          Mini-Games Played
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {miniGames.map((stat, idx) => (
            <motion.div
              key={stat.name}
              whileHover={{ scale: 1.05, boxShadow: '0 0 12px #F7C6D9' }}
              className="flex flex-col items-center rounded-lg border border-pink-400/20 bg-pink-200/10 p-3 shadow-sm transition-all"
            >
              <span className="font-roboto-condensed text-lg font-bold text-pink-100">
                {stat.value}
              </span>
              <span className="font-cormorant-garamond mt-1 text-xs text-pink-200">
                {stat.name}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
