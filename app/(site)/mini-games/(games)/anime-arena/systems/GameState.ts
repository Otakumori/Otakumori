/**
 * Centralized game state management
 */
export default class GameState {
  private startTime: number = 0;
  private playtime: number = 0;
  private isPaused: boolean = false;
  private pauseStartTime: number = 0;
  private totalPauseTime: number = 0;

  reset() {
    this.startTime = Date.now();
    this.playtime = 0;
    this.isPaused = false;
    this.pauseStartTime = 0;
    this.totalPauseTime = 0;
  }

  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.pauseStartTime = Date.now();
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.totalPauseTime += Date.now() - this.pauseStartTime;
      this.pauseStartTime = 0;
    }
  }

  getPlaytime(): number {
    if (this.startTime === 0) return 0;
    
    const currentTime = this.isPaused ? this.pauseStartTime : Date.now();
    return Math.floor((currentTime - this.startTime - this.totalPauseTime) / 1000);
  }

  isGamePaused(): boolean {
    return this.isPaused;
  }
}

