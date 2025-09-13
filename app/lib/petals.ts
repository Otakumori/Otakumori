import { db } from '@/lib/db';
import { logger } from '@/app/lib/logger';
import { type PetalTransaction, PetalTransactionSchema } from '@/app/lib/contracts';

export interface PetalReward {
  type: PetalTransaction['type'];
  amount: number;
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface PetalBalance {
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastDailyReward?: Date;
  nextDailyReward?: Date;
}

export class PetalService {
  /**
   * Award petals to a user
   */
  async awardPetals(
    userId: string,
    reward: PetalReward,
    requestId?: string,
  ): Promise<{ success: boolean; awarded: number; newBalance: number; error?: string }> {
    try {
      // Validate the reward data
      const validatedReward = PetalTransactionSchema.parse({
        type: reward.type,
        amount: reward.amount,
        reason: reward.reason,
      });

      // Use a transaction to ensure data consistency
      const result = await db.$transaction(async (tx) => {
        // Create the petal ledger entry
        const ledgerEntry = await tx.petalLedger.create({
          data: {
            id: `petal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId,
            type: validatedReward.type,
            amount: validatedReward.amount,
            reason: validatedReward.reason,
          },
        });

        // Update user's petal balance
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            petalBalance: {
              increment: validatedReward.amount,
            },
          },
          select: { petalBalance: true },
        });

        return {
          ledgerEntry,
          newBalance: updatedUser.petalBalance,
        };
      });

      logger.info('Petals awarded successfully', {
        requestId,
        userId,
        extra: {
          reward: validatedReward,
          newBalance: result.newBalance,
        },
      });

      return {
        success: true,
        awarded: validatedReward.amount,
        newBalance: result.newBalance,
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

      return {
        success: false,
        awarded: 0,
        newBalance: 0,
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
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    try {
      if (amount <= 0) {
        return {
          success: false,
          newBalance: 0,
          error: 'Amount must be positive',
        };
      }

      // Use a transaction to ensure data consistency
      const result = await db.$transaction(async (tx) => {
        // Check current balance
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { petalBalance: true },
        });

        if (!user) {
          throw new Error('User not found');
        }

        if (user.petalBalance < amount) {
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

        // Update user's petal balance
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            petalBalance: {
              decrement: amount,
            },
          },
          select: { petalBalance: true },
        });

        return {
          ledgerEntry,
          newBalance: updatedUser.petalBalance,
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

      return {
        success: false,
        newBalance: 0,
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
   */
  async getUserPetalInfo(
    userId: string,
    requestId?: string,
  ): Promise<{ success: boolean; data?: PetalBalance; error?: string }> {
    try {
      const [user, transactions] = await Promise.all([
        db.user.findUnique({
          where: { id: userId },
          select: { petalBalance: true },
        }),
        db.petalLedger.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 50, // Last 50 transactions
        }),
      ]);

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      // Calculate totals
      const totalEarned = transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

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
        balance: user.petalBalance,
        totalEarned,
        totalSpent,
        lastDailyReward,
        nextDailyReward,
      };

      logger.debug('Petal info retrieved', {
        requestId,
        userId,
        extra: {
          balance: user.petalBalance,
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
