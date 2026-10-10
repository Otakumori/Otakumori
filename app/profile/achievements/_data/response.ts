import type { Achievement } from '@/app/components/profile/AchievementsTabs';

export function extractAchievements(payload: unknown): Achievement[] {
  if (!payload || typeof payload !== 'object') return [];

  const data = 'data' in payload ? payload.data : null;
  if (!data || typeof data !== 'object') return [];

  const achievements = 'achievements' in data ? data.achievements : null;
  return Array.isArray(achievements) ? (achievements as Achievement[]) : [];
}
