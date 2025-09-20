'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

type FlagCategory = 'events' | 'gameplay' | 'economy' | 'admin';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: FlagCategory;
}

interface FlagsResponse {
  ok: boolean;
  flags?: FeatureFlag[];
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

  const loadFlags = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/flags', { cache: 'no-store' });
      if (!response.ok) return;

      const data = (await response.json()) as FlagsResponse;
      if (data.ok && Array.isArray(data.flags)) {
        setFlags(data.flags);
      }
    } catch (error) {
      console.error('Failed to load flags', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    const role = user.publicMetadata?.role as string | undefined;
    if (role !== 'admin') {
      router.replace('/');
      return;
    }

    void loadFlags();
  }, [isLoaded, loadFlags, router, user]);

  const toggleFlag = useCallback(async (flagId: string) => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flagId, action: 'toggle' }),
      });

      if (!response.ok) return;
      const data = (await response.json()) as FlagsResponse;
      if (!data.ok) return;

      setFlags((current) =>
        current.map((flag) => (flag.id === flagId ? { ...flag, enabled: !flag.enabled } : flag)),
      );
    } catch (error) {
      console.error('Failed to toggle flag', error);
    } finally {
      setSaving(false);
    }
  }, []);

  const resetFlags = useCallback(async () => {
    if (!window.confirm('Reset all flags to defaults? This cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });

      if (!response.ok) return;
      const data = (await response.json()) as FlagsResponse;
      if (!data.ok) return;

      setFlags(DEFAULT_FLAGS);
    } catch (error) {
      console.error('Failed to reset flags', error);
    } finally {
      setSaving(false);
    }
  }, []);

  const groupedFlags = useMemo(() => {
    return flags.reduce<Record<FlagCategory, FeatureFlag[]>>(
      (accumulator, flag) => {
        accumulator[flag.category] ||= [];
        accumulator[flag.category].push(flag);
        return accumulator;
      },
      {
        admin: [],
        economy: [],
        events: [],
        gameplay: [],
      },
    );
  }, [flags]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-pink-500" />
          <p className="mt-4 text-neutral-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-pink-400">Feature Flags</h1>
          <p className="mt-2 text-neutral-400">Control system features and experimental content</p>
        </header>

        <div className="mb-6 flex gap-4">
          <button
            type="button"
            onClick={resetFlags}
            disabled={saving}
            className="rounded-lg bg-red-600 px-4 py-2 transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            Reset to Defaults
          </button>
          <button
            type="button"
            onClick={() => loadFlags()}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {Object.entries(groupedFlags).map(([category, categoryFlags]) => (
          <section key={category} className="mb-8">
            <h2 className="mb-4 text-xl font-semibold capitalize text-white">
              {category.replace('_', ' ')}
            </h2>
            <div className="grid gap-4">
              {categoryFlags.map((flag) => (
                <article
                  key={flag.id}
                  className="rounded-lg border border-neutral-800 bg-neutral-900 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{flag.name}</h3>
                      <p className="mt-1 text-sm text-neutral-400">{flag.description}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={flag.enabled}
                        onChange={() => toggleFlag(flag.id)}
                        disabled={saving}
                        className="peer sr-only"
                      />
                      <span className="after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer h-6 w-11 rounded-full bg-neutral-700 peer-checked:bg-pink-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-800 peer-checked:after:translate-x-full peer-checked:after:border-white" />
                    </label>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        <footer className="mt-8 rounded-lg border border-neutral-800 bg-neutral-900 p-4">
          <h3 className="mb-2 font-medium text-white">Flag Status</h3>
          <div className="text-sm text-neutral-400">
            <p>
              Active flags: {flags.filter((flag) => flag.enabled).length} / {flags.length}
            </p>
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
