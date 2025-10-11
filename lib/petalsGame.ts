// Petal Shop mini-game logic for interactive petals
export interface PetalReward {
  id: string;
  type: 'coupon' | 'petals' | 'unlock';
  value: number;
  message: string;
}

export interface PetalGameState {
  collected: number;
  totalSpawned: number;
  rewards: PetalReward[];
  isActive: boolean;
}

// Petal Shop reward system
export class PetalShopHandler {
  private state: PetalGameState = {
    collected: 0,
    totalSpawned: 0,
    rewards: [],
    isActive: false,
  };

  private rewardChances = {
    coupon: 0.1, // 10% chance for coupon
    petals: 0.7, // 70% chance for petal currency
    unlock: 0.2, // 20% chance for unlock
  };

  start() {
    this.state.isActive = true;
    // Petal Shop mini-game started!
  }

  stop() {
    this.state.isActive = false;
    // Petal Shop mini-game stopped!
  }

  collectPetal(petalId: string): PetalReward | null {
    if (!this.state.isActive) return null;

    // Log petal collection for debugging
    console.warn('Petal collected:', petalId);

    this.state.collected++;

    // Generate reward based on probabilities
    const rand = Math.random();
    let reward: PetalReward | null = null;

    if (rand < this.rewardChances.coupon) {
      const value = Math.floor(Math.random() * 20) + 5; // 5-25% off
      reward = {
        id: `coupon_${Date.now()}`,
        type: 'coupon',
        value,
        message: `You found a ${value}% off coupon!`,
      };
    } else if (rand < this.rewardChances.coupon + this.rewardChances.petals) {
      const value = Math.floor(Math.random() * 10) + 1; // 1-10 petals
      reward = {
        id: `petals_${Date.now()}`,
        type: 'petals',
        value,
        message: `+${value} petals added to your collection!`,
      };
    } else {
      reward = {
        id: `unlock_${Date.now()}`,
        type: 'unlock',
        value: 1,
        message: `New item unlocked in the Petal Shop!`,
      };
    }

    this.state.rewards.push(reward);

    // Show reward notification
    this.showRewardNotification(reward);

    return reward;
  }

  private showRewardNotification(reward: PetalReward) {
    // Create floating notification
    const notification = document.createElement('div');
    notification.textContent = reward.message;
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(247, 191, 211, 0.95);
      color: #1a1a1a;
      padding: 12px 24px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
      z-index: 1000;
      pointer-events: none;
      animation: rewardFloat 2s ease-out forwards;
    `;

    // Add CSS animation if not already added
    if (!document.querySelector('#reward-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'reward-animation-styles';
      style.textContent = `
        @keyframes rewardFloat {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8) translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 2000);
  }

  getState(): PetalGameState {
    return { ...this.state };
  }

  reset() {
    this.state = {
      collected: 0,
      totalSpawned: 0,
      rewards: [],
      isActive: false,
    };
  }
}

// Singleton instance
export const petalShopHandler = new PetalShopHandler();
