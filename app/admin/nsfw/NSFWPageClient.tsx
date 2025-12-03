'use client';

import { logger } from '@/app/lib/logger';
import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

interface NSFWStats {
  totalNSFWUsers: number;
  totalNSFWItems: number;
  globalNSFWEnabled: boolean;
}

export default function NSFWPageClient() {
  const [stats, setStats] = useState<NSFWStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/nsfw/stats', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data?.ok && data?.data) {
            setStats(data.data);
            setGlobalEnabled(data.data.globalNSFWEnabled);
          }
        }
      } catch (err) {
        logger.error('Failed to load NSFW settings', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const handleToggleGlobal = async () => {
    const newValue = !globalEnabled;
    try {
      const response = await fetch('/api/admin/nsfw/global', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newValue }),
      });
      const data = await response.json();
      if (data?.ok) {
        setGlobalEnabled(newValue);
        setMsg('Global NSFW setting updated');
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg(data?.error || 'Failed to update');
      }
    } catch (err) {
      setMsg('Failed to update global setting');
      logger.error('Failed to save NSFW settings', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-neutral-400">Loading NSFW stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-red-400">Failed to load NSFW stats</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-3xl font-bold text-white flex items-center gap-2">
        <Shield className="h-8 w-8 text-red-400" />
        NSFW Controls
      </h1>
      <p className="mb-6 text-neutral-300">Global NSFW toggle, user-level overrides, and stats</p>

      {msg && (
        <div className="mb-4 rounded-lg bg-pink-500/20 border border-pink-500/50 px-4 py-2 text-pink-200">
          {msg}
        </div>
      )}

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">NSFW Users</div>
          <div className="text-2xl font-bold text-pink-400">{stats.totalNSFWUsers}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">NSFW Items</div>
          <div className="text-2xl font-bold text-red-400">{stats.totalNSFWItems}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">Global Status</div>
          <div className="text-2xl font-bold text-white">
            {globalEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>

      {/* Global Toggle */}
      <div className="mb-6 rounded-xl border border-white/10 bg-black/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Global NSFW Visibility</h2>
        <p className="mb-4 text-sm text-neutral-400">
          When disabled, all NSFW content is hidden site-wide, regardless of user preferences.
        </p>
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleGlobal}
            className={`rounded-lg px-6 py-3 font-semibold transition-colors ${
              globalEnabled
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {globalEnabled ? 'Disable Globally' : 'Enable Globally'}
          </button>
          <span className="text-sm text-neutral-400">
            Current:{' '}
            <span className="font-medium text-white">{globalEnabled ? 'Enabled' : 'Disabled'}</span>
          </span>
        </div>
      </div>

      {/* User Override Note */}
      <div className="rounded-xl border border-white/10 bg-black/50 p-4">
        <p className="text-sm text-neutral-400">
          User-level overrides can be managed by editing individual user records. For now, this is a
          read-only view. Future updates will allow forcing NSFW disabled for specific users.
        </p>
      </div>
    </div>
  );
}
