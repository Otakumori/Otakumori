/**
 * Game Session Analytics Tracker
 * Tracks game sessions with IndexedDB persistence and backend sync
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface SessionAction {
  type: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface GameSession {
  id: string;
  gameId: string;
  userId?: string;
  startTime: number;
  endTime?: number;
  score: number;
  highScore: number;
  actions: SessionAction[];
  metadata: Record<string, unknown>;
  synced: boolean;
}

interface SessionDB extends DBSchema {
  sessions: {
    key: string;
    value: GameSession;
    indexes: {
      byGameId: string;
      bySynced: boolean;
      byStartTime: number;
    };
  } & any; // Workaround for DBSchema typing issue
}

class SessionTracker {
  private db: IDBPDatabase<SessionDB> | null = null;
  private currentSession: GameSession | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<SessionDB>('otakumori-sessions', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('sessions')) {
            const store = db.createObjectStore('sessions', { keyPath: 'id' });
            store.createIndex('byGameId', 'gameId');
            store.createIndex('bySynced', 'synced');
            store.createIndex('byStartTime', 'startTime');
          }
        },
      });

      // Start background sync
      this.startBackgroundSync();
    } catch (err) {
      console.error('Failed to initialize session tracker:', err);
    }
  }

  /**
   * Start a new game session
   */
  async startSession(
    gameId: string,
    userId?: string,
    metadata: Record<string, unknown> = {},
  ): Promise<string> {
    await this.init();

    const sessionId = this.generateSessionId();

    this.currentSession = {
      id: sessionId,
      gameId,
      userId,
      startTime: Date.now(),
      score: 0,
      highScore: 0,
      actions: [],
      metadata,
      synced: false,
    };

    // Save to IndexedDB
    if (this.db) {
      await this.db.add('sessions', this.currentSession);
    }

    return sessionId;
  }

  /**
   * End the current session
   */
  async endSession(score: number): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.endTime = Date.now();
    this.currentSession.score = score;

    // Update in IndexedDB
    if (this.db) {
      await this.db.put('sessions', this.currentSession);
    }

    // Attempt immediate sync
    await this.syncSession(this.currentSession.id);

    this.currentSession = null;
  }

  /**
   * Log an action in the current session
   */
  async logAction(type: string, data?: Record<string, unknown>): Promise<void> {
    if (!this.currentSession) return;

    const action: SessionAction = {
      type,
      timestamp: Date.now(),
      data,
    };

    this.currentSession.actions.push(action);

    // Update in IndexedDB
    if (this.db) {
      await this.db.put('sessions', this.currentSession);
    }
  }

  /**
   * Update current session score
   */
  async updateScore(score: number): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.score = score;
    this.currentSession.highScore = Math.max(this.currentSession.highScore, score);

    // Update in IndexedDB
    if (this.db) {
      await this.db.put('sessions', this.currentSession);
    }
  }

  /**
   * Get session by ID
   */
  async getSession(sessionId: string): Promise<GameSession | undefined> {
    await this.init();
    if (!this.db) return undefined;
    return this.db.get('sessions', sessionId);
  }

  /**
   * Get all sessions for a game
   */
  async getGameSessions(gameId: string): Promise<GameSession[]> {
    await this.init();
    if (!this.db) return [];
    return this.db.getAllFromIndex('sessions', 'byGameId', gameId);
  }

  /**
   * Get session statistics
   */
  async getStats(gameId: string): Promise<{
    totalSessions: number;
    totalPlayTime: number;
    averageScore: number;
    highScore: number;
  }> {
    const sessions = await this.getGameSessions(gameId);

    const totalSessions = sessions.length;
    const totalPlayTime = sessions.reduce(
      (sum, s) => sum + ((s.endTime || Date.now()) - s.startTime),
      0,
    );
    const averageScore = sessions.reduce((sum, s) => sum + s.score, 0) / (totalSessions || 1);
    const highScore = Math.max(...sessions.map((s) => s.highScore), 0);

    return {
      totalSessions,
      totalPlayTime,
      averageScore,
      highScore,
    };
  }

  /**
   * Sync session to backend
   */
  private async syncSession(sessionId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session || session.synced) return true;

    try {
      const response = await fetch('/api/v1/analytics/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': `session-${sessionId}`,
        },
        body: JSON.stringify(session),
      });

      if (response.ok) {
        // Mark as synced
        session.synced = true;
        if (this.db) {
          await this.db.put('sessions', session);
        }
        return true;
      }

      return false;
    } catch (err) {
      console.error('Failed to sync session:', err);
      return false;
    }
  }

  /**
   * Background sync of unsynced sessions
   */
  private startBackgroundSync(): void {
    this.syncInterval = setInterval(async () => {
      if (!this.db) return;

      try {
        const unsyncedSessions = await this.db.getAllFromIndex('sessions', 'bySynced', false);

        for (const session of unsyncedSessions.slice(0, 5)) {
          await this.syncSession(session.id);
        }
      } catch (err) {
        console.error('Background sync error:', err);
      }
    }, 60000); // Every minute
  }

  /**
   * Stop background sync
   */
  stopBackgroundSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Export session data for replay/debugging
   */
  async exportSession(sessionId: string): Promise<string | null> {
    const session = await this.getSession(sessionId);
    if (!session) return null;

    return JSON.stringify(session, null, 2);
  }

  /**
   * Clean up old sessions (keep last 100)
   */
  async cleanup(): Promise<void> {
    if (!this.db) return;

    const allSessions = await this.db.getAllFromIndex('sessions', 'byStartTime');

    // Keep only the 100 most recent sessions
    if (allSessions.length > 100) {
      const toDelete = allSessions.slice(0, allSessions.length - 100);
      for (const session of toDelete) {
        // Delete specific session by ID
        // eslint-disable-next-line drizzle/enforce-delete-with-where -- Deleting by specific ID from loop
        await this.db.delete('sessions', session.id);
      }
    }
  }
}

// Singleton instance
export const sessionTracker = new SessionTracker();
