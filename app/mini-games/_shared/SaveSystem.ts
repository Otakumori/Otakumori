import { auth } from '@clerk/nextjs/server';

export interface GameSaveData {
  gameId: string;
  score?: number;
  level?: number;
  progress?: number;
  stats?: Record<string, any>;
  settings?: Record<string, any>;
  timestamp: number;
  saveVersion: number;
}

export interface SaveSlot {
  slot: number;
  data: GameSaveData;
  updatedAt: Date;
}

const CURRENT_SAVE_VERSION = 1;
const MAX_SLOTS = 3; // Rolling snapshots (0, 1, 2)

/**
 * Client-side save system for games
 * Automatically rotates between 3 slots to prevent corruption
 */
export class GameSaveSystem {
  private gameId: string;
  private userId: string | null = null;

  constructor(gameId: string) {
    this.gameId = gameId;
  }

  /**
   * Initialize the save system with user authentication
   */
  async initialize(): Promise<boolean> {
    try {
      const response = await fetch('/api/v1/game-saves/auth', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const { userId } = await response.json();
        this.userId = userId;
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Failed to initialize save system:', error);
      return false;
    }
  }

  /**
   * Save game data with automatic slot rotation
   */
  async saveGame(
    data: Omit<GameSaveData, 'gameId' | 'timestamp' | 'saveVersion'>,
  ): Promise<boolean> {
    if (!this.userId) {
      console.warn('Cannot save: user not authenticated');
      return false;
    }

    try {
      // Get current slots to determine next slot
      const slots = await this.loadAllSlots();
      const nextSlot = this.getNextSlot(slots);

      const saveData: GameSaveData = {
        ...data,
        gameId: this.gameId,
        timestamp: Date.now(),
        saveVersion: CURRENT_SAVE_VERSION,
      };

      const response = await fetch('/api/v1/game-saves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': `save_${this.gameId}_${this.userId}_${Date.now()}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          gameId: this.gameId,
          slot: nextSlot,
          payload: saveData,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load the most recent save data
   */
  async loadGame(): Promise<GameSaveData | null> {
    if (!this.userId) {
      console.warn('Cannot load: user not authenticated');
      return null;
    }

    try {
      const slots = await this.loadAllSlots();
      if (slots.length === 0) return null;

      // Return the most recent save
      const latest = slots.reduce((latest, current) =>
        current.updatedAt > latest.updatedAt ? current : latest,
      );

      return latest.data;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Load all save slots for this game
   */
  async loadAllSlots(): Promise<SaveSlot[]> {
    if (!this.userId) return [];

    try {
      const response = await fetch(`/api/v1/game-saves?gameId=${this.gameId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) return [];

      const { data } = await response.json();
      return data.saves.map((save: any) => ({
        slot: save.slot,
        data: save.payload,
        updatedAt: new Date(save.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load save slots:', error);
      return [];
    }
  }

  /**
   * Determine the next slot to use for saving
   * Uses round-robin rotation: 0 -> 1 -> 2 -> 0
   */
  private getNextSlot(existingSlots: SaveSlot[]): number {
    if (existingSlots.length === 0) return 0;
    if (existingSlots.length < MAX_SLOTS) {
      // Fill up slots sequentially first
      const usedSlots = existingSlots.map((s) => s.slot).sort();
      for (let i = 0; i < MAX_SLOTS; i++) {
        if (!usedSlots.includes(i)) return i;
      }
    }

    // All slots used, overwrite the oldest
    const oldest = existingSlots.reduce((oldest, current) =>
      current.updatedAt < oldest.updatedAt ? current : oldest,
    );
    return oldest.slot;
  }

  /**
   * Auto-save on game events
   */
  async autoSave(data: Omit<GameSaveData, 'gameId' | 'timestamp' | 'saveVersion'>): Promise<void> {
    // Debounce auto-saves to prevent too frequent saves
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    this.autoSaveTimeout = setTimeout(async () => {
      await this.saveGame(data);
    }, 2000); // Save 2 seconds after last activity
  }

  private autoSaveTimeout: NodeJS.Timeout | null = null;

  /**
   * Save immediately on game exit
   */
  async saveOnExit(
    data: Omit<GameSaveData, 'gameId' | 'timestamp' | 'saveVersion'>,
  ): Promise<boolean> {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
    return await this.saveGame(data);
  }

  /**
   * Check if save data needs migration
   */
  needsMigration(saveData: GameSaveData): boolean {
    return saveData.saveVersion < CURRENT_SAVE_VERSION;
  }

  /**
   * Migrate save data to current version
   */
  migrateSaveData(saveData: GameSaveData): GameSaveData {
    const migrated = { ...saveData };

    // Future migration logic would go here
    // if (saveData.saveVersion < 2) {
    //   // Migrate from version 1 to 2
    //   migrated.newField = defaultValue;
    // }

    migrated.saveVersion = CURRENT_SAVE_VERSION;
    return migrated;
  }
}

/**
 * Hook for using the save system in React components
 */
export function useGameSave(gameId: string) {
  const saveSystem = new GameSaveSystem(gameId);

  const save = async (data: Omit<GameSaveData, 'gameId' | 'timestamp' | 'saveVersion'>) => {
    return await saveSystem.saveGame(data);
  };

  const load = async () => {
    return await saveSystem.loadGame();
  };

  const autoSave = async (data: Omit<GameSaveData, 'gameId' | 'timestamp' | 'saveVersion'>) => {
    await saveSystem.autoSave(data);
  };

  const saveOnExit = async (data: Omit<GameSaveData, 'gameId' | 'timestamp' | 'saveVersion'>) => {
    return await saveSystem.saveOnExit(data);
  };

  return {
    save,
    load,
    autoSave,
    saveOnExit,
    saveSystem,
  };
}
