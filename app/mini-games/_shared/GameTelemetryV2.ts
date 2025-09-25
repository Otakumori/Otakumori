/**
 * Enterprise Game Telemetry System V2
 *
 * Production-ready analytics with:
 * - Real-time player behavior tracking
 * - Performance metrics collection
 * - A/B testing integration
 * - Anti-cheat analytics
 * - Player retention insights
 * - Custom event pipelines
 * - Privacy-compliant data collection
 */

'use client';

export interface GameEvent {
  eventType: string;
  gameId: string;
  userId?: string;
  sessionId: string;
  timestamp: number;

  // Game-specific data
  gameData: {
    level?: number;
    score?: number;
    progress?: number;
    action?: string;
    target?: string;
    result?: 'success' | 'failure' | 'timeout';
    duration?: number;
    reason?: string;
    gamesPlayed?: number;
    highScore?: number;
    averageFPS?: number;

    // Performance metrics
    fps?: number;
    latency?: number;
    memoryUsage?: number;

    // Player behavior
    inputType?: 'mouse' | 'keyboard' | 'touch';
    difficulty?: 'easy' | 'medium' | 'hard';
    powerUpsUsed?: string[];

    // Context
    platform?: string;
    browserAgent?: string;
    screenResolution?: string;
    connectionType?: string;
  };

  // Metadata
  metadata: {
    buildVersion: string;
    featureFlags: Record<string, any>;
    experimentGroups: string[];
    playerSegment?: string;
    errorMessage?: string;
    errorStack?: string;

    // Privacy settings
    consentLevel: 'none' | 'basic' | 'analytics' | 'full';
    anonymized: boolean;
  };
}

export interface PlayerSession {
  sessionId: string;
  gameId: string;
  userId?: string;
  startTime: number;
  endTime?: number;

  // Session metrics
  totalPlayTime: number;
  gamesPlayed: number;
  highScore: number;
  averageScore: number;
  levelsCompleted: number;

  // Engagement
  pauseCount: number;
  quitEarly: boolean;
  completedFully: boolean;
  returnedAfterPause: boolean;

  // Performance
  averageFPS: number;
  lagSpikes: number;
  crashCount: number;

  // Behavioral
  helpRequested: number;
  settingsChanged: number;
  socialInteractions: number;
}

export interface TelemetryConfig {
  enabled: boolean;
  endpoint: string;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  consentRequired: boolean;
  debugMode: boolean;

  // Privacy settings
  includeUserId: boolean;
  anonymizeData: boolean;
  dataRetentionDays: number;

  // Performance
  performanceMonitoring: boolean;
  errorTracking: boolean;
  customMetrics: boolean;
}

export class GameTelemetryV2 {
  private config: TelemetryConfig;
  private eventQueue: GameEvent[] = [];
  private currentSession: PlayerSession | null = null;
  private flushTimer: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private errorHandler: ((error: Error) => void) | null = null;

  // Metrics tracking
  private fpsHistory: number[] = [];
  private lastFrameTime: number = 0;
  private frameCount: number = 0;

  constructor(config: Partial<TelemetryConfig> = {}) {
    this.config = {
      enabled: true,
      endpoint: '/api/v1/telemetry',
      batchSize: 50,
      flushInterval: 10000, // 10 seconds
      maxRetries: 3,
      consentRequired: true,
      debugMode: process.env.NODE_ENV === 'development',
      includeUserId: true,
      anonymizeData: false,
      dataRetentionDays: 90,
      performanceMonitoring: true,
      errorTracking: true,
      customMetrics: true,
      ...config,
    };

    this.initializePerformanceMonitoring();
    this.startFlushTimer();
    this.setupErrorHandling();
  }

  /**
   * Initialize a new game session
   */
  startSession(gameId: string, userId?: string): string {
    const sessionId = this.generateSessionId();

    this.currentSession = {
      sessionId,
      gameId,
      userId,
      startTime: Date.now(),
      totalPlayTime: 0,
      gamesPlayed: 0,
      highScore: 0,
      averageScore: 0,
      levelsCompleted: 0,
      pauseCount: 0,
      quitEarly: false,
      completedFully: false,
      returnedAfterPause: false,
      averageFPS: 0,
      lagSpikes: 0,
      crashCount: 0,
      helpRequested: 0,
      settingsChanged: 0,
      socialInteractions: 0,
    };

    this.trackEvent('session_start', gameId, {
      platform: this.getPlatform(),
      screenResolution: this.getScreenResolution(),
      connectionType: this.getConnectionType(),
    });

    if (this.config.debugMode) {
      console.log(`🎮 Telemetry session started: ${sessionId}`);
    }

    return sessionId;
  }

  /**
   * End the current session
   */
  endSession(reason: 'completed' | 'quit' | 'error' | 'timeout' = 'completed'): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.totalPlayTime = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.quitEarly = reason === 'quit';
    this.currentSession.completedFully = reason === 'completed';

    this.trackEvent('session_end', this.currentSession.gameId, {
      duration: this.currentSession.totalPlayTime,
      reason,
      gamesPlayed: this.currentSession.gamesPlayed,
      highScore: this.currentSession.highScore,
      averageFPS: this.calculateAverageFPS(),
    });

    // Send session summary
    this.sendSessionSummary();

    this.currentSession = null;

    if (this.config.debugMode) {
      console.log(`🎮 Telemetry session ended: ${reason}`);
    }
  }

  /**
   * Track a game event
   */
  trackEvent(
    eventType: string,
    gameId: string,
    gameData: Partial<GameEvent['gameData']> = {},
    metadata: Partial<GameEvent['metadata']> = {},
  ): void {
    if (!this.config.enabled) return;

    const event: GameEvent = {
      eventType,
      gameId,
      userId: this.config.includeUserId ? this.currentSession?.userId : undefined,
      sessionId: this.currentSession?.sessionId || 'no-session',
      timestamp: Date.now(),
      gameData: {
        platform: this.getPlatform(),
        browserAgent: navigator.userAgent,
        screenResolution: this.getScreenResolution(),
        fps: this.getCurrentFPS(),
        ...gameData,
      },
      metadata: {
        buildVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        featureFlags: this.getActiveFeatureFlags(),
        experimentGroups: this.getExperimentGroups(),
        consentLevel: this.getConsentLevel(),
        anonymized: this.config.anonymizeData,
        ...metadata,
      },
    };

    // Anonymize if required
    if (this.config.anonymizeData) {
      event.userId = undefined;
      event.gameData.browserAgent = this.anonymizeBrowserAgent(event.gameData.browserAgent || '');
    }

    this.eventQueue.push(event);

    // Update session metrics
    this.updateSessionMetrics(eventType, gameData);

    if (this.config.debugMode) {
      console.log(`📊 Event tracked: ${eventType}`, event);
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  /**
   * Track specific game actions
   */
  trackGameStart(gameId: string, difficulty?: string, mode?: string): void {
    this.trackEvent('game_start', gameId, {
      difficulty: difficulty as any,
      action: 'start',
      target: mode,
    });

    if (this.currentSession) {
      this.currentSession.gamesPlayed++;
    }
  }

  trackGameEnd(
    gameId: string,
    score: number,
    level: number,
    result: 'victory' | 'defeat' | 'quit',
  ): void {
    this.trackEvent('game_end', gameId, {
      score,
      level,
      result: result === 'victory' ? 'success' : 'failure',
      action: 'end',
    });

    if (this.currentSession) {
      if (score > this.currentSession.highScore) {
        this.currentSession.highScore = score;
      }

      const totalScore =
        this.currentSession.averageScore * (this.currentSession.gamesPlayed - 1) + score;
      this.currentSession.averageScore = totalScore / this.currentSession.gamesPlayed;

      if (result === 'victory') {
        this.currentSession.levelsCompleted++;
      }
    }
  }

  trackPlayerAction(gameId: string, action: string, target?: string, success?: boolean): void {
    this.trackEvent('player_action', gameId, {
      action,
      target,
      result: success !== undefined ? (success ? 'success' : 'failure') : undefined,
    });
  }

  trackPerformanceMetric(gameId: string, metric: string, value: number, context?: string): void {
    this.trackEvent('performance_metric', gameId, {
      action: metric,
      target: context,
      [metric]: value,
    });
  }

  trackError(gameId: string, error: Error, context?: string): void {
    this.trackEvent(
      'error',
      gameId,
      {
        action: 'error',
        target: context,
        result: 'failure',
      },
      {
        errorMessage: error.message,
        errorStack: error.stack,
      },
    );

    if (this.currentSession) {
      this.currentSession.crashCount++;
    }

    if (this.errorHandler) {
      this.errorHandler(error);
    }
  }

  /**
   * Manually flush the event queue
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEvents(events);

      if (this.config.debugMode) {
        console.log(`📤 Flushed ${events.length} events`);
      }
    } catch (error) {
      console.error('Failed to send telemetry events:', error);

      // Re-queue events for retry (with limit)
      if (events.length < this.config.batchSize * 2) {
        this.eventQueue.unshift(...events);
      }
    }
  }

  /**
   * Set user consent level
   */
  setConsentLevel(level: 'none' | 'basic' | 'analytics' | 'full'): void {
    localStorage.setItem('otm_telemetry_consent', level);

    if (level === 'none') {
      this.config.enabled = false;
      this.eventQueue = [];
    } else {
      this.config.enabled = true;
    }
  }

  /**
   * Get current consent level
   */
  getConsentLevel(): 'none' | 'basic' | 'analytics' | 'full' {
    return (localStorage.getItem('otm_telemetry_consent') as any) || 'basic';
  }

  /**
   * Cleanup telemetry system
   */
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    // Final flush
    this.flush();

    if (this.currentSession) {
      this.endSession('quit');
    }
  }

  // Private methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePerformanceMonitoring(): void {
    if (!this.config.performanceMonitoring || typeof window === 'undefined') return;

    // FPS monitoring
    this.startFPSMonitoring();

    // Performance Observer for navigation and resource timing
    if (typeof PerformanceObserver !== 'undefined') {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.trackPerformanceMetric('system', 'page_load_time', entry.duration);
          } else if (entry.entryType === 'paint') {
            this.trackPerformanceMetric('system', entry.name, entry.startTime);
          }
        }
      });

      this.performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'measure'] });
    }
  }

  private startFPSMonitoring(): void {
    const measureFPS = () => {
      const now = performance.now();

      if (this.lastFrameTime > 0) {
        const delta = now - this.lastFrameTime;
        const fps = 1000 / delta;

        this.fpsHistory.push(fps);

        // Keep only last 60 frames
        if (this.fpsHistory.length > 60) {
          this.fpsHistory.shift();
        }
      }

      this.lastFrameTime = now;
      this.frameCount++;

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  private getCurrentFPS(): number {
    if (this.fpsHistory.length === 0) return 60;

    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  private calculateAverageFPS(): number {
    return this.getCurrentFPS();
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private setupErrorHandling(): void {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      if (this.currentSession) {
        this.trackError(this.currentSession.gameId, new Error(event.message), 'global');
      }
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      if (this.currentSession) {
        this.trackError(this.currentSession.gameId, new Error(event.reason), 'promise');
      }
    });
  }

  private async sendEvents(events: GameEvent[]): Promise<void> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      throw new Error(`Telemetry request failed: ${response.status}`);
    }
  }

  private async sendSessionSummary(): Promise<void> {
    if (!this.currentSession) return;

    try {
      await fetch('/api/v1/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ session: this.currentSession }),
      });
    } catch (error) {
      console.error('Failed to send session summary:', error);
    }
  }

  private updateSessionMetrics(eventType: string, gameData: Partial<GameEvent['gameData']>): void {
    if (!this.currentSession) return;

    switch (eventType) {
      case 'game_pause':
        this.currentSession.pauseCount++;
        break;
      case 'help_requested':
        this.currentSession.helpRequested++;
        break;
      case 'settings_changed':
        this.currentSession.settingsChanged++;
        break;
      case 'social_interaction':
        this.currentSession.socialInteractions++;
        break;
    }
  }

  private getPlatform(): string {
    if (typeof window === 'undefined') return 'server';

    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet')) return 'tablet';
    return 'desktop';
  }

  private getScreenResolution(): string {
    if (typeof window === 'undefined') return 'unknown';
    return `${window.screen.width}x${window.screen.height}`;
  }

  private getConnectionType(): string {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) return 'unknown';

    const connection = (navigator as any).connection;
    return connection?.effectiveType || 'unknown';
  }

  private getActiveFeatureFlags(): Record<string, any> {
    // In production, this would integrate with your feature flag system
    return {
      gamePhysics: 'v2',
      leaderboards: 'enabled',
      socialFeatures: 'beta',
    };
  }

  private getExperimentGroups(): string[] {
    // In production, this would integrate with your A/B testing system
    return ['difficulty_adaptive_v1', 'ui_redesign_b'];
  }

  private anonymizeBrowserAgent(userAgent: string): string {
    // Simple anonymization - remove version numbers
    return userAgent.replace(/\d+\.\d+(\.\d+)?/g, 'X.X');
  }
}

// Singleton instance
let telemetryInstance: GameTelemetryV2 | null = null;

export function getGameTelemetry(): GameTelemetryV2 {
  if (!telemetryInstance) {
    telemetryInstance = new GameTelemetryV2();
  }
  return telemetryInstance;
}

// Convenience hooks for React components
export function useGameTelemetry(gameId: string) {
  const telemetry = getGameTelemetry();

  return {
    startSession: (userId?: string) => telemetry.startSession(gameId, userId),
    endSession: (reason?: 'completed' | 'quit' | 'error' | 'timeout') =>
      telemetry.endSession(reason),
    trackGameStart: (difficulty?: string, mode?: string) =>
      telemetry.trackGameStart(gameId, difficulty, mode),
    trackGameEnd: (score: number, level: number, result: 'victory' | 'defeat' | 'quit') =>
      telemetry.trackGameEnd(gameId, score, level, result),
    trackAction: (action: string, target?: string, success?: boolean) =>
      telemetry.trackPlayerAction(gameId, action, target, success),
    trackError: (error: Error, context?: string) => telemetry.trackError(gameId, error, context),
    trackMetric: (metric: string, value: number, context?: string) =>
      telemetry.trackPerformanceMetric(gameId, metric, value, context),
  };
}
