/**
 * Advanced Leaderboard System API
 *
 * Features:
 * - Multiple leaderboard categories (score, time, achievements)
 * - Time-based filtering (daily, weekly, monthly, all-time)
 * - Read-only access to historical, explicitly unverified scores
 * - Social features (friends leaderboards)
 * - Seasonal competitions
 */

import { logger } from '@/app/lib/logger';
import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { ensureUserByClerkId } from '@/lib/petals-db';
import { legacyRewardRouteDisabled } from '@/app/lib/petals/legacyRewardRoute';
import { withRateLimit } from '@/lib/security/rate-limiting';
import { withSecurityHeaders } from '@/lib/security/headers';
import { metricsCollector } from '@/lib/monitoring/advanced-metrics';

const GetLeaderboardSchema = z.object({
  category: z.enum(['score', 'time', 'achievements', 'level']).default('score'),
  period: z.enum(['daily', 'weekly', 'monthly', 'all-time']).default('all-time'),
  scope: z.enum(['global', 'friends', 'country']).default('global'),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

async function handler(request: NextRequest, { params }: { params: { gameId: string } }) {
  const startTime = Date.now();

  try {
    const { gameId } = params;

    if (request.method === 'GET') {
      // Get leaderboard
      const url = new URL(request.url);
      const params = Object.fromEntries(url.searchParams);

      const validation = GetLeaderboardSchema.safeParse({
        category: params.category,
        period: params.period,
        scope: params.scope,
        limit: params.limit ? parseInt(params.limit) : undefined,
        offset: params.offset ? parseInt(params.offset) : undefined,
      });

      if (!validation.success) {
        return NextResponse.json(
          { ok: false, error: 'Invalid leaderboard request' },
          { status: 400 },
        );
      }

      const { category, period, scope, limit, offset } = validation.data;

      // Build date filter for period
      const dateFilter = buildDateFilter(period);

      // Build scope filter
      let scopeFilter = {};
      if (scope === 'friends') {
        const { userId } = await auth();
        if (userId) {
          const user = await ensureUserByClerkId(userId);
          // Note: Friend table may not exist, using fallback
          const friends: any[] = [];
          try {
            // const friends = await db.friend.findMany({
            //   where: { userId: user.id, status: 'accepted' },
            //   select: { friendId: true },
            // });
          } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error(String(error));
            logger.warn('Friend table not available, using user-only scope:', undefined, {
              value: err.message,
            });
          }
          scopeFilter = {
            userId: { in: [user.id, ...friends.map((f: any) => f.friendId)] },
          };
        }
      }

      // Fetch leaderboard entries
      const entries = await db.leaderboardScore.findMany({
        where: {
          game: gameId,
          diff: category,
          ...((dateFilter && { createdAt: dateFilter }) || {}),
          ...scopeFilter,
        },
        include: {
          User: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              // country: true, // Not in User schema
            },
          },
        },
        orderBy: category === 'time' ? { score: 'asc' } : { score: 'desc' },
        take: limit,
        skip: offset,
      });

      // Add rankings and format response
      const leaderboard = entries.map((entry, index) => {
        const user = entry.User;
        return {
          rank: offset + index + 1,
          userId: user?.id ?? entry.userId,
          username: user?.username ?? 'User',
          displayName: user?.displayName ?? user?.username ?? 'User',
          avatarUrl: user?.avatarUrl ?? null,
          country: null, // Not available in current schema
          score: entry.score,
          metadata: withoutVerificationClaim(entry.statsJson),
          submittedAt: entry.createdAt,
          verified: false,
        };
      });

      // Get total count for pagination
      const totalCount = await db.leaderboardScore.count({
        where: {
          game: gameId,
          diff: category,
          ...((dateFilter && { createdAt: dateFilter }) || {}),
          ...scopeFilter,
        },
      });

      // Track metrics
      await metricsCollector.track('leaderboard_viewed', {
        value: 1,
        tags: { gameId, category, period, scope },
      });

      return NextResponse.json({
        ok: true,
        data: {
          leaderboard,
          pagination: {
            total: totalCount,
            limit,
            offset,
            hasMore: offset + limit < totalCount,
          },
          metadata: {
            category,
            period,
            scope,
            lastUpdated: new Date().toISOString(),
          },
        },
      });
    }

    return NextResponse.json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    logger.error(
      'Leaderboard error:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );

    await metricsCollector.track('leaderboard_error', {
      value: 1,
      tags: {
        gameId: params.gameId,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  } finally {
    const duration = Date.now() - startTime;
    await metricsCollector.track('api_response_time', {
      value: duration,
      tags: { endpoint: 'leaderboard', gameId: params.gameId },
    });
  }
}

function withoutVerificationClaim(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const metadata = { ...(value as Record<string, unknown>) };
  delete metadata.verified;
  return metadata;
}

function buildDateFilter(period: string) {
  const now = new Date();

  switch (period) {
    case 'daily':
      const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { gte: dayStart };

    case 'weekly':
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { gte: weekStart };

    case 'monthly':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { gte: monthStart };

    case 'all-time':
    default:
      return undefined;
  }
}

export async function POST() {
  return legacyRewardRouteDisabled('/api/v1/games/personal-best');
}

export const GET = withSecurityHeaders(withRateLimit(handler, 'LEADERBOARD_VIEW'));
export const runtime = 'nodejs';
