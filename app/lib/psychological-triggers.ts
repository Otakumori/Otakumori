/**
 * Psychological Triggers System
 *
 * Implements psychological principles to enhance user engagement
 * and conversion rates.
 */

export interface ScarcityConfig {
  stock: number;
  timeLimit: number;
  exclusivity: string;
}

export interface SocialProofConfig {
  reviews: number;
  rating: number;
  testimonials: string[];
  communitySize: number;
}

export interface LossAversionConfig {
  cartAbandonment: boolean;
  limitedTime: boolean;
  exclusiveAccess: boolean;
}

export class PsychologicalTriggersSystem {
  private static instance: PsychologicalTriggersSystem;
  private userBehavior: Map<string, any> = new Map();

  static getInstance(): PsychologicalTriggersSystem {
    if (!PsychologicalTriggersSystem.instance) {
      PsychologicalTriggersSystem.instance = new PsychologicalTriggersSystem();
    }
    return PsychologicalTriggersSystem.instance;
  }

  /**
   * Scarcity trigger
   */
  createScarcity(config: ScarcityConfig): {
    stockMessage: string;
    timeMessage: string;
    exclusivityMessage: string;
  } {
    const stockMessage =
      config.stock <= 3 ? `Only ${config.stock} left in stock!` : `${config.stock} available`;

    const timeMessage =
      config.timeLimit > 0
        ? `Limited time offer - ${Math.ceil(config.timeLimit / 3600000)} hours left!`
        : '';

    const exclusivityMessage = config.exclusivity ? `${config.exclusivity} only` : '';

    return {
      stockMessage,
      timeMessage,
      exclusivityMessage,
    };
  }

  /**
   * Social proof trigger
   */
  createSocialProof(config: SocialProofConfig): {
    reviewMessage: string;
    testimonialMessage: string;
    communityMessage: string;
  } {
    const reviewMessage = `${config.rating}/5 from ${config.reviews.toLocaleString()} travelers`;

    const testimonialMessage =
      config.testimonials.length > 0
        ? `"${config.testimonials[Math.floor(Math.random() * config.testimonials.length)]}"`
        : '';

    const communityMessage = `Join ${config.communitySize.toLocaleString()}+ active travelers`;

    return {
      reviewMessage,
      testimonialMessage,
      communityMessage,
    };
  }

  /**
   * Loss aversion trigger
   */
  createLossAversion(config: LossAversionConfig): {
    cartMessage: string;
    timeMessage: string;
    accessMessage: string;
  } {
    const cartMessage = config.cartAbandonment
      ? "Don't lose your precious items - complete your order now!"
      : '';

    const timeMessage = config.limitedTime ? 'This offer expires soon - secure your spot!' : '';

    const accessMessage = config.exclusiveAccess
      ? "You'll lose access to exclusive content if you don't act now!"
      : '';

    return {
      cartMessage,
      timeMessage,
      accessMessage,
    };
  }

  /**
   * Progress bar for gamification
   */
  createProgressBar(
    current: number,
    total: number,
    label: string,
  ): {
    percentage: number;
    message: string;
    color: string;
  } {
    const percentage = Math.min(100, (current / total) * 100);

    let message = '';
    let color = '#10b981'; // green

    if (percentage < 25) {
      message = `Just getting started! ${current}/${total} ${label}`;
      color = '#ef4444'; // red
    } else if (percentage < 50) {
      message = `Making progress! ${current}/${total} ${label}`;
      color = '#f59e0b'; // yellow
    } else if (percentage < 75) {
      message = `Almost there! ${current}/${total} ${label}`;
      color = '#3b82f6'; // blue
    } else if (percentage < 100) {
      message = `So close! ${current}/${total} ${label}`;
      color = '#8b5cf6'; // purple
    } else {
      message = `Complete! ${total} ${label} achieved!`;
      color = '#10b981'; // green
    }

    return {
      percentage,
      message,
      color,
    };
  }

  /**
   * Achievement unlock
   */
  createAchievementUnlock(
    achievement: string,
    description: string,
  ): {
    title: string;
    description: string;
    celebration: string;
  } {
    const celebrations = [
      '🎉 Congratulations!',
      '🏆 Achievement unlocked!',
      '✨ Amazing work!',
      '🌟 You did it!',
      '🎊 Fantastic!',
    ];

    const celebration = celebrations[Math.floor(Math.random() * celebrations.length)];

    return {
      title: achievement,
      description,
      celebration,
    };
  }

  /**
   * FOMO (Fear of Missing Out) trigger
   */
  createFOMO(
    activity: string,
    timeLeft: number,
  ): {
    message: string;
    urgency: 'low' | 'medium' | 'high';
    color: string;
  } {
    let urgency: 'low' | 'medium' | 'high' = 'low';
    let color = '#10b981';

    if (timeLeft < 3600000) {
      // Less than 1 hour
      urgency = 'high';
      color = '#ef4444';
    } else if (timeLeft < 86400000) {
      // Less than 1 day
      urgency = 'medium';
      color = '#f59e0b';
    }

    const hours = Math.ceil(timeLeft / 3600000);
    const message =
      urgency === 'high'
        ? `Hurry! ${activity} ends in ${hours} hour${hours > 1 ? 's' : ''}!`
        : urgency === 'medium'
          ? `Don't miss out! ${activity} ends in ${hours} hours!`
          : `${activity} is happening now!`;

    return {
      message,
      urgency,
      color,
    };
  }

  /**
   * Personalization trigger
   */
  createPersonalization(
    userName: string,
    action: string,
  ): {
    message: string;
    personalized: boolean;
  } {
    const personalized = !!userName;
    const message = personalized ? `Hey ${userName}, ${action}` : action;

    return {
      message,
      personalized,
    };
  }

  /**
   * Urgency trigger
   */
  createUrgency(
    deadline: Date,
    action: string,
  ): {
    message: string;
    timeLeft: number;
    urgency: 'low' | 'medium' | 'high';
  } {
    const now = new Date();
    const timeLeft = deadline.getTime() - now.getTime();

    let urgency: 'low' | 'medium' | 'high' = 'low';
    let message = '';

    if (timeLeft < 0) {
      message = `${action} has ended`;
    } else if (timeLeft < 3600000) {
      // Less than 1 hour
      urgency = 'high';
      const minutes = Math.ceil(timeLeft / 60000);
      message = `Hurry! ${action} ends in ${minutes} minute${minutes > 1 ? 's' : ''}!`;
    } else if (timeLeft < 86400000) {
      // Less than 1 day
      urgency = 'medium';
      const hours = Math.ceil(timeLeft / 3600000);
      message = `${action} ends in ${hours} hour${hours > 1 ? 's' : ''}!`;
    } else {
      const days = Math.ceil(timeLeft / 86400000);
      message = `${action} ends in ${days} day${days > 1 ? 's' : ''}!`;
    }

    return {
      message,
      timeLeft,
      urgency,
    };
  }

  /**
   * Track user behavior
   */
  trackBehavior(userId: string, behavior: string, data: any): void {
    if (!this.userBehavior.has(userId)) {
      this.userBehavior.set(userId, {});
    }

    const userData = this.userBehavior.get(userId);
    userData[behavior] = data;
    this.userBehavior.set(userId, userData);
  }

  /**
   * Get user behavior insights
   */
  getUserInsights(userId: string): any {
    return this.userBehavior.get(userId) || {};
  }

  /**
   * Create personalized recommendation
   */
  createRecommendation(
    userId: string,
    items: string[],
  ): {
    recommended: string;
    reason: string;
    confidence: number;
  } {
    const insights = this.getUserInsights(userId);
    const preferences = insights.preferences || {};

    // Simple recommendation logic based on user behavior
    const recommended = items[Math.floor(Math.random() * items.length)];
    const confidence = Math.random() * 0.5 + 0.5; // 50-100% confidence

    const reasons = [
      'Based on your interests',
      'Popular among similar users',
      'Matches your preferences',
      'Trending in your area',
    ];

    const reason = reasons[Math.floor(Math.random() * reasons.length)];

    return {
      recommended,
      reason,
      confidence,
    };
  }
}

// Export singleton instance
export const psychologicalTriggers = PsychologicalTriggersSystem.getInstance();
