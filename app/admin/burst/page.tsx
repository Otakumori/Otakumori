// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Zap, Clock, BarChart3, Settings, Sparkles } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { type BurstConfig } from '@/types/runes';
import { AdminLayout } from '@/components/admin/AdminNav';

interface EditableBurstConfig extends BurstConfig {
  // Add any additional fields if needed
}

export default function AdminBurstPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [config, setConfig] = useState<EditableBurstConfig>({
    enabled: true,
    minCooldownSec: 15,
    maxPerMinute: 3,
    particleCount: {
      small: 20,
      medium: 40,
      large: 80,
    },
    rarityWeights: {
      small: 0.6,
      medium: 0.3,
      large: 0.1,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
      return;
    }

    if (isSignedIn) {
      loadBurstConfig();
    }
  }, [isLoaded, isSignedIn, router]);

  const loadBurstConfig = async () => {
    try {
      const response = await fetch('/api/admin/burst');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      console.error('Failed to load burst config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/burst', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Burst configuration saved successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to save configuration' });
      }
    } catch (error) {
      console.error('Failed to save burst config:', error);
      setMessage({ type: 'error', text: 'Failed to save configuration' });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string, value: any) => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current: any = newConfig;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const validateRarityWeights = () => {
    const total =
      config.rarityWeights.small + config.rarityWeights.medium + config.rarityWeights.large;
    return Math.abs(total - 1.0) < 0.01; // Allow small floating point errors
  };

  const getRarityWeightsStatus = () => {
    const total =
      config.rarityWeights.small + config.rarityWeights.medium + config.rarityWeights.large;
    if (Math.abs(total - 1.0) < 0.01) {
      return { valid: true, message: 'Weights total 100%' };
    } else {
      return {
        valid: false,
        message: `Weights total ${(total * 100).toFixed(1)}% (should be 100%)`,
      };
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-32 w-32 animate-spin rounded-full border-b-2 border-pink-500"></div>
          <p className="text-lg text-pink-300">Loading burst system...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Burst System Configuration</h1>
          <p className="text-xl text-neutral-300">
            Configure petal burst effects, cooldowns, and particle systems
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 rounded-lg p-4 ${
              message.type === 'success'
                ? 'border border-green-400/30 bg-green-500/20 text-green-300'
                : 'border border-red-400/30 bg-red-500/20 text-red-300'
            }`}
          >
            {message.text}
          </motion.div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Basic Settings */}
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
              <Settings className="mr-2 h-6 w-6 text-blue-400" />
              Basic Settings
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="burstEnabled"
                  checked={config.enabled}
                  onChange={(e) => updateConfig('enabled', e.target.checked)}
                  className="rounded border-neutral-600 bg-neutral-800 text-blue-500"
                />
                <label htmlFor="burstEnabled" className="text-sm text-neutral-300">
                  Enable burst system
                </label>
              </div>

              {config.enabled && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      Minimum Cooldown (seconds)
                    </label>
                    <input
                      type="number"
                      value={config.minCooldownSec}
                      onChange={(e) =>
                        updateConfig('minCooldownSec', parseInt(e.target.value) || 15)
                      }
                      className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                      min="5"
                      max="60"
                      step="5"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Minimum time between bursts for any user
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      Max Bursts per Minute
                    </label>
                    <input
                      type="number"
                      value={config.maxPerMinute}
                      onChange={(e) => updateConfig('maxPerMinute', parseInt(e.target.value) || 3)}
                      className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                      min="1"
                      max="10"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Maximum bursts any user can trigger per minute
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Particle Counts */}
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
              <Sparkles className="mr-2 h-6 w-6 text-purple-400" />
              Particle Counts
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Small Burst Particles
                </label>
                <input
                  type="number"
                  value={config.particleCount.small}
                  onChange={(e) =>
                    updateConfig('particleCount.small', parseInt(e.target.value) || 20)
                  }
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="10"
                  max="100"
                  step="5"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Particles for small bursts (20+ petals)
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Medium Burst Particles
                </label>
                <input
                  type="number"
                  value={config.particleCount.medium}
                  onChange={(e) =>
                    updateConfig('particleCount.medium', parseInt(e.target.value) || 40)
                  }
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="20"
                  max="200"
                  step="10"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Particles for medium bursts (40+ petals)
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Large Burst Particles
                </label>
                <input
                  type="number"
                  value={config.particleCount.large}
                  onChange={(e) =>
                    updateConfig('particleCount.large', parseInt(e.target.value) || 80)
                  }
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="40"
                  max="400"
                  step="20"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Particles for large bursts (80+ petals)
                </p>
              </div>
            </div>
          </div>

          {/* Rarity Weights */}
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
              <BarChart3 className="mr-2 h-6 w-6 text-green-400" />
              Rarity Weights
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Small Burst Weight
                </label>
                <input
                  type="number"
                  value={config.rarityWeights.small * 100}
                  onChange={(e) =>
                    updateConfig('rarityWeights.small', (parseFloat(e.target.value) || 0) / 100)
                  }
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="0"
                  max="100"
                  step="5"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  {(config.rarityWeights.small * 100).toFixed(0)}% chance of small burst
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Medium Burst Weight
                </label>
                <input
                  type="number"
                  value={config.rarityWeights.medium * 100}
                  onChange={(e) =>
                    updateConfig('rarityWeights.medium', (parseFloat(e.target.value) || 0) / 100)
                  }
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="0"
                  max="100"
                  step="5"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  {(config.rarityWeights.medium * 100).toFixed(0)}% chance of medium burst
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Large Burst Weight
                </label>
                <input
                  type="number"
                  value={config.rarityWeights.large * 100}
                  onChange={(e) =>
                    updateConfig('rarityWeights.large', (parseFloat(e.target.value) || 0) / 100)
                  }
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="0"
                  max="100"
                  step="5"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  {(config.rarityWeights.large * 100).toFixed(0)}% chance of large burst
                </p>
              </div>

              {/* Weight validation status */}
              <div
                className={`mt-4 rounded-lg border p-3 ${
                  getRarityWeightsStatus().valid
                    ? 'border-green-400/30 bg-green-500/20'
                    : 'border-red-400/30 bg-red-500/20'
                }`}
              >
                <p
                  className={`text-sm ${
                    getRarityWeightsStatus().valid ? 'text-green-300' : 'text-red-300'
                  }`}
                >
                  {getRarityWeightsStatus().message}
                </p>
              </div>
            </div>
          </div>

          {/* Preview & Examples */}
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
              <Zap className="mr-2 h-6 w-6 text-yellow-400" />
              Preview & Examples
            </h2>

            <div className="space-y-4">
              {/* Burst trigger examples */}
              <div className="rounded-lg border border-neutral-600 bg-neutral-800/50 p-4">
                <h3 className="mb-3 text-lg font-semibold text-white">Burst Triggers</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Purchase Bonus:</span>
                    <span className="text-white">Always</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">First Purchase:</span>
                    <span className="text-white">Always</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Combo Reveal:</span>
                    <span className="text-white">Always</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Daily Login:</span>
                    <span className="text-white">Configurable</span>
                  </div>
                </div>
              </div>

              {/* Performance info */}
              <div className="rounded-lg border border-neutral-600 bg-neutral-800/50 p-4">
                <h3 className="mb-3 text-lg font-semibold text-white">Performance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Max Particles:</span>
                    <span className="text-white">{config.particleCount.large}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Cooldown:</span>
                    <span className="text-white">{config.minCooldownSec}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Rate Limit:</span>
                    <span className="text-white">{config.maxPerMinute}/min</span>
                  </div>
                </div>
              </div>

              {/* Accessibility note */}
              <div className="rounded-lg border border-blue-400/30 bg-blue-500/20 p-3">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> All bursts respect user's{' '}
                  <code>prefers-reduced-motion</code> setting
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-12 text-center">
          <button
            onClick={saveConfig}
            disabled={saving || !validateRarityWeights()}
            className="mx-auto flex items-center rounded-lg bg-pink-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-pink-700 disabled:bg-pink-800"
          >
            <Save className="mr-2 h-5 w-5" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>

          {!validateRarityWeights() && (
            <p className="mt-2 text-sm text-red-400">Please fix rarity weights before saving</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
