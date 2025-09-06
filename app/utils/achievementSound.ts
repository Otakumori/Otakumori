class AchievementSound {
  private static instance: AchievementSound;
  private audio: HTMLAudioElement;

  private constructor() {
    this.audio = new Audio('/assets/sounds/achievement.mp3');
    this.audio.volume = 0.5;
  }

  public static getInstance(): AchievementSound {
    if (!AchievementSound.instance) {
      AchievementSound.instance = new AchievementSound();
    }
    return AchievementSound.instance;
  }

  public play(): void {
    this.audio.currentTime = 0;
    this.audio.play().catch((error) => {
      console.error('Failed to play achievement sound:', error);
    });
  }
}

export function achievementSound() {
  // No-op for now
}

export const achievementSoundInstance = AchievementSound.getInstance();
