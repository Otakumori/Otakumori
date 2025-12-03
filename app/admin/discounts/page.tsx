'use client';

import { Skeleton } from '@/app/components/ui/Skeleton';
import { logger } from '@/app/lib/logger';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminNav';
import type { DiscountType } from '@prisma/client';

interface DiscountReward {
  id: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  amountOff: number | null;
  percentOff: number | null;
  petalCost: number;
  nsfwOnly: boolean;
  requiresAchievementId: string | null;
  minSpendCents: number | null;
  maxUsesPerUser: number | null;
  maxTotalUses: number | null;
  validityDays: number;
  enabled: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  stats?: {
    totalPurchased: number;
    totalRedeemed: number;
    activeCount: number;
  };
}

);
}
export default function AdminDiscountsPage() {
  const [rewards, setRewards] = useState<DiscountReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<DiscountReward> | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Array<{ id: string; name: string }>>([]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/discounts', { cache: 'no-store' });
      const j = await r.json();
      if (j?.ok) {
        setRewards(j.data.rewards);
      }
    } catch (err) {
      logger.error('Failed to load discount rewards', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  };

  const loadAchievements = async () => {
    try {
      const r = await fetch('/api/admin/achievements', { cache: 'no-store' });
      const j = await r.json();
      if (j?.ok && j.data?.achievements) {
        setAchievements(j.data.achievements);
      }
    } catch (err) {
      logger.error('Failed to load achievements', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    }
  };

  useEffect(() => {
    load();
    loadAchievements();
  }, []);

  const onSave = async () => {
    if (!editing) return;
    setMsg(null);

    try {
      const r = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editing,
          startsAt: editing.startsAt ? new Date(editing.startsAt).toISOString() : null,
          endsAt: editing.endsAt ? new Date(editing.endsAt).toISOString() : null,
        }),
      });
      const j = await r.json();
      if (j?.ok) {
        setEditing(null);
        load();
        setMsg('Saved');
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg(j?.error || 'Save failed');
      }
    } catch (err) {
      setMsg('Save failed');
      logger.error('Error saving discount reward', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Are you sure you want to disable this discount reward?')) return;

    try {
      const r = await fetch(`/api/admin/discounts?id=${id}`, {
        method: 'DELETE',
      });
      const j = await r.json();
      if (j?.ok) {
        load();
        setMsg('Disabled');
        setTimeout(() => setMsg(null), 3000);
      } else {
        setMsg(j?.error || 'Delete failed');
      }
    } catch (err) {
      setMsg('Delete failed');
      logger.error('Error deleting discount reward', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="mb-1 text-3xl font-bold text-white">Discount Rewards</h1>
        <p className="mb-4 text-neutral-300">
          Manage petal-purchased discount vouchers. Users can unlock these with petals and use them
          at checkout.
        </p>

        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() =>
              setEditing({
                name: '',
                description: '',
                discountType: 'PERCENT',
                percentOff: 10,
                petalCost: 1000,
                nsfwOnly: false,
                validityDays: 30,
                enabled: true,
              })
            }
            className="rounded bg-pink-600 px-4 py-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            aria-label="Create new discount reward"
          >
            New Discount Reward
          </button>
          <button
            onClick={load}
            className="rounded border border-white/20 px-3 py-2 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            aria-label="Refresh discounts"
          >
            Refresh
          </button>
          {msg && (
            <span className="text-xs text-neutral-300" role="status" aria-live="polite">
              {msg}
            </span>
          )}
        </div>

        {loading ? (
    <Skeleton />
        ) : rewards.length === 0 ? (
          <div className="rounded-lg border border-white/15 bg-white/5 p-3 text-sm text-zinc-300">
            No discount rewards yet. Create one to get started.
          </div>
        ) : (
          <div className="grid gap-3" role="list">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className={`rounded-xl border border-white/10 bg-black/50 p-4 ${
                  !reward.enabled ? 'opacity-50' : ''
                }`}
                role="listitem"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 text-white/90">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="font-semibold">{reward.name}</span>
                      {!reward.enabled && (
                        <span className="rounded bg-neutral-700 px-2 py-0.5 text-xs text-neutral-300">
                          Disabled
                        </span>
                      )}
                      {reward.nsfwOnly && (
                        <span className="rounded bg-pink-700 px-2 py-0.5 text-xs text-pink-200">
                          NSFW Only
                        </span>
                      )}
                    </div>
                    {reward.description && (
                      <div className="mb-2 text-sm text-neutral-400">{reward.description}</div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400 sm:grid-cols-4">
                      <div>
                        <span className="font-medium">Type:</span>{' '}
                        {reward.discountType === 'PERCENT'
                          ? `${reward.percentOff}% off`
                          : `$${(reward.amountOff || 0) / 100} off`}
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span>{' '}
                        {reward.petalCost.toLocaleString()} petals
                      </div>
                      <div>
                        <span className="font-medium">Valid:</span> {reward.validityDays} days
                      </div>
                      {reward.minSpendCents && (
                        <div>
                          <span className="font-medium">Min:</span> $
                          {(reward.minSpendCents / 100).toFixed(2)}
                        </div>
                      )}
                    </div>
                    {reward.stats && (
                      <div className="mt-2 text-xs text-neutral-500">
                        Purchased: {reward.stats.totalPurchased} | Redeemed:{' '}
                        {reward.stats.totalRedeemed} | Active: {reward.stats.activeCount}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <button
                      onClick={() => setEditing(reward)}
                      className="rounded border border-white/20 px-3 py-1 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                      aria-label={`Edit ${reward.name}`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(reward.id)}
                      className="rounded border border-red-500/30 px-3 py-1 text-red-400 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      aria-label={`Delete ${reward.name}`}
                    >
                      Disable
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="mt-6 max-w-3xl rounded-xl border border-white/10 bg-black/60 p-6">
            <h2 className="mb-4 text-lg font-semibold text-pink-200">
              {editing.id ? 'Edit' : 'New'} Discount Reward
            </h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm text-neutral-300">
                  Name *
                  <input
                    value={editing.name || ''}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Discount reward name"
                  />
                </label>
                <label className="block text-sm text-neutral-300">
                  Petal Cost *
                  <input
                    type="number"
                    value={editing.petalCost || 0}
                    onChange={(e) =>
                      setEditing({ ...editing, petalCost: parseInt(e.target.value) || 0 })
                    }
                    className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Petal cost"
                  />
                </label>
              </div>

              <label className="block text-sm text-neutral-300">
                Description
                <textarea
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                  rows={2}
                  aria-label="Description"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <label className="block text-sm text-neutral-300">
                  Discount Type *
                  <select
                    value={editing.discountType || 'PERCENT'}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        discountType: e.target.value as DiscountType,
                        percentOff: e.target.value === 'PERCENT' ? editing.percentOff : null,
                        amountOff: e.target.value === 'OFF_AMOUNT' ? editing.amountOff : null,
                      })
                    }
                    className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Discount type"
                  >
                    <option value="PERCENT">Percent Off</option>
                    <option value="OFF_AMOUNT">Fixed Amount Off</option>
                  </select>
                </label>
                {editing.discountType === 'PERCENT' ? (
                  <label className="block text-sm text-neutral-300">
                    Percent Off (0-100) *
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editing.percentOff || 0}
                      onChange={(e) =>
                        setEditing({ ...editing, percentOff: parseInt(e.target.value) || 0 })
                      }
                      className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                      aria-label="Percent off"
                    />
                  </label>
                ) : (
                  <label className="block text-sm text-neutral-300">
                    Amount Off (cents) *
                    <input
                      type="number"
                      min="1"
                      value={editing.amountOff || 0}
                      onChange={(e) =>
                        setEditing({ ...editing, amountOff: parseInt(e.target.value) || 0 })
                      }
                      className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                      aria-label="Amount off in cents"
                    />
                  </label>
                )}
                <label className="block text-sm text-neutral-300">
                  Validity Days *
                  <input
                    type="number"
                    min="1"
                    value={editing.validityDays || 30}
                    onChange={(e) =>
                      setEditing({ ...editing, validityDays: parseInt(e.target.value) || 30 })
                    }
                    className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Validity days"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm text-neutral-300">
                  Min Spend (cents, optional)
                  <input
                    type="number"
                    min="0"
                    value={editing.minSpendCents || ''}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        minSpendCents: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Minimum spend in cents"
                  />
                </label>
                <label className="block text-sm text-neutral-300">
                  Max Uses Per User (optional)
                  <input
                    type="number"
                    min="1"
                    value={editing.maxUsesPerUser || ''}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        maxUsesPerUser: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Max uses per user"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm text-neutral-300">
                  Max Total Uses (optional)
                  <input
                    type="number"
                    min="1"
                    value={editing.maxTotalUses || ''}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        maxTotalUses: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Max total uses"
                  />
                </label>
                <label className="block text-sm text-neutral-300">
                  Requires Achievement (optional)
                  <select
                    value={editing.requiresAchievementId || ''}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        requiresAchievementId: e.target.value || null,
                      })
                    }
                    className="mt-1 w-full rounded bg-black/40 px-3 py-2 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Required achievement"
                  >
                    <option value="">None</option>
                    {achievements.map((ach) => (
                      <option key={ach.id} value={ach.id}>
                        {ach.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={editing.nsfwOnly || false}
                    onChange={(e) => setEditing({ ...editing, nsfwOnly: e.target.checked })}
                    className="rounded"
                    aria-label="NSFW only"
                  />
                  NSFW Only
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={editing.enabled !== false}
                    onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                    className="rounded"
                    aria-label="Enabled"
                  />
                  Enabled
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onSave}
                  className="rounded bg-pink-600 px-4 py-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  aria-label="Save discount reward"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded border border-white/20 px-4 py-2 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
