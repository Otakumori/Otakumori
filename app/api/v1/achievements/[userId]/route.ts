/**
 * Achievement System API - Simplified Implementation
 *
 * This is a working stub that will be enhanced once the proper
 * database schema is in place.
 */

import { logger } from '@/app/lib/logger';
import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const UnlockAchievementSchema = z.object({
  achievementId: z.string().min(1),
  progress: z.number().min(0).max(1).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

const GetAchievementsSchema = z.object({
  category: z.enum(['gaming', 'social', 'collection', 'seasonal', 'secret']).optional(),
  status: z.enum(['unlocked', 'in-progress', 'locked', 'all']).default('all'),
  rarity: z.enum(['common', 'rare', 'epic', 'legendary', 'mythic']).optional(),
  sortBy: z.enum(['unlockDate', 'rarity', 'progress', 'points']).default('unlockDate'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS: Record<string, any> = {
  'first-game': {
    id: 'first-game',
    name: 'Welcome to the Garden',
    description: 'Play your first mini-game',
    category: 'gaming',
    rarity: 'common',
    points: 10,
    icon: '',
    requirements: { gamesPlayed: 1 },
  },
  'memory-master': {
    id: 'memory-master',
    name: 'Memory Palace Architect',
    description: 'Complete Memory Match with perfect accuracy',
    category: 'gaming',
    rarity: 'rare',
    points: 50,
    icon: '',
    requirements: { gameId: 'memory-match', accuracy: 1.0 },
  },
  // Add more achievements as needed
};

async function handler(request: NextRequest, { params }: { params: { userId: string } }) {
  const startTime = Date.now();

  try {
    const { userId: paramUserId } = params;
    const { userId: currentUserId } = await auth();

    // Log request timing
    const logTiming = () => {
      const duration = Date.now() - startTime;
      logger.warn(`Achievement request completed in ${duration}ms`);
    };

    if (request.method === 'POST') {
      // Unlock achievement
      if (!currentUserId) {
        return NextResponse.json(
          { ok: false, error: 'Authentication required' },
          { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
        );
      }

      const body = await request.json();
      const validation = UnlockAchievementSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { ok: false, error: 'Invalid achievement unlock request' },
          { status: 400 },
        );
      }

      const { achievementId, progress = 1, metadata = {} } = validation.data;

      // Validate achievement exists
      const achievement = ACHIEVEMENT_DEFINITIONS[achievementId];
      if (!achievement) {
        return NextResponse.json({ ok: false, error: 'Achievement not found' }, { status: 404 });
      }

      // For now, return success without persisting to database
      // This will be updated when the UserAchievement table is created
      const isFullyUnlocked = progress >= 1;
      const pointsAwarded = achievement.points;
      const petalsAwarded = Math.floor(pointsAwarded * 10);

      return NextResponse.json({
        ok: true,
        data: {
          achievement: {
            id: achievementId,
            ...achievement,
            progress,
            unlocked: isFullyUnlocked,
            unlockedAt: isFullyUnlocked ? new Date() : null,
            metadata, // Include any extra unlock metadata
          },
          rewards: {
            points: pointsAwarded,
            petals: petalsAwarded,
          },
          newUnlock: isFullyUnlocked,
        },
      });
    }

    if (request.method === 'GET') {
      // Get user achievements
      const url = new URL(request.url);
      const queryParams = Object.fromEntries(url.searchParams);

      const validation = GetAchievementsSchema.safeParse({
        category: queryParams.category,
        status: queryParams.status,
        rarity: queryParams.rarity,
        sortBy: queryParams.sortBy,
        limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
        offset: queryParams.offset ? parseInt(queryParams.offset) : undefined,
      });

      if (!validation.success) {
        return NextResponse.json(
          { ok: false, error: 'Invalid achievements request' },
          { status: 400 },
        );
      }

      const { category, status, rarity, sortBy, limit, offset } = validation.data;

      // For now, return mock achievements data
      // This will be updated when the database integration is complete
      let achievements = Object.values(ACHIEVEMENT_DEFINITIONS)
        .map((def) => ({
          ...def,
          progress: 0,
          unlocked: false,
          unlockedAt: null,
          metadata: {},
        }))
        .filter((achievement) => {
          // Filter by category
          if (category && achievement.category !== category) {
            return false;
          }

          // Filter by rarity
          if (rarity && achievement.rarity !== rarity) {
            return false;
          }

          // Filter by status
          if (status !== 'all') {
            if (status === 'unlocked' && !achievement.unlocked) return false;
            if (status === 'locked' && achievement.progress > 0) return false;
            if (status === 'in-progress' && (achievement.progress === 0 || achievement.unlocked))
              return false;
          }

          return true;
        });

      // Sort achievements
      achievements.sort((a, b) => {
        switch (sortBy) {
          case 'rarity':
            const rarityOrder: Record<string, number> = {
              common: 1,
              rare: 2,
              epic: 3,
              legendary: 4,
              mythic: 5,
            };
            return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);

          case 'points':
            return b.points - a.points;

          default:
            return 0;
        }
      });

      // Paginate
      const paginatedAchievements = achievements.slice(offset, offset + limit);

      // Calculate statistics
      const stats = {
        total: achievements.length,
        unlocked: achievements.filter((a) => a.unlocked).length,
        inProgress: achievements.filter((a) => a.progress > 0 && !a.unlocked).length,
        totalPoints: achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0),
        rareUnlocked: achievements.filter(
          (a) => a.unlocked && ['epic', 'legendary', 'mythic'].includes(a.rarity),
        ).length,
      };

      return NextResponse.json({
        ok: true,
        data: {
          achievements: paginatedAchievements,
          pagination: {
            total: achievements.length,
            limit,
            offset,
            hasMore: offset + limit < achievements.length,
          },
          stats,
          user: {
            id: paramUserId,
            username: 'User',
            displayName: 'User',
            achievementPoints: 0,
          },
        },
      });
    }

    logTiming();
    return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      'Achievement error after ms:',
      undefined,
      { duration },
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export const POST = handler;
export const GET = handler;
export const runtime = 'nodejs';
