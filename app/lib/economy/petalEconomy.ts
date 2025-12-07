// Petal Economy System
// Centralized economy management for all mini-games

export interface PetalTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'earn' | 'spend' | 'bonus' | 'daily' | 'achievement';
  source: string; // game name, achievement id, etc.
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  }

export interface DailyModifier {
  id: string;
  game: string;
  multiplier: number;
  description: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
  }

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  game: string;
  mode?: string;
  timestamp: Date;
  rank: number;
  }

export interface PetalBalance {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: Date;
  }

class PetalEconomy {
  private transactions: PetalTransaction[] = [];
  private dailyModifiers: DailyModifier[] = [];
  private leaderboards: Map<string, LeaderboardEntry[]> = new Map();

  constructor() {
    this.initializeDailyModifiers();
  }

  // Initialize daily modifiers
  private initializeDailyModifiers() {
    const today = new Date();
    const games = ['petal-samurai', 'puzzle-reveal', 'bubble-girl', 'memory-match'];

    // Rotate daily modifiers
    const dayOfWeek = today.getDay();
    const gameIndex = dayOfWeek % games.length;

    const selectedGame = games[gameIndex];
    if (selectedGame) {
      this.dailyModifiers = [
        {
          id: 'daily_boost',
          game: selectedGame,
          multiplier: 1.5,
          description: `+50% petals in ${selectedGame.replace('-', ' ')} today!`,
          startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          active: true,
        },
      ];
    }
  }

  // Calculate petal earnings with modifiers
  calculateEarnings(baseAmount: number, game: string, userId: string): number {
    let finalAmount = baseAmount;

    // Apply daily modifier
    const modifier = this.dailyModifiers.find((m) => m.game === game && m.active);
    if (modifier) {
      finalAmount = Math.floor(finalAmount * modifier.multiplier);
    }

    // Apply streak bonus (consecutive days playing)
    const streakBonus = this.getStreakBonus(userId);
    if (streakBonus > 1) {
      finalAmount = Math.floor(finalAmount * streakBonus);
    }

    return finalAmount;
  }

  // Get streak bonus for consecutive days
  private getStreakBonus(userId: string): number {
    const userTransactions = this.transactions.filter((t) => t.userId === userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      const hasPlayed = userTransactions.some((t) => {
        const tDate = new Date(t.timestamp);
        tDate.setHours(0, 0, 0, 0);
        return tDate.getTime() === checkDate.getTime() && t.type === 'earn';
      });

      if (hasPlayed) {
        streak++;
      } else {
        break;
      }
    }

    // Streak bonus: 1.1x for 2 days, 1.2x for 3 days, etc.
    return Math.min(1 + (streak - 1) * 0.1, 2.0);
  }

  // Record a petal transaction
  recordTransaction(transaction: Omit<PetalTransaction, 'id' | 'timestamp'>): PetalTransaction {
    const newTransaction: PetalTransaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.transactions.push(newTransaction);
    return newTransaction;
  }

  // Get user's petal balance
  getBalance(userId: string): PetalBalance {
    const userTransactions = this.transactions.filter((t) => t.userId === userId);

    const totalEarned = userTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = Math.abs(
      userTransactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0),
    );

    return {
      userId,
      balance: totalEarned - totalSpent,
      totalEarned,
      totalSpent,
      lastUpdated: new Date(),
    };
  }

  // Submit a game score and earn petals
  submitScore(userId: string, game: string, score: number, mode?: string): PetalTransaction {
    // Base petal calculation
    let baseAmount = Math.floor(score / 100); // 1 petal per 100 points

    // Game-specific bonuses
    switch (game) {
      case 'petal-samurai':
        baseAmount += Math.floor(score / 1000) * 5; // Bonus for high scores
        break;
      case 'memory-match':
        baseAmount += mode === 'challenge' ? 10 : 5; // Time bonus
        break;
      case 'bubble-girl':
        baseAmount += mode === 'challenge' ? 15 : 8; // Survival bonus
        break;
      case 'puzzle-reveal':
        baseAmount += Math.floor(score / 500) * 3; // Completion bonus
        break;
    }

    // Apply modifiers
    const finalAmount = this.calculateEarnings(baseAmount, game, userId);

    // Record transaction
    return this.recordTransaction({
      userId,
      amount: finalAmount,
      type: 'earn',
      source: game,
      description: `Earned from ${game}${mode ? ` (${mode})` : ''}`,
      metadata: { score, mode, baseAmount, finalAmount },
    });
  }

  // Update leaderboard
  updateLeaderboard(
    userId: string,
    userName: string,
    score: number,
    game: string,
    mode?: string,
  ): void {
    const entry: any = {
      userId,
      userName,
      score,
      game,
      timestamp: new Date(),
      rank: 0, // Will be calculated
    };
    if (mode !== undefined) entry.mode = mode;

    const gameLeaderboard = this.leaderboards.get(game) || [];
    gameLeaderboard.push(entry);

    // Sort by score (descending) and update ranks
    gameLeaderboard.sort((a, b) => b.score - a.score);
    gameLeaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Keep only top 100 entries
    this.leaderboards.set(game, gameLeaderboard.slice(0, 100));
  }

  // Get leaderboard for a game
  getLeaderboard(game: string, limit: number = 10): LeaderboardEntry[] {
    const gameLeaderboard = this.leaderboards.get(game) || [];
    return gameLeaderboard.slice(0, limit);
  }

  // Get daily modifiers
  getDailyModifiers(): DailyModifier[] {
    return this.dailyModifiers.filter((m) => m.active);
  }

  // Get user's transaction history
  getTransactionHistory(userId: string, limit: number = 50): PetalTransaction[] {
    return this.transactions
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Spend petals
  spendPetals(
    userId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>,
  ): boolean {
    const balance = this.getBalance(userId);

    if (balance.balance < amount) {
      return false; // Insufficient funds
    }

    this.recordTransaction({
      userId,
      amount: -amount,
      type: 'spend',
      source: 'purchase',
      description: reason,
      ...(metadata && { metadata }),
    });

    return true;
  }

  // Award achievement bonus
  awardAchievement(
    userId: string,
    achievementId: string,
    petals: number,
    items?: string[],
  ): PetalTransaction {
    return this.recordTransaction({
      userId,
      amount: petals,
      type: 'achievement',
      source: achievementId,
      description: `Achievement reward: ${achievementId}`,
      metadata: { items },
    });
  }

  // Get economy statistics
  getEconomyStats(): {
    totalTransactions: number;
    totalPetalsEarned: number;
    totalPetalsSpent: number;
    activeUsers: number;
    topGames: Array<{ game: string; totalEarned: number }>;
  } {
    const totalTransactions = this.transactions.length;
    const totalPetalsEarned = this.transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalPetalsSpent = Math.abs(
      this.transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0),
    );

    const activeUsers = new Set(this.transactions.map((t) => t.userId)).size;

    const gameStats = new Map<string, number>();
    this.transactions
      .filter((t) => t.amount > 0 && t.type === 'earn')
      .forEach((t) => {
        const current = gameStats.get(t.source) || 0;
        gameStats.set(t.source, current + t.amount);
      });

    const topGames = Array.from(gameStats.entries())
      .map(([game, totalEarned]) => ({ game, totalEarned }))
      .sort((a, b) => b.totalEarned - a.totalEarned)
      .slice(0, 5);

    return {
      totalTransactions,
      totalPetalsEarned,
      totalPetalsSpent,
      activeUsers,
      topGames,
    };
  }
}

// Export singleton instance
export const petalEconomy = new PetalEconomy();
