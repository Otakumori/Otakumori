 
 
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Flower, TrendingUp, Calendar, Zap, Crown } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { type RewardsConfig } from '@/types/runes';
import { AdminLayout } from '@/components/admin/AdminNav';

interface EditableRewardsConfig extends RewardsConfig {
  // Add any additional fields if needed
}

export default function AdminRewardsPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const [config, setConfig] = useState<EditableRewardsConfig>({
    baseRateCents: 300,
    minPerOrder: 5,
    maxPerOrder: 120,
    streak: {
      enabled: true,
      dailyBonusPct: 0.05,
      maxPct: 0.25,
    },
    seasonal: {
      multiplier: 1.0,
    },
    daily: {
      softCap: 200,
      postSoftRatePct: 0.5,
      hardCap: 400,
    },
    firstPurchaseBonus: 20,
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
      loadRewardsConfig();
    }
  }, [isLoaded, isSignedIn, router]);

  const loadRewardsConfig = async () => {
    try {
      const response = await fetch('/api/admin/rewards');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig(data.config);
        }
      }
    } catch (error) {
      console.error('Failed to load rewards config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Rewards configuration saved successfully!' });
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to save configuration' });
      }
    } catch (error) {
      console.error('Failed to save rewards config:', error);
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

  const calculateExampleReward = (orderAmount: number) => {
    let petals = Math.ceil(orderAmount / config.baseRateCents);

    // Apply seasonal multiplier
    petals = Math.round(petals * config.seasonal.multiplier);

    // Add first purchase bonus (assuming it's first purchase)
    petals += config.firstPurchaseBonus;

    // Apply streak bonus (assuming 3-day streak)
    if (config.streak.enabled) {
      const streakBonus = Math.min(3 * config.streak.dailyBonusPct, config.streak.maxPct);
      petals += Math.round(petals * streakBonus);
    }

    // Clamp to order limits
    petals = Math.max(config.minPerOrder, Math.min(config.maxPerOrder, petals));

    // Apply daily caps (assuming 100 petals already earned today)
    const todayEarned = 100;
    if (todayEarned >= config.daily.softCap) {
      const remainingSoft = Math.max(0, config.daily.softCap - todayEarned);
      const postSoftRequested = Math.max(0, petals - remainingSoft);
      const postSoftGranted = Math.round(postSoftRequested * config.daily.postSoftRatePct);
      petals = remainingSoft + postSoftGranted;
    }

    if (todayEarned + petals > config.daily.hardCap) {
      petals = Math.max(0, config.daily.hardCap - todayEarned);
    }

    return petals;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-32 w-32 animate-spin rounded-full border-b-2 border-pink-500"></div>
          <p className="text-lg text-pink-300">Loading rewards system...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Rewards Configuration</h1>
          <p className="text-xl text-neutral-300">
            Configure petal rewards, streaks, and daily caps
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
          {/* Basic Rewards */}
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
              <Flower className="mr-2 h-6 w-6 text-pink-400" />
              Basic Rewards
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Base Rate (cents per petal)
                </label>
                <input
                  type="number"
                  value={config.baseRateCents}
                  onChange={(e) => updateConfig('baseRateCents', parseInt(e.target.value) || 300)}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="100"
                  max="1000"
                  step="50"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  1 petal per ${(config.baseRateCents / 100).toFixed(2)} spent
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-300">
                    Min per Order
                  </label>
                  <input
                    type="number"
                    value={config.minPerOrder}
                    onChange={(e) => updateConfig('minPerOrder', parseInt(e.target.value) || 5)}
                    className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                    min="1"
                    max="50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-300">
                    Max per Order
                  </label>
                  <input
                    type="number"
                    value={config.maxPerOrder}
                    onChange={(e) => updateConfig('maxPerOrder', parseInt(e.target.value) || 120)}
                    className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                    min="50"
                    max="500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  First Purchase Bonus
                </label>
                <input
                  type="number"
                  value={config.firstPurchaseBonus}
                  onChange={(e) =>
                    updateConfig('firstPurchaseBonus', parseInt(e.target.value) || 20)
                  }
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Streak System */}
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
              <TrendingUp className="mr-2 h-6 w-6 text-blue-400" />
              Streak System
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="streakEnabled"
                  checked={config.streak.enabled}
                  onChange={(e) => updateConfig('streak.enabled', e.target.checked)}
                  className="rounded border-neutral-600 bg-neutral-800 text-blue-500"
                />
                <label htmlFor="streakEnabled" className="text-sm text-neutral-300">
                  Enable daily streak bonuses
                </label>
              </div>

              {config.streak.enabled && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      Daily Bonus Percentage
                    </label>
                    <input
                      type="number"
                      value={config.streak.dailyBonusPct * 100}
                      onChange={(e) =>
                        updateConfig(
                          'streak.dailyBonusPct',
                          (parseFloat(e.target.value) || 0) / 100,
                        )
                      }
                      className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                      min="0"
                      max="20"
                      step="1"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      {(config.streak.dailyBonusPct * 100).toFixed(1)}% bonus per consecutive day
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-300">
                      Maximum Streak Bonus
                    </label>
                    <input
                      type="number"
                      value={config.streak.maxPct * 100}
                      onChange={(e) =>
                        updateConfig('streak.maxPct', (parseFloat(e.target.value) || 0) / 100)
                      }
                      className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                      min="0"
                      max="100"
                      step="5"
                    />
                    <p className="mt-1 text-xs text-neutral-500">
                      Cap at {(config.streak.maxPct * 100).toFixed(0)}% total bonus
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Daily Caps */}
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
              <Calendar className="mr-2 h-6 w-6 text-green-400" />
              Daily Caps
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">Soft Cap</label>
                <input
                  type="number"
                  value={config.daily.softCap}
                  onChange={(e) => updateConfig('daily.softCap', parseInt(e.target.value) || 200)}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="50"
                  max="500"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Full rate until this amount is reached
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Post-Soft Cap Rate (%)
                </label>
                <input
                  type="number"
                  value={config.daily.postSoftRatePct * 100}
                  onChange={(e) =>
                    updateConfig('daily.postSoftRatePct', (parseFloat(e.target.value) || 0) / 100)
                  }
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="10"
                  max="100"
                  step="10"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  {(config.daily.postSoftRatePct * 100).toFixed(0)}% rate after soft cap
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">Hard Cap</label>
                <input
                  type="number"
                  value={config.daily.hardCap}
                  onChange={(e) => updateConfig('daily.hardCap', parseInt(e.target.value) || 400)}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="100"
                  max="1000"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  No more petals after this daily total
                </p>
              </div>
            </div>
          </div>

          {/* Seasonal & Examples */}
          <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6">
            <h2 className="mb-6 flex items-center text-2xl font-bold text-white">
              <Zap className="mr-2 h-6 w-6 text-yellow-400" />
              Seasonal & Examples
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-300">
                  Seasonal Multiplier
                </label>
                <input
                  type="number"
                  value={config.seasonal.multiplier}
                  onChange={(e) =>
                    updateConfig('seasonal.multiplier', parseFloat(e.target.value) || 1.0)
                  }
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  min="0.5"
                  max="3.0"
                  step="0.1"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  {(config.seasonal.multiplier * 100).toFixed(0)}% of normal rate
                </p>
              </div>

              {/* Example Calculation */}
              <div className="rounded-lg border border-neutral-600 bg-neutral-800/50 p-4">
                <h3 className="mb-3 flex items-center text-lg font-semibold text-white">
                  <Crown className="mr-2 h-5 w-5 text-yellow-400" />
                  Example Calculation
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">$25 Order:</span>
                    <span className="text-white">{calculateExampleReward(2500)} petals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">$50 Order:</span>
                    <span className="text-white">{calculateExampleReward(5000)} petals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">$100 Order:</span>
                    <span className="text-white">{calculateExampleReward(10000)} petals</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-neutral-500">
                  Assumes first purchase + 3-day streak + 100 petals already earned today
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-12 text-center">
          <button
            onClick={saveConfig}
            disabled={saving}
            className="mx-auto flex items-center rounded-lg bg-pink-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-pink-700 disabled:bg-pink-800"
          >
            <Save className="mr-2 h-5 w-5" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
