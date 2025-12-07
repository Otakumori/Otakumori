'use client';

import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
// Save System Types
export interface SaveData {
  id: string;
  userId: string;
  gameId: string;
  gameName: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  data: Record<string, any>;
  metadata: SaveMetadata;
  }

export interface SaveMetadata {
  level: number;
  score: number;
  timePlayed: number;
  achievements: string[];
  settings: Record<string, any>;
  checksum: string;
  }

export interface SaveSlot {
  id: string;
  name: string;
  gameId: string;
  gameName: string;
  level: number;
  score: number;
  timePlayed: number;
  lastPlayed: Date;
  thumbnail?: string;
  isAutoSave: boolean;
  isCloudSave: boolean;
  size: number;
  }

export interface SaveSystemConfig {
  maxSlots: number;
  maxAutoSaves: number;
  autoSaveInterval: number; // in milliseconds
  cloudSync: boolean;
  compression: boolean;
  encryption: boolean;
  backupCount: number;
}

// Save System Class
export class SaveSystem {
  private saves: Map<string, SaveData> = new Map();
  private slots: Map<string, SaveSlot> = new Map();
  private config: SaveSystemConfig;
  private autoSaveTimer?: NodeJS.Timeout;
  private currentGameId?: string;
  private currentUserId?: string;

  private onSaveCreated?: (save: SaveData) => void;
  private onSaveUpdated?: (save: SaveData) => void;
  private onSaveDeleted?: (saveId: string) => void;
  private onAutoSave?: (save: SaveData) => void;

  constructor(config: Partial<SaveSystemConfig> = {}) {
    this.config = {
      maxSlots: 10,
      maxAutoSaves: 5,
      autoSaveInterval: 30000, // 30 seconds
      cloudSync: true,
      compression: true,
      encryption: false,
      backupCount: 3,
      ...config,
    };

    this.loadFromLocalStorage();
  }

  // Set current user and game
  setCurrentContext(userId: string, gameId: string): void {
    this.currentUserId = userId;
    this.currentGameId = gameId;
  }

  // Create new save
  async createSave(
    slotId: string,
    data: Record<string, any>,
    metadata: Partial<SaveMetadata> = {},
  ): Promise<SaveData> {
    if (!this.currentUserId || !this.currentGameId) {
      throw new Error('Current user or game not set');
    }

    const saveId = this.generateSaveId();
    const now = new Date();

    const save: SaveData = {
      id: saveId,
      userId: this.currentUserId,
      gameId: this.currentGameId,
      gameName: this.getGameName(this.currentGameId),
      version: '1.0.0',
      createdAt: now,
      updatedAt: now,
      data: this.config.compression ? await this.compressData(data) : data,
      metadata: {
        level: 1,
        score: 0,
        timePlayed: 0,
        achievements: [],
        settings: {},
        checksum: '',
        ...metadata,
      },
    };

    // Calculate checksum
    save.metadata.checksum = this.calculateChecksum(save);

    // Store save
    this.saves.set(saveId, save);

    // Create or update slot
    await this.updateSlot(slotId, save);

    // Save to localStorage
    this.saveToLocalStorage();

    this.onSaveCreated?.(save);
    return save;
  }

  // Update existing save
  async updateSave(
    saveId: string,
    data: Record<string, any>,
    metadata: Partial<SaveMetadata> = {},
  ): Promise<SaveData> {
    const save = this.saves.get(saveId);
    if (!save) {
      throw new Error('Save not found');
    }

    // Update save data
    save.data = this.config.compression ? await this.compressData(data) : data;
    save.updatedAt = new Date();
    Object.assign(save.metadata, metadata);

    // Recalculate checksum
    save.metadata.checksum = this.calculateChecksum(save);

    // Update slot
    const slotId = this.findSlotBySaveId(saveId);
    if (slotId) {
      await this.updateSlot(slotId, save);
    }

    // Save to localStorage
    this.saveToLocalStorage();

    this.onSaveUpdated?.(save);
    return save;
  }

  // Load save
  loadSave(saveId: string): SaveData | null {
    const save = this.saves.get(saveId);
    if (!save) return null;

    // Verify checksum
    if (!this.verifyChecksum(save)) {
      logger.warn('Save data checksum verification failed');
    }

    return save;
  }

  // Load save by slot
  loadSaveBySlot(slotId: string): SaveData | null {
    const slot = this.slots.get(slotId);
    if (!slot) return null;

    // Find the most recent save for this slot
    const saves = Array.from(this.saves.values())
      .filter((save) => save.userId === this.currentUserId && save.gameId === slot.gameId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return saves[0] || null;
  }

  // Delete save
  deleteSave(saveId: string): void {
    const save = this.saves.get(saveId);
    if (!save) return;

    // Remove from saves
    this.saves.delete(saveId);

    // Update slot
    const slotId = this.findSlotBySaveId(saveId);
    if (slotId) {
      this.slots.delete(slotId);
    }

    // Save to localStorage
    this.saveToLocalStorage();

    this.onSaveDeleted?.(saveId);
  }

  // Get all saves for current user
  getUserSaves(): SaveData[] {
    if (!this.currentUserId) return [];

    return Array.from(this.saves.values())
      .filter((save) => save.userId === this.currentUserId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Get saves for current game
  getGameSaves(): SaveData[] {
    if (!this.currentGameId) return [];

    return Array.from(this.saves.values())
      .filter((save) => save.gameId === this.currentGameId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  // Get all save slots
  getSaveSlots(): SaveSlot[] {
    return Array.from(this.slots.values()).sort(
      (a, b) => b.lastPlayed.getTime() - a.lastPlayed.getTime(),
    );
  }

  // Get available slots
  getAvailableSlots(): string[] {
    const usedSlots = new Set(this.slots.keys());
    const availableSlots: string[] = [];

    for (let i = 1; i <= this.config.maxSlots; i++) {
      const slotId = `slot_${i}`;
      if (!usedSlots.has(slotId)) {
        availableSlots.push(slotId);
      }
    }

    return availableSlots;
  }

  // Start auto-save
  startAutoSave(slotId: string, data: Record<string, any>): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(async () => {
      try {
        const save = await this.createSave(slotId, data, {});
        this.onAutoSave?.(save);
      } catch (error) {
        logger.error('Auto-save failed:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    }, this.config.autoSaveInterval);
  }

  // Stop auto-save
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
  }

  // Export save data
  exportSave(saveId: string): string {
    const save = this.saves.get(saveId);
    if (!save) return '';

    const exportData = {
      ...save,
      exportedAt: new Date().toISOString(),
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Import save data
  async importSave(data: string): Promise<SaveData> {
    try {
      const parsed = JSON.parse(data);

      // Validate save data
      if (!parsed.id || !parsed.userId || !parsed.gameId) {
        throw new Error('Invalid save data format');
      }

      // Create new save
      const save: SaveData = {
        id: this.generateSaveId(),
        userId: parsed.userId,
        gameId: parsed.gameId,
        gameName: parsed.gameName || 'Imported Game',
        version: parsed.version || '1.0.0',
        createdAt: new Date(parsed.createdAt || Date.now()),
        updatedAt: new Date(parsed.updatedAt || Date.now()),
        data: parsed.data || {},
        metadata: parsed.metadata || {
          level: 1,
          score: 0,
          timePlayed: 0,
          achievements: [],
          settings: {},
          checksum: '',
        },
      };

      // Recalculate checksum
      save.metadata.checksum = this.calculateChecksum(save);

      // Store save
      this.saves.set(save.id, save);

      // Create slot
      const slotId = this.getAvailableSlots()[0];
      if (slotId) {
        await this.updateSlot(slotId, save);
      }

      // Save to localStorage
      this.saveToLocalStorage();

      this.onSaveCreated?.(save);
      return save;
    } catch (error) {
      logger.error('Failed to import save data:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Create backup
  async createBackup(): Promise<string> {
    const backupData = {
      saves: Array.from(this.saves.values()),
      slots: Array.from(this.slots.values()),
      config: this.config,
      createdAt: new Date().toISOString(),
    };

    return JSON.stringify(backupData, null, 2);
  }

  // Restore from backup
  async restoreFromBackup(backupData: string): Promise<void> {
    try {
      const parsed = JSON.parse(backupData);

      if (parsed.saves) {
        this.saves.clear();
        parsed.saves.forEach((save: SaveData) => {
          this.saves.set(save.id, save);
        });
      }

      if (parsed.slots) {
        this.slots.clear();
        parsed.slots.forEach((slot: SaveSlot) => {
          this.slots.set(slot.id, slot);
        });
      }

      if (parsed.config) {
        Object.assign(this.config, parsed.config);
      }

      // Save to localStorage
      this.saveToLocalStorage();
    } catch (error) {
      logger.error('Failed to restore from backup:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  // Update slot
  private async updateSlot(slotId: string, save: SaveData): Promise<void> {
    const slot: SaveSlot = {
      id: slotId,
      name: `Save ${slotId.replace('slot_', '')}`,
      gameId: save.gameId,
      gameName: save.gameName,
      level: save.metadata.level,
      score: save.metadata.score,
      timePlayed: save.metadata.timePlayed,
      lastPlayed: save.updatedAt,
      thumbnail: undefined, // This would be generated from game state
      isAutoSave: false,
      isCloudSave: this.config.cloudSync,
      size: JSON.stringify(save).length,
    };

    this.slots.set(slotId, slot);
  }

  // Find slot by save ID
  private findSlotBySaveId(saveId: string): string | null {
    for (const [slotId, slot] of this.slots.entries()) {
      if (slot.gameId === this.currentGameId) {
        const saves = this.getGameSaves();
        if (saves.some((save) => save.id === saveId)) {
          return slotId;
        }
      }
    }
    return null;
  }

  // Generate unique save ID
  private generateSaveId(): string {
    return `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get game name
  private getGameName(gameId: string): string {
    const gameNames: Record<string, string> = {
      'petal-samurai': 'Petal Samurai',
      'memory-match': 'Memory Match',
      'bubble-girl': 'Bubble Girl',
      'petal-storm-rhythm': 'Petal Storm Rhythm',
      blossomware: 'Blossom-ware',
      'dungeon-of-desire': 'Dungeon of Desire',
      'thigh-coliseum': 'Thigh Colosseum',
      'puzzle-reveal': 'Puzzle Reveal',
    };
    return gameNames[gameId] || 'Unknown Game';
  }

  // Calculate checksum
  private calculateChecksum(save: SaveData): string {
    const data = JSON.stringify(save.data);
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Verify checksum
  private verifyChecksum(save: SaveData): boolean {
    const calculatedChecksum = this.calculateChecksum(save);
    return calculatedChecksum === save.metadata.checksum;
  }

  // Compress data
  private async compressData(data: Record<string, any>): Promise<Record<string, any>> {
    // Simple compression - in a real implementation, you'd use a proper compression library
    const compressed = JSON.stringify(data);
    return { compressed };
  }

  // Decompress data
  private async decompressData(data: Record<string, any>): Promise<Record<string, any>> {
    if (data.compressed) {
      return JSON.parse(data.compressed);
    }
    return data;
  }

  // Save to localStorage
  private saveToLocalStorage(): void {
    try {
      const data = {
        saves: Array.from(this.saves.values()),
        slots: Array.from(this.slots.values()),
        config: this.config,
      };
      localStorage.setItem('otaku_mori_saves', JSON.stringify(data));
    } catch (error) {
      logger.error('Failed to save to localStorage:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Load from localStorage
  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('otaku_mori_saves');
      if (!data) return;

      const parsed = JSON.parse(data);

      if (parsed.saves) {
        parsed.saves.forEach((save: SaveData) => {
          this.saves.set(save.id, save);
        });
      }

      if (parsed.slots) {
        parsed.slots.forEach((slot: SaveSlot) => {
          this.slots.set(slot.id, slot);
        });
      }

      if (parsed.config) {
        Object.assign(this.config, parsed.config);
      }
    } catch (error) {
      logger.error('Failed to load from localStorage:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Set event callbacks
  setOnSaveCreated(callback: (save: SaveData) => void): void {
    this.onSaveCreated = callback;
  }

  setOnSaveUpdated(callback: (save: SaveData) => void): void {
    this.onSaveUpdated = callback;
  }

  setOnSaveDeleted(callback: (saveId: string) => void): void {
    this.onSaveDeleted = callback;
  }

  setOnAutoSave(callback: (save: SaveData) => void): void {
    this.onAutoSave = callback;
  }

  // Cleanup
  dispose(): void {
    this.stopAutoSave();
    this.saveToLocalStorage();
  }
}

// Export utility functions
export const createSaveSystem = (config?: Partial<SaveSystemConfig>) => new SaveSystem(config);
export const formatSaveSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
export const formatPlayTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};
