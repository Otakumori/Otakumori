'use client';

/**
 * Admin Console Client Component
 *
 * Client-side UI for admin console with feature flag toggles and system status.
 */

import { logger } from '@/app/lib/logger';
import { useState, useEffect } from 'react';
import { OmButton, OmCard, OmPanel, OmTag } from '@/app/components/ui/om';
import type { EffectiveFeatureFlags } from '@/app/lib/config/featureFlags.server';

interface AdminConsoleClientProps {
  userId?: string;
  userEmail?: string | null; // Reserved for future use (e.g., audit logs)
}

interface FeatureFlagDisplay {
  key: keyof EffectiveFeatureFlags;
  label: string;
  description: string;
  effectiveValue: boolean;
  source: 'default' | 'override';
  dbValue?: boolean | null;
}

interface SystemStatus {
  name: string;
  configured: boolean;
}

export default function AdminConsoleClient({ userId }: AdminConsoleClientProps) {
  const [flags, setFlags] = useState<FeatureFlagDisplay[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Fetch effective flags and DB settings
      const response = await fetch('/api/v1/admin/feature-flags');
      if (!response.ok) {
        throw new Error('Failed to load feature flags');
      }

      const result = await response.json();
      if (!result.ok) {
        throw new Error(result.error || 'Failed to load data');
      }

      const data = result.data;

      // Transform flags for display
      const flagDisplays: FeatureFlagDisplay[] = [
        {
          key: 'AVATARS_ENABLED',
          label: 'Enable Avatars Globally',
          description: 'Enable avatar system across the site',
          effectiveValue: data.effectiveFlags.AVATARS_ENABLED,
          source: data.dbSettings.AVATARS_ENABLED ? 'override' : 'default',
          dbValue: data.dbSettings.AVATARS_ENABLED?.boolValue,
        },
        {
          key: 'REQUIRE_AUTH_FOR_MINI_GAMES',
          label: 'Require Sign-In for Mini-Games',
          description: 'Require users to sign in before playing mini-games',
          effectiveValue: data.effectiveFlags.REQUIRE_AUTH_FOR_MINI_GAMES,
          source: data.dbSettings.REQUIRE_AUTH_FOR_MINI_GAMES ? 'override' : 'default',
          dbValue: data.dbSettings.REQUIRE_AUTH_FOR_MINI_GAMES?.boolValue,
        },
        {
          key: 'NSFW_AVATARS_ENABLED',
          label: 'Enable NSFW Avatars & Cosmetics',
          description: 'Enable NSFW avatar layers and cosmetics',
          effectiveValue: data.effectiveFlags.NSFW_AVATARS_ENABLED,
          source: data.dbSettings.NSFW_AVATARS_ENABLED ? 'override' : 'default',
          dbValue: data.dbSettings.NSFW_AVATARS_ENABLED?.boolValue,
        },
      ];

      setFlags(flagDisplays);

      // System status
      setSystemStatus(data.systemStatus || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      logger.error('Failed to load admin data', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }

  async function toggleFlag(key: string, currentValue: boolean) {
    if (!userId) {
      setError('User ID required to update settings');
      return;
    }

    try {
      setUpdating(key);
      setError(null);

      const response = await fetch('/api/v1/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          boolValue: !currentValue,
          updatedBy: userId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update setting');
      }

      // Reload data
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting');
      logger.error('Failed to execute command', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse text-zinc-400">Loading admin console...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <OmPanel className="border-red-500/50 bg-red-500/10">
          <p className="text-red-200">{error}</p>
        </OmPanel>
      )}

      {/* Content & NSFW Section */}
      <OmPanel>
        <h2 className="text-2xl font-semibold text-white mb-4">Content & NSFW</h2>
        <div className="space-y-4">
          {flags.map((flag) => (
            <OmCard key={flag.key} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{flag.label}</h3>
                    <OmTag variant="status" status={flag.effectiveValue ? 'active' : 'coming-soon'}>
                      {flag.effectiveValue ? 'On' : 'Off'}
                    </OmTag>
                    {flag.source === 'override' && <OmTag variant="category">DB Override</OmTag>}
                    {flag.source === 'default' && (
                      <span className="text-xs text-zinc-400">Default</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 mb-3">{flag.description}</p>
                </div>
                <OmButton
                  variant="primary"
                  size="md"
                  onClick={() => toggleFlag(flag.key, flag.effectiveValue)}
                  disabled={updating === flag.key || !userId}
                >
                  {updating === flag.key
                    ? 'Updating...'
                    : flag.effectiveValue
                      ? 'Disable'
                      : 'Enable'}
                </OmButton>
              </div>
            </OmCard>
          ))}
        </div>
      </OmPanel>

      {/* System Status Section */}
      <OmPanel>
        <h2 className="text-2xl font-semibold text-white mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {systemStatus.map((status) => (
            <div
              key={status.name}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <span className="text-white">{status.name}</span>
              <OmTag variant="status" status={status.configured ? 'active' : 'coming-soon'}>
                {status.configured ? 'Configured' : 'Missing'}
              </OmTag>
            </div>
          ))}
        </div>
      </OmPanel>

      {/* Economy Section (Read-only) */}
      <OmPanel>
        <h2 className="text-2xl font-semibold text-white mb-4">Economy (Read-only)</h2>
        <p className="text-zinc-300 text-sm mb-4">
          Petal economy settings are configured in{' '}
          <code className="text-pink-300">app/config/petalTuning.ts</code>. Live tuning will be
          available in a future update.
        </p>
        <div className="text-sm text-zinc-400">
          <p>• Daily earning caps: Games (2000), Achievements (3000), Daily Bonus (100)</p>
          <p>
            • Game reward ranges: Short (40-80 win, 15-30 lose), Medium (90-150 win, 40-70 lose),
            Long (140-220 win, 70-120 lose)
          </p>
          <p>
            • Achievement tiers: Small (100), Progress (250-500), Milestone (800-1500), Ultra
            (2000-3000)
          </p>
        </div>
      </OmPanel>
    </div>
  );
}
