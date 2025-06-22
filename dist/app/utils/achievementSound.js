'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.achievementSound = void 0;
class AchievementSound {
  static instance;
  audio;
  constructor() {
    this.audio = new Audio('/assets/sounds/achievement.mp3');
    this.audio.volume = 0.5;
  }
  static getInstance() {
    if (!AchievementSound.instance) {
      AchievementSound.instance = new AchievementSound();
    }
    return AchievementSound.instance;
  }
  play() {
    this.audio.currentTime = 0;
    this.audio.play().catch(error => {
      console.error('Failed to play achievement sound:', error);
    });
  }
}
exports.achievementSound = AchievementSound.getInstance();
