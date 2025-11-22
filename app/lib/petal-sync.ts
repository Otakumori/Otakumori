/**
 * Petal Sync Client Logic
 *
 * Handles syncing petal balance across devices
 */

export interface SyncResult {
  synced: boolean;
  cloudTotal: number;
  localTotal: number;
  conflict: boolean;
  lastSyncedAt?: string;
}

/**
 * Sync local petals to cloud
 */
export async function syncPetalsToCloud(
  localPetals: number,
  localTransactions?: Array<{
    id: string;
    amount: number;
    source: string;
    timestamp: number;
  }>,
): Promise<SyncResult> {
  try {
    const response = await fetch('/api/v1/petals/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        localBalance: localPetals,
        localTransactions,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.ok) {
      return {
        synced: true,
        cloudTotal: result.data.syncedBalance,
        localTotal: localPetals,
        conflict: result.data.conflict,
        lastSyncedAt: result.data.lastSyncedAt,
      };
    } else {
      throw new Error(result.error || 'Sync failed');
    }
  } catch (error) {
    console.error('Failed to sync petals:', error);
    return {
      synced: false,
      cloudTotal: 0,
      localTotal: localPetals,
      conflict: false,
    };
  }
}

/**
 * Get sync status from localStorage
 */
export function getSyncStatus(): {
  lastSyncedAt: Date | null;
  needsSync: boolean;
} {
  if (typeof window === 'undefined') {
    return { lastSyncedAt: null, needsSync: false };
  }

  try {
    const lastSynced = localStorage.getItem('otm-petals-last-sync');
    if (lastSynced) {
      const lastSyncedDate = new Date(lastSynced);
      const hoursSinceSync = (Date.now() - lastSyncedDate.getTime()) / (1000 * 60 * 60);
      return {
        lastSyncedAt: lastSyncedDate,
        needsSync: hoursSinceSync > 1, // Sync if more than 1 hour old
      };
    }
  } catch (error) {
    console.warn('Failed to read sync status:', error);
  }

  return { lastSyncedAt: null, needsSync: true };
}

/**
 * Save sync status to localStorage
 */
export function saveSyncStatus(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('otm-petals-last-sync', new Date().toISOString());
  } catch (error) {
    console.warn('Failed to save sync status:', error);
  }
}
