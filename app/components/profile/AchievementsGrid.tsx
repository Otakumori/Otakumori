'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import GlassPanel from '../GlassPanel';
import { t } from '../../lib/microcopy';

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
};

type AchievementsGridProps = {
  achievements: Achievement[];
};

export default function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const [hoveredAchievement, setHoveredAchievement] = useState<string | null>(null);
  const [sparkleElements, setSparkleElements] = useState<Array<{ id: string; x: number; y: number; delay: number }>>([]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-zinc-400 text-zinc-400';
      case 'uncommon': return 'border-green-400 text-green-400';
      case 'rare': return 'border-blue-400 text-blue-400';
      case 'epic': return 'border-purple-400 text-purple-400';
      case 'legendary': return 'border-yellow-400 text-yellow-400';
      default: return 'border-zinc-400 text-zinc-400';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-none';
      case 'uncommon': return 'shadow-[0_0_20px_rgba(34,197,94,0.3)]';
      case 'rare': return 'shadow-[0_0_20px_rgba(59,130,246,0.3)]';
      case 'epic': return 'shadow-[0_0_20px_rgba(168,85,247,0.3)]';
      case 'legendary': return 'shadow-[0_0_20px_rgba(234,179,8,0.3)]';
      default: return 'shadow-none';
    }
  };

  const getCrypticHint = (achievement: Achievement) => {
    const hints = {
      'first-steps': 'A blossom unseen under moonlight',
      'petal-master': 'When the tree weeps, catch its tears',
      'explorer': 'Venture where shadows dance',
      'collector': 'Gather what others discard',
      'social-butterfly': 'Speak to the silent stones',
      'night-owl': 'When the world sleeps, you awaken',
      'perfectionist': 'Seek the flawless path',
      'mystic': 'Read the signs in the digital wind',
    };
    return hints[achievement.id as keyof typeof hints] || 'The path reveals itself to the patient';
  };

  const createSparkles = (achievementId: string, rect: DOMRect) => {
    const sparkles = [];
    for (let i = 0; i < 8; i++) {
      sparkles.push({
        id: `${achievementId}-sparkle-${i}`,
        x: rect.left + Math.random() * rect.width,
        y: rect.top + Math.random() * rect.height,
        delay: i * 100,
      });
    }
    setSparkleElements(sparkles);
  };

  const handleMouseEnter = (achievementId: string, event: React.MouseEvent<HTMLDivElement>) => {
    if (achievements.find(a => a.id === achievementId)?.unlocked) {
      setHoveredAchievement(achievementId);
      const rect = event.currentTarget.getBoundingClientRect();
      createSparkles(achievementId, rect);
    }
  };

  const handleMouseLeave = () => {
    setHoveredAchievement(null);
    setSparkleElements([]);
  };

  useEffect(() => {
    if (sparkleElements.length > 0) {
      const timer = setTimeout(() => {
        setSparkleElements([]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [sparkleElements]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Progress</h2>
            <p className="text-zinc-400">
              {unlockedCount} of {totalCount} achievements unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-fuchsia-300">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </div>
            <div className="text-sm text-zinc-400">Complete</div>
          </div>
        </div>
        <div className="mt-4 w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-fuchsia-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </GlassPanel>

      {/* Achievements Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 relative">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`p-4 transition-all duration-300 cursor-pointer rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_60px_-15px_rgba(200,120,255,0.25)] ${
              achievement.unlocked 
                ? 'opacity-100 hover:scale-105' 
                : 'opacity-60 grayscale hover:opacity-80'
            } ${
              hoveredAchievement === achievement.id && achievement.unlocked
                ? 'animate-pulse bg-fuchsia-500/10 border-fuchsia-400/50'
                : ''
            }`}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => handleMouseEnter(achievement.id, e)}
            onMouseLeave={handleMouseLeave}
          >
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-xl border-2 ${getRarityColor(achievement.rarity)} ${getRarityGlow(achievement.rarity)} flex items-center justify-center relative overflow-hidden`}>
                {achievement.unlocked ? (
                  <Image
                    src={`/assets/achievements/${achievement.icon}`}
                    alt={achievement.name}
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                ) : (
                  <div className="w-8 h-8 bg-zinc-600 rounded"></div>
                )}
                
                {/* Sparkle overlay for unlocked achievements */}
                {hoveredAchievement === achievement.id && achievement.unlocked && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-fuchsia-400/20 to-transparent animate-pulse"></div>
                  </div>
                )}
              </div>
              
              <h3 className={`font-semibold text-sm mb-1 ${
                achievement.unlocked ? 'text-white' : 'text-zinc-500'
              }`}>
                {achievement.name}
              </h3>
              
              <p className={`text-xs mb-2 ${
                achievement.unlocked ? 'text-zinc-300' : 'text-zinc-600'
              }`}>
                {achievement.unlocked ? achievement.description : getCrypticHint(achievement)}
              </p>

              {achievement.progress !== undefined && achievement.maxProgress && (
                <div className="w-full bg-white/10 rounded-full h-1 mb-2">
                  <div 
                    className="bg-fuchsia-400 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  />
                </div>
              )}

              {achievement.unlocked && achievement.unlockedAt && (
                <p className="text-xs text-zinc-500">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              )}

              {!achievement.unlocked && achievement.progress !== undefined && (
                <p className="text-xs text-zinc-500">
                  {achievement.progress} / {achievement.maxProgress}
                </p>
              )}
            </div>
          </div>
        ))}
        
        {/* Floating Sparkles */}
        {sparkleElements.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute pointer-events-none animate-ping"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              animationDelay: `${sparkle.delay}ms`,
            }}
          >
            <div className="w-2 h-2 bg-fuchsia-400 rounded-full opacity-75"></div>
          </div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-12">
          <GlassPanel className="p-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              No achievements yet
            </h2>
            <p className="text-zinc-400">
              Start exploring to unlock your first achievement!
            </p>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
