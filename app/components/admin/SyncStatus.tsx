'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface SyncStats {
  totalProducts: number;
  syncedProducts: number;
  staleProducts: number;
  lastSyncTime: string | null;
  isStale: boolean;

export function SyncStatus() {
  const [stats, setStats] = useState<SyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/v1/printify/sync-status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch sync status');
      }

      const result = await response.json();
      if (result.ok && result.data) {
        setStats(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch sync status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      const response = await fetch('/api/v1/printify/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'products' }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger sync');
      }

      const result = await response.json();
      if (result.ok) {
        // Refresh stats after sync
        setTimeout(() => {
          fetchStats();
        }, 2000);
      } else {
        throw new Error(result.error || 'Sync failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="text-white/60">Loading sync status...</div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
        <div className="text-red-400">Error: {error}</div>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const syncStatusIcon = stats.isStale ? (
    <AlertCircle className="w-5 h-5 text-yellow-400" />
  ) : (
    <CheckCircle2 className="w-5 h-5 text-green-400" />
  );

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Product Sync Status</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 text-white/60 hover:text-white transition-colors disabled:opacity-50"
          aria-label="Refresh status"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center gap-3">
          {syncStatusIcon}
          <div>
            <div className="text-white font-medium">
              {stats.isStale ? 'Sync is stale' : 'Sync is fresh'}
            </div>
            <div className="text-white/60 text-sm">
              Last synced: {formatDate(stats.lastSyncTime)}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-white/60 text-sm mb-1">Total Products</div>
            <div className="text-2xl font-bold text-white">{stats.totalProducts}</div>
          </div>
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-white/60 text-sm mb-1">Synced</div>
            <div className="text-2xl font-bold text-green-400">{stats.syncedProducts}</div>
          </div>
          <div className="bg-black/20 rounded-lg p-4">
            <div className="text-white/60 text-sm mb-1">Stale</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.staleProducts}</div>
          </div>
        </div>

        {/* Manual Sync Button */}
        <button
          onClick={triggerSync}
          disabled={syncing}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
        >
          {syncing ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Clock className="w-5 h-5" />
              Trigger Manual Sync
            </>
          )}
        </button>
      </div>
    </div>
  );
}

