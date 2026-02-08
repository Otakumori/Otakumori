/**
 * Style/Mastery Meter System
 * Tracks player performance and assigns ranks (D to S)
 */
export type StyleRank = 'D' | 'C' | 'B' | 'A' | 'S';

export class StyleMeter {
  private points: number = 0;
  private rank: StyleRank = 'D';
  private decayRate: number = 0.5; // Points per second
  private lastUpdate: number = Date.now();

  // Rank thresholds
  private readonly RANK_THRESHOLDS = {
    D: 0,
    C: 50,
    B: 100,
    A: 200,
    S: 400,
  } as const;

  // Score multipliers per rank
  private readonly RANK_MULTIPLIERS = {
    D: 1.0,
    C: 1.2,
    B: 1.5,
    A: 2.0,
    S: 3.0,
  } as const;

  reset() {
    this.points = 0;
    this.rank = 'D';
    this.lastUpdate = Date.now();
  }

  addPoints(amount: number) {
    this.points = Math.max(0, this.points + amount);
    this.updateRank();
    this.lastUpdate = Date.now();
  }

  addPenalty(amount: number) {
    this.points = Math.max(0, this.points - amount);
    this.updateRank();
    this.lastUpdate = Date.now();
  }

  update(deltaTime: number) {
    // Decay points over time
    const decay = this.decayRate * deltaTime;
    this.points = Math.max(0, this.points - decay);
    this.updateRank();
  }

  private updateRank() {
    if (this.points >= this.RANK_THRESHOLDS.S) {
      this.rank = 'S';
    } else if (this.points >= this.RANK_THRESHOLDS.A) {
      this.rank = 'A';
    } else if (this.points >= this.RANK_THRESHOLDS.B) {
      this.rank = 'B';
    } else if (this.points >= this.RANK_THRESHOLDS.C) {
      this.rank = 'C';
    } else {
      this.rank = 'D';
    }
  }

  getRank(): StyleRank {
    return this.rank;
  }

  getPoints(): number {
    return this.points;
  }

  getMultiplier(): number {
    return this.RANK_MULTIPLIERS[this.rank];
  }

  getProgress(): number {
    // Progress to next rank (0-1)
    const currentThreshold = this.RANK_THRESHOLDS[this.rank];
    let nextThreshold: number;
    
    switch (this.rank) {
      case 'D':
        nextThreshold = this.RANK_THRESHOLDS.C;
        break;
      case 'C':
        nextThreshold = this.RANK_THRESHOLDS.B;
        break;
      case 'B':
        nextThreshold = this.RANK_THRESHOLDS.A;
        break;
      case 'A':
        nextThreshold = this.RANK_THRESHOLDS.S;
        break;
      case 'S':
        return 1.0; // Max rank
    }
    
    const range = nextThreshold - currentThreshold;
    const progress = (this.points - currentThreshold) / range;
    return Math.max(0, Math.min(1, progress));
  }
}

