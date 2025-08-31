/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'events' | 'gameplay' | 'economy' | 'admin';
}

const DEFAULT_FLAGS: FeatureFlag[] = [
  {
    id: 'event_hanami',
    name: 'Hanami Event',
    description: 'Enable cherry blossom festival content and rewards',
    enabled: true,
    category: 'events',
  },
  {
    id: 'crit_rate_boost',
    name: 'Critical Rate Boost',
    description: 'Increase critical hit chance in mini-games by 15%',
    enabled: false,
    category: 'gameplay',
  },
  {
    id: 'daily_limit_removal',
    name: 'Remove Daily Limits',
    description: 'Allow unlimited petal earning per day',
    enabled: false,
    category: 'economy',
  },
  {
    id: 'admin_debug_mode',
    name: 'Admin Debug Mode',
    description: 'Show debug info and testing tools',
    enabled: false,
    category: 'admin',
  },
];

export default function AdminFlagsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [flags, setFlags] = useState<FeatureFlag[]>(DEFAULT_FLAGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user has admin role
    const isAdmin = user.publicMetadata?.role === 'admin';
    if (!isAdmin) {
      router.push('/');
      return;
    }

    loadFlags();
  }, [user, isLoaded, router]);

  const loadFlags = async () => {
    try {
      const response = await fetch('/api/admin/flags');
      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setFlags(data.flags);
        }
      }
    } catch (error) {
      console.error('Failed to load flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (flagId: string) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagId, action: 'toggle' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setFlags((prev) =>
            prev.map((f) => (f.id === flagId ? { ...f, enabled: !f.enabled } : f)),
          );
        }
      }
    } catch (error) {
      console.error('Failed to toggle flag:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetFlags = async () => {
    if (!confirm('Reset all flags to defaults? This cannot be undone.')) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setFlags(DEFAULT_FLAGS);
        }
      }
    } catch (error) {
      console.error('Failed to reset flags:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const groupedFlags = flags.reduce(
    (acc, flag) => {
      if (!acc[flag.category]) acc[flag.category] = [];
      acc[flag.category].push(flag);
      return acc;
    },
    {} as Record<string, FeatureFlag[]>,
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pink-400">Feature Flags</h1>
          <p className="text-neutral-400 mt-2">Control system features and experimental content</p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={resetFlags}
            disabled={saving}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={loadFlags}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>

        {Object.entries(groupedFlags).map(([category, categoryFlags]) => (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 capitalize">
              {category.replace('_', ' ')}
            </h2>
            <div className="grid gap-4">
              {categoryFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="bg-neutral-900 rounded-lg p-4 border border-neutral-800"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{flag.name}</h3>
                      <p className="text-sm text-neutral-400 mt-1">{flag.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={flag.enabled}
                        onChange={() => toggleFlag(flag.id)}
                        disabled={saving}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8 p-4 bg-neutral-900 rounded-lg border border-neutral-800">
          <h3 className="font-medium text-white mb-2">Flag Status</h3>
          <div className="text-sm text-neutral-400">
            <p>
              Active flags: {flags.filter((f) => f.enabled).length} / {flags.length}
            </p>
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
