import { db } from '@/lib/db';
import { logger } from '@/app/lib/logger';
import { type PetalTransaction, PetalTransactionSchema } from '@/app/lib/contracts';

/**
 * Petal System Architecture Summary
 * 
 * IMPLEMENTATION STATUS: Phase 4-6 Complete
 * 
 * ARCHITECTURE:
 * - PetalWallet is primary storage for authenticated users (has lifetimeEarned field)
 * - User.petalBalance kept in sync for backward compatibility
 * - PetalService centralizes all earn/spend operations with lifetime tracking
 * 
 * LIFETIME TRACKING:
 * - On earn: balance += earned, lifetimeEarned += earned
 * - On spend: balance -= spent, lifetimeEarned unchanged
 * - PetalWallet.lifetimeEarned is the source of truth for lifetime stats
 * 
 * DAILY LIMITS:
 * - Game earnings: 2000 petals/day
 * - Achievement earnings: 3000 petals/day
 * - Daily bonus: 100 petals/day
 * - Purchase bonus: 5000 petals/day
 * - Guests: 500 petals/day (client-side localStorage)
 * 
 * ACHIEVEMENTS:
 * - /api/v1/achievements/unlock uses PetalService for petal rewards
 * - Achievements award petals via same service (respects daily limits)
 * - Petal rewards granted only once per achievement per user
 * 
 * GUEST BEHAVIOR:
 * - Guests use localStorage for ephemeral petal tracking
 * - No DB writes for guests
 * - PetalHUD shows "Sign in to save your petals" for guests
 */

export interface PetalReward {
  type: PetalTransaction['type'];
  amount: number;
  reason: string;
  metadata?: Record<string, unknown>;
  source?: 'game' | 'achievement' | 'daily_bonus' | 'purchase_bonus' | 'other';
}

export interface PetalBalance {
  balance: number;
  lifetimePetalsEarned: number; // Renamed from totalEarned for clarity
  totalSpent: number;
  lastDailyReward?: Date;
  nextDailyReward?: Date;
}

// Daily earning limits (per authenticated user)
const DAILY_LIMITS = {
  game: 2000, // Max petals from games per day
  achievement: 3000, // Max petals from achievements per day
  daily_bonus: 100, // Daily login bonus (separate limit)
  purchase_bonus: 5000, // Purchase bonuses (generous limit)
  other: 500, // Other sources
} as const;

export class PetalService {
  /**
   * Check daily earning limits for a user
   * Returns whether the amount is allowed and any adjusted amount if capped
   */
  private async checkDailyLimit(
    userId: string,
    amount: number,
    source: PetalReward['source'],
  ): Promise<{
    allowed: boolean;
    adjustedAmount?: number;
    currentBalance?: number;
    currentLifetime?: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get current wallet state
      const wallet = await db.petalWallet.findUnique({
        where: { userId },
      });

      const currentBalance = wallet?.balance || 0;
      const currentLifetime = wallet?.lifetimeEarned || 0;

      // Get today's earnings by source type
      const todayEarnings = await db.petalLedger.aggregate({
        where: {
          userId,
          type: 'earn',
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
        _sum: { amount: true },
      });

      const earnedToday = todayEarnings._sum.amount || 0;

      // Determine limit based on source
      const limit = source === 'game' 
        ? DAILY_LIMITS.game 
        : source === 'achievement'
        ? DAILY_LIMITS.achievement
        : source === 'daily_bonus'
        ? DAILY_LIMITS.daily_bonus
        : source === 'purchase_bonus'
        ? DAILY_LIMITS.purchase_bonus
        : DAILY_LIMITS.other;

      // Check if adding this amount would exceed the limit
      if (earnedToday + amount > limit) {
        const remaining = Math.max(0, limit - earnedToday);
        return {
          allowed: remaining > 0,
          adjustedAmount: remaining,
          currentBalance,
          currentLifetime,
        };
      }

      return {
        allowed: true,
        adjustedAmount: amount,
        currentBalance,
        currentLifetime,
      };
    } catch (error) {
      // On error, allow the transaction (fail open for safety)
      logger.error('Failed to check daily limit', { userId, extra: { source } }, error as Error);
      return {
        allowed: true,
        adjustedAmount: amount,
      };
    }
  }

  /**
   * Award petals to a user
   * Updates both PetalWallet (with lifetimeEarned) and User.petalBalance (for backward compatibility)
   */
  async awardPetals(
    userId: string,
    reward: PetalReward,
    requestId?: string,
  ): Promise<{ success: boolean; awarded: number; newBalance: number; lifetimePetalsEarned: number; error?: string; dailyCapReached?: boolean }> {
    try {
      // Validate the reward data
      const validatedReward = PetalTransactionSchema.parse({
        type: reward.type,
        amount: reward.amount,
        reason: reward.reason,
      });

      // Check daily limits (for authenticated users only)
      const source = reward.source || 'other';
      const dailyLimitResult = await this.checkDailyLimit(userId, validatedReward.amount, source);
      if (!dailyLimitResult.allowed) {
        return {
          success: false,
          awarded: 0,
          newBalance: dailyLimitResult.currentBalance || 0,
          lifetimePetalsEarned: dailyLimitResult.currentLifetime || 0,
          error: 'Daily earning limit reached',
          dailyCapReached: true,
        };
      }

      const amountToAward = dailyLimitResult.adjustedAmount || validatedReward.amount;

      // Use a transaction to ensure data consistency
      const result = await db.$transaction(async (tx) => {
        // Upsert PetalWallet (primary storage with lifetimeEarned)
        const wallet = await tx.petalWallet.upsert({
          where: { userId },
          create: {
            userId,
            balance: amountToAward,
            lifetimeEarned: amountToAward,
            lastCollectedAt: new Date(),
          },
          update: {
            balance: { increment: amountToAward },
            lifetimeEarned: { increment: amountToAward }, // Always increment lifetime on earn
            lastCollectedAt: new Date(),
          },
        });

        // Create the petal ledger entry
        const ledgerEntry = await tx.petalLedger.create({
          data: {
            id: `petal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            type: validatedReward.type,
            amount: amountToAward,
            reason: validatedReward.reason,
          },
        });

        // Update User.petalBalance for backward compatibility
        await tx.user.update({
          where: { id: userId },
          data: {
            petalBalance: {
              increment: amountToAward,
            },
          },
        });

        return {
          ledgerEntry,
          wallet,
          newBalance: wallet.balance,
          lifetimePetalsEarned: wallet.lifetimeEarned,
        };
      });

      logger.info('Petals awarded successfully', {
        requestId,
        userId,
        extra: {
          reward: validatedReward,
          newBalance: result.newBalance,
          lifetimePetalsEarned: result.lifetimePetalsEarned,
          source: source,
        },
      });

      return {
        success: true,
        awarded: amountToAward,
        newBalance: result.newBalance,
        lifetimePetalsEarned: result.lifetimePetalsEarned,
        dailyCapReached: dailyLimitResult.adjustedAmount !== validatedReward.amount,
      };
    } catch (error) {
      logger.error(
        'Failed to award petals',
        {
          requestId,
          userId,
          extra: { reward },
        },
        error as Error,
      );

      // Try to get wallet for lifetime info even on error
      let lifetimePetalsEarned = 0;
      try {
        const wallet = await db.petalWallet.findUnique({
          where: { userId },
          select: { lifetimeEarned: true },
        });
        lifetimePetalsEarned = wallet?.lifetimeEarned || 0;
      } catch {
        // Ignore error fetching wallet
      }

      return {
        success: false,
        awarded: 0,
        newBalance: 0,
        lifetimePetalsEarned,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Spend petals from a user's balance
   */
  async spendPetals(
    userId: string,
    amount: number,
    reason: string,
    requestId?: string,
  ): Promise<{ success: boolean; newBalance: number; lifetimePetalsEarned: number; error?: string }> {
    try {
      if (amount <= 0) {
        // Try to get wallet for lifetime info
        let lifetimePetalsEarned = 0;
        try {
          const wallet = await db.petalWallet.findUnique({
            where: { userId },
            select: { lifetimeEarned: true },
          });
          lifetimePetalsEarned = wallet?.lifetimeEarned || 0;
        } catch {
          // Ignore error
        }

        return {
          success: false,
          newBalance: 0,
          lifetimePetalsEarned,
          error: 'Amount must be positive',
        };
      }

      // Use a transaction to ensure data consistency
      const result = await db.$transaction(async (tx) => {
        // Check PetalWallet balance (primary source)
        const wallet = await tx.petalWallet.findUnique({
          where: { userId },
        });

        if (!wallet) {
          throw new Error('User wallet not found');
        }

        if (wallet.balance < amount) {
          throw new Error('Insufficient petal balance');
        }

        // Create the petal ledger entry (negative amount for spending)
        const ledgerEntry = await tx.petalLedger.create({
          data: {
            id: `petal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            type: 'spend',
            amount: -amount, // Negative amount for spending
            reason,
          },
        });

        // Update PetalWallet (balance decreases, lifetimeEarned stays the same)
        const updatedWallet = await tx.petalWallet.update({
          where: { userId },
          data: {
            balance: { decrement: amount },
            // lifetimeEarned does NOT change on spend
          },
        });

        // Update User.petalBalance for backward compatibility
        await tx.user.update({
          where: { id: userId },
          data: {
            petalBalance: { decrement: amount },
          },
        });

        return {
          ledgerEntry,
          wallet: updatedWallet,
          newBalance: updatedWallet.balance,
        };
      });

      logger.info('Petals spent successfully', {
        requestId,
        userId,
        extra: {
          amount,
          reason,
          newBalance: result.newBalance,
        },
      });

      return {
        success: true,
        newBalance: result.newBalance,
        lifetimePetalsEarned: result.wallet.lifetimeEarned,
      };
    } catch (error) {
      logger.error(
        'Failed to spend petals',
        {
          requestId,
          userId,
          extra: {
            amount,
            reason,
          },
        },
        error as Error,
      );

      // Try to get wallet for lifetime info even on error
      let lifetimePetalsEarned = 0;
      try {
        const wallet = await db.petalWallet.findUnique({
          where: { userId },
          select: { lifetimeEarned: true },
        });
        lifetimePetalsEarned = wallet?.lifetimeEarned || 0;
      } catch {
        // Ignore error fetching wallet
      }

      return {
        success: false,
        newBalance: 0,
        lifetimePetalsEarned,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Award daily login bonus (once per day)
   */
  async awardDailyLoginBonus(
    userId: string,
    requestId?: string,
  ): Promise<{ success: boolean; awarded: number; newBalance: number; error?: string }> {
    try {
      const result = await db.$transaction(async (tx) => {
        // Check if user already received daily reward today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingReward = await tx.petalLedger.findFirst({
          where: {
            userId,
            type: 'earn',
            reason: 'Daily login bonus',
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          },
        });

        if (existingReward) {
          throw new Error('Daily login bonus already awarded today');
        }

        // Award daily bonus (5 petals)
        const dailyAmount = 5;
        const reward = await this.awardPetals(
          userId,
          {
            type: 'earn',
            amount: dailyAmount,
            reason: 'Daily login bonus',
            source: 'daily_bonus',
            metadata: {
              date: today.toISOString(),
              streak: 1, // TODO: Implement streak tracking
            },
          },
          requestId,
        );

        if (!reward.success) {
          throw new Error(reward.error || 'Failed to award daily bonus');
        }

        return {
          awarded: dailyAmount,
          newBalance: reward.newBalance,
        };
      });

      logger.info('Daily login bonus awarded', {
        requestId,
        userId,
        extra: {
          awarded: result.awarded,
          newBalance: result.newBalance,
        },
      });

      return {
        success: true,
        awarded: result.awarded,
        newBalance: result.newBalance,
      };
    } catch (error) {
      logger.error(
        'Failed to award daily login bonus',
        {
          requestId,
          userId,
        },
        error as Error,
      );

      return {
        success: false,
        awarded: 0,
        newBalance: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Award purchase bonus based on order amount
   */
  async awardPurchaseBonus(
    userId: string,
    orderId: string,
    orderAmount: number,
    requestId?: string,
  ): Promise<{ success: boolean; awarded: number; newBalance: number; error?: string }> {
    try {
      // Calculate bonus: 1 petal per $10 spent, minimum 1 petal
      const bonusAmount = Math.max(1, Math.floor(orderAmount / 1000)); // orderAmount is in cents

      const reward = await this.awardPetals(
        userId,
        {
          type: 'purchase_bonus',
          amount: bonusAmount,
          reason: `Purchase bonus for order ${orderId}`,
          source: 'purchase_bonus',
          metadata: {
            orderId,
            orderAmount,
            bonusRate: '1 petal per $10',
          },
        },
        requestId,
      );

      if (!reward.success) {
        return reward;
      }

      logger.info('Purchase bonus awarded', {
        requestId,
        userId,
        extra: {
          orderId,
          orderAmount,
          awarded: bonusAmount,
          newBalance: reward.newBalance,
        },
      });

      return {
        success: true,
        awarded: bonusAmount,
        newBalance: reward.newBalance,
      };
    } catch (error) {
      logger.error(
        'Failed to award purchase bonus',
        {
          requestId,
          userId,
          extra: {
            orderId,
            orderAmount,
          },
        },
        error as Error,
      );

      return {
        success: false,
        awarded: 0,
        newBalance: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get user's petal balance and transaction history
   * Uses PetalWallet as primary source (has lifetimeEarned)
   */
  async getUserPetalInfo(
    userId: string,
    requestId?: string,
  ): Promise<{ success: boolean; data?: PetalBalance; error?: string }> {
    try {
      const [wallet, transactions] = await Promise.all([
        db.petalWallet.findUnique({
          where: { userId },
        }),
        db.petalLedger.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50, // Last 50 transactions
        }),
      ]);

      if (!wallet) {
        // Create wallet if it doesn't exist
        await db.petalWallet.create({
          data: {
            userId,
            balance: 0,
            lifetimeEarned: 0,
          },
        });
        
        return {
          success: true,
          data: {
            balance: 0,
            lifetimePetalsEarned: 0,
            totalSpent: 0,
          },
        };
      }

      // Calculate total spent from transactions
      const totalSpent = transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Find last daily reward
      const lastDailyReward = transactions.find(
        (t) => t.type === 'earn' && t.reason === 'Daily login bonus',
      )?.createdAt;

      // Calculate next daily reward (24 hours from last reward)
      const nextDailyReward = lastDailyReward
        ? new Date(lastDailyReward.getTime() + 24 * 60 * 60 * 1000)
        : undefined;

      const petalInfo: PetalBalance = {
        balance: wallet.balance,
        lifetimePetalsEarned: wallet.lifetimeEarned, // Use stored lifetime from PetalWallet
        totalSpent,
      };
      if (lastDailyReward !== undefined) petalInfo.lastDailyReward = lastDailyReward;
      if (nextDailyReward !== undefined) petalInfo.nextDailyReward = nextDailyReward;

      logger.debug('Petal info retrieved', {
        requestId,
        userId,
        extra: {
          balance: wallet.balance,
          lifetimePetalsEarned: wallet.lifetimeEarned,
        },
      });

      return {
        success: true,
        data: petalInfo,
      };
    } catch (error) {
      logger.error(
        'Failed to get petal info',
        {
          requestId,
          userId,
        },
        error as Error,
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get petal transaction history for a user
   */
  async getUserPetalHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    requestId?: string,
  ): Promise<{
    success: boolean;
    data?: { transactions: PetalTransaction[]; total: number; page: number; limit: number };
    error?: string;
  }> {
    try {
      const offset = (page - 1) * limit;

      const [transactions, total] = await Promise.all([
        db.petalLedger.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
        }),
        db.petalLedger.count({
          where: { userId },
        }),
      ]);

      const formattedTransactions: PetalTransaction[] = transactions.map((t) => ({
        id: t.id,
        userId: t.userId,
        guestSessionId: t.guestSessionId,
        type: t.type,
        amount: t.amount,
        reason: t.reason,
        createdAt: t.createdAt,
      }));

      logger.debug('Petal history retrieved', {
        requestId,
        userId,
        extra: {
          page,
          limit,
          total,
        },
      });

      return {
        success: true,
        data: {
          transactions: formattedTransactions,
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      logger.error(
        'Failed to get petal history',
        {
          requestId,
          userId,
          extra: {
            page,
            limit,
          },
        },
        error as Error,
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const petalService = new PetalService();
