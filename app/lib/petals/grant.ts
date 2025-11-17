/**
 * Centralized Petal Granting System
 * 
 * This module provides a single, well-validated entry point for all petal grants.
 * All petal earning should flow through grantPetals() to ensure:
 * - Consistent validation
 * - Rate limiting
 * - Daily caps per source
 * - Proper transaction logging
 * - Anti-exploit protection
 * 
 * ARCHITECTURE:
 * - PetalWallet is the source of truth for balance (with lifetimeEarned tracking)
 * - User.petalBalance kept in sync for backward compatibility
 * - PetalTransaction records all grants for audit trail
 * - PetalLedger tracks lifetime earnings by type
 * 
 * ENTRY POINTS:
 * - Mini-games: /api/v1/petals/earn, /api/mini-games/submit
 * - Background clicks: /api/v1/petals/collect (homepage_collection)
 * - Achievements: /api/v1/achievements/unlock
 * - Purchases: inngest/order-fulfillment.ts
 * - Daily bonuses: /api/quests/claim
 * - Admin grants: (future)
 */

import { db } from '@/lib/db';
import { logger } from '@/app/lib/logger';
import { checkRateLimit, getClientIdentifier } from '@/app/lib/rate-limiting';
import type { NextRequest } from 'next/server';

/**
 * Petal source types - all petal grants must specify a source
 */
export type PetalSource =
  | 'mini_game'
  | 'background_petal_click'
  | 'purchase_reward'
  | 'daily_login'
  | 'achievement'
  | 'admin_grant'
  | 'quest_reward'
  | 'soapstone_praise'
  | 'leaderboard_reward'
  | 'other';

/**
 * Petal grant rules per source
 * 
 * maxPerEvent: Maximum petals that can be granted in a single event
 * maxPerDay: Maximum petals that can be granted per day from this source (optional)
 * rateLimitWindowMs: Rate limit window in milliseconds (optional, defaults to 60000)
 * rateLimitMaxRequests: Max requests per window (optional)
 */
export const PETAL_RULES: Record<
  PetalSource,
  {
    maxPerEvent: number;
    maxPerDay?: number;
    rateLimitWindowMs?: number;
    rateLimitMaxRequests?: number;
  }
> = {
  mini_game: {
    maxPerEvent: 50,
    maxPerDay: 2000,
    rateLimitWindowMs: 60000, // 1 minute
    rateLimitMaxRequests: 10, // 10 game submissions per minute
  },
  background_petal_click: {
    maxPerEvent: 5, // Small amounts, easily spammable
    maxPerDay: 50, // Strict daily limit
    rateLimitWindowMs: 5000, // 5 seconds
    rateLimitMaxRequests: 3, // Max 3 clicks per 5 seconds
  },
  purchase_reward: {
    maxPerEvent: 200,
    maxPerDay: 5000,
    // No rate limit - purchases are naturally rate-limited by payment flow
  },
  daily_login: {
    maxPerEvent: 25,
    maxPerDay: 25, // Once per day
    rateLimitWindowMs: 86400000, // 24 hours
    rateLimitMaxRequests: 1,
  },
  achievement: {
    maxPerEvent: 100,
    maxPerDay: 3000,
    rateLimitWindowMs: 60000,
    rateLimitMaxRequests: 5, // Max 5 achievement unlocks per minute
  },
  admin_grant: {
    maxPerEvent: 1000,
    // No daily limit for admin grants
  },
  quest_reward: {
    maxPerEvent: 50,
    maxPerDay: 500,
    rateLimitWindowMs: 60000,
    rateLimitMaxRequests: 5,
  },
  soapstone_praise: {
    maxPerEvent: 10,
    maxPerDay: 100,
    rateLimitWindowMs: 60000,
    rateLimitMaxRequests: 10,
  },
  leaderboard_reward: {
    maxPerEvent: 100,
    maxPerDay: 500,
    rateLimitWindowMs: 60000,
    rateLimitMaxRequests: 5,
  },
  other: {
    maxPerEvent: 50,
    maxPerDay: 500,
    rateLimitWindowMs: 60000,
    rateLimitMaxRequests: 10,
  },
};

/**
 * Input for granting petals
 */
export interface GrantPetalsInput {
  userId?: string | null; // Handle guest users if supported
  amount: number;
  source: PetalSource;
  metadata?: Record<string, unknown>; // game id, score, etc.
  description?: string; // Human-readable description
  requestId?: string; // For tracing
  req?: NextRequest; // For rate limiting (IP-based for guests)
}

/**
 * Result of a petal grant attempt
 */
export interface GrantPetalsResult {
  success: boolean;
  granted: number; // Actual amount granted (may be less than requested due to caps)
  newBalance: number;
  lifetimeEarned: number;
  error?: string;
  errorCode?: 'VALIDATION_ERROR' | 'RATE_LIMITED' | 'DAILY_LIMIT_REACHED' | 'AUTH_REQUIRED' | 'INTERNAL_ERROR';
  limited?: boolean; // True if amount was capped by daily limit
  dailyRemaining?: number; // Remaining daily allowance for this source
}

/**
 * Maximum petals that can be granted in a single call (safety limit)
 */
const MAX_PETALS_PER_GRANT = 1000;

/**
 * Centralized function to grant petals
 * 
 * This function:
 * - Validates amount (finite, integer, within sane range)
 * - Guards against negative values
 * - Applies per-source rate limiting
 * - Enforces daily caps per source
 * - Uses a transaction to update balance + log record
 * - Returns detailed result for UI feedback
 */
export async function grantPetals(input: GrantPetalsInput): Promise<GrantPetalsResult> {
  const { userId, amount, source, metadata: _metadata, description, requestId, req } = input;
  // metadata is stored in PetalTransaction but not used in validation logic

  // Validation: amount must be finite, integer, positive, within max
  if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
    logger.warn('[Petals] Invalid amount', {
      userId: userId || 'guest',
      extra: { amount, source },
    });
    return {
      success: false,
      granted: 0,
      newBalance: 0,
      lifetimeEarned: 0,
      error: 'Invalid amount: must be a finite integer',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  if (amount <= 0) {
    logger.warn('[Petals] Negative or zero amount', {
      userId: userId || 'guest',
      extra: { amount, source },
    });
    return {
      success: false,
      granted: 0,
      newBalance: 0,
      lifetimeEarned: 0,
      error: 'Amount must be positive',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  if (amount > MAX_PETALS_PER_GRANT) {
    logger.warn('[Petals] Amount exceeds max per grant', {
      userId: userId || 'guest',
      extra: { amount, max: MAX_PETALS_PER_GRANT, source },
    });
    return {
      success: false,
      granted: 0,
      newBalance: 0,
      lifetimeEarned: 0,
      error: `Amount exceeds maximum of ${MAX_PETALS_PER_GRANT} petals per grant`,
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Get rules for this source
  const rules = PETAL_RULES[source];
  if (!rules) {
    logger.error('[Petals] Unknown source', {
      userId: userId || 'guest',
      extra: { source },
    }, undefined, new Error(`Unknown petal source: ${source}`));
    return {
      success: false,
      granted: 0,
      newBalance: 0,
      lifetimeEarned: 0,
      error: `Unknown petal source: ${source}`,
      errorCode: 'VALIDATION_ERROR',
    };
  }

  // Clamp amount to maxPerEvent
  const clampedAmount = Math.min(amount, rules.maxPerEvent);

  // Guest user handling
  if (!userId) {
    // For guests, only allow certain sources with lower limits
    const guestAllowedSources: PetalSource[] = ['background_petal_click', 'mini_game'];
    if (!guestAllowedSources.includes(source)) {
      return {
        success: false,
        granted: 0,
        newBalance: 0,
        lifetimeEarned: 0,
        error: 'Authentication required for this petal source',
        errorCode: 'AUTH_REQUIRED',
      };
    }

    // Guests use localStorage - return success but don't write to DB
    // Client will handle localStorage updates
    return {
      success: true,
      granted: clampedAmount,
      newBalance: 0, // Client will track this
      lifetimeEarned: 0,
    };
  }

  // Rate limiting for authenticated users
  if (rules.rateLimitWindowMs && rules.rateLimitMaxRequests && req) {
    const identifier = getClientIdentifier(req, userId);
    const rateLimitResult = await checkRateLimit(
      `PETAL_GRANT_${source.toUpperCase()}`,
      identifier,
      {
        windowMs: rules.rateLimitWindowMs,
        maxRequests: rules.rateLimitMaxRequests,
        message: `Rate limit exceeded for ${source}. Please wait.`,
      },
    );

    if (!rateLimitResult.success) {
      logger.warn('[Petals] Rate limited', {
        userId,
        extra: { source, identifier },
      });
      return {
        success: false,
        granted: 0,
        newBalance: 0,
        lifetimeEarned: 0,
        error: rateLimitResult.message || 'Rate limit exceeded',
        errorCode: 'RATE_LIMITED',
      };
    }
  }

  try {
    // Check daily limit if defined
    let finalAmount = clampedAmount;
    let dailyRemaining: number | undefined;

    if (rules.maxPerDay) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's earnings for this source
      const todayEarnings = await db.petalTransaction.aggregate({
        where: {
          userId,
          source,
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: { amount: true },
      });

      const earnedToday = todayEarnings._sum.amount || 0;
      dailyRemaining = Math.max(0, rules.maxPerDay - earnedToday);

      if (earnedToday >= rules.maxPerDay) {
        // Daily limit reached - return no-op success
        const wallet = await db.petalWallet.findUnique({
          where: { userId },
          select: { balance: true, lifetimeEarned: true },
        });

        return {
          success: true,
          granted: 0,
          newBalance: wallet?.balance || 0,
          lifetimeEarned: wallet?.lifetimeEarned || 0,
          limited: true,
          dailyRemaining: 0,
        };
      }

      // Clamp to remaining daily allowance
      finalAmount = Math.min(finalAmount, dailyRemaining);
    }

    // Use transaction to update balance + log record
    const result = await db.$transaction(async (tx) => {
      // Upsert PetalWallet (primary storage)
      const wallet = await tx.petalWallet.upsert({
        where: { userId },
        create: {
          userId,
          balance: finalAmount,
          lifetimeEarned: finalAmount,
          lastCollectedAt: new Date(),
        },
        update: {
          balance: { increment: finalAmount },
          lifetimeEarned: { increment: finalAmount },
          lastCollectedAt: new Date(),
        },
      });

      // Create PetalTransaction record for audit trail
      // Note: metadata is not stored in PetalTransaction model, only in PetalLedger
      await tx.petalTransaction.create({
        data: {
          userId,
          amount: finalAmount,
          source,
          description: description || `Granted ${finalAmount} petals from ${source}`,
        },
      });

      // Create PetalLedger entry for lifetime tracking
      // Note: PetalLedger doesn't have a metadata field, but reason can include context
      await tx.petalLedger.create({
        data: {
          id: `petal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId,
          type: 'earn',
          amount: finalAmount,
          reason: description || source,
        },
      });

      // Sync User.petalBalance for backward compatibility
      await tx.user.updateMany({
        where: { clerkId: userId },
        data: {
          petalBalance: wallet.balance,
        },
      });

      return {
        balance: wallet.balance,
        lifetimeEarned: wallet.lifetimeEarned,
      };
    });

    // Log successful grant (without sensitive data)
    logger.info('[Petals] Granted successfully', {
      userId: userId.substring(0, 8) + '...', // Partial ID for logging
      requestId,
      extra: { source, amount: finalAmount },
    });

    return {
      success: true,
      granted: finalAmount,
      newBalance: result.balance,
      lifetimeEarned: result.lifetimeEarned,
      limited: finalAmount < clampedAmount,
      dailyRemaining,
    };
  } catch (error) {
    // Log error without leaking sensitive data
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('[Petals] Grant failed', {
      userId: userId ? userId.substring(0, 8) + '...' : 'guest',
      requestId,
    }, new Error(`Grant failed: source=${source}, error=${errorMessage}`));

    return {
      success: false,
      granted: 0,
      newBalance: 0,
      lifetimeEarned: 0,
      error: 'Internal error granting petals',
      errorCode: 'INTERNAL_ERROR',
    };
  }
}

