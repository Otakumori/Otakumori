'use client';

import { logger } from '@/app/lib/logger';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminNav';
import { Flower, ShoppingBag, Ticket, Users } from 'lucide-react';

interface EconomyStats {
  petals: {
    totalEarned: number;
    totalSpent: number;
    netFlow: number;
    todayEarned: number;
    todaySpent: number;
    thirtyDayEarned: number;
    thirtyDaySpent: number;
    totalTransactions: number;
    topEarnSources: Array<{ reason: string; total: number }>;
    topSpendReasons: Array<{ reason: string; total: number }>;
  };
  discounts: {
    totalRewards: number;
    totalPurchases: number;
    totalRedemptions: number;
    activeVouchers: number;
    topRewards: Array<{ id: string; name: string; petalCost: number; purchases: number }>;
  };
  cosmetics: {
    totalPurchases: number;
    topCosmetics: Array<{ sku: string; purchaseCount: number }>;
  };
  wallets: {
    totalWallets: number;
    totalBalance: number;
    avgBalance: number;
    topBalances: Array<{
      userId: string;
      balance: number;
      lifetimeEarned: number;
      username: string;
    }>;
  };
}

export default function AdminEconomyPage() {
  const [stats, setStats] = useState<EconomyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/economy/stats', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data?.ok && data?.data) {
            setStats(data.data);
          }
        }
      } catch (err) {
        logger.error('Failed to load economy data', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-neutral-400">Loading economy stats...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-red-400">Failed to load economy stats</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="mb-1 text-3xl font-bold text-white">Economy Overview</h1>
        <p className="mb-6 text-neutral-300">
          Monitor petal economy, discount usage, and cosmetic purchases.
        </p>

        {/* Petal Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Flower className="h-5 w-5 text-pink-400" />
            Petal Economy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Total Earned</div>
              <div className="text-2xl font-bold text-green-400">
                {stats.petals.totalEarned.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Total Spent</div>
              <div className="text-2xl font-bold text-red-400">
                {stats.petals.totalSpent.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Net Flow</div>
              <div
                className={`text-2xl font-bold ${
                  stats.petals.netFlow >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {stats.petals.netFlow >= 0 ? '+' : ''}
                {stats.petals.netFlow.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Total Transactions</div>
              <div className="text-2xl font-bold text-white">
                {stats.petals.totalTransactions.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-2">Today</div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-neutral-500">Earned</div>
                  <div className="text-lg font-semibold text-green-400">
                    {stats.petals.todayEarned.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Spent</div>
                  <div className="text-lg font-semibold text-red-400">
                    {stats.petals.todaySpent.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-2">Last 30 Days</div>
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs text-neutral-500">Earned</div>
                  <div className="text-lg font-semibold text-green-400">
                    {stats.petals.thirtyDayEarned.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-neutral-500">Spent</div>
                  <div className="text-lg font-semibold text-red-400">
                    {stats.petals.thirtyDaySpent.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Top Earning Sources</h3>
              <div className="space-y-2">
                {stats.petals.topEarnSources.length > 0 ? (
                  stats.petals.topEarnSources.map((source, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-neutral-300 truncate">{source.reason}</span>
                      <span className="text-green-400 font-medium">
                        {source.total.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-neutral-500">No data</div>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Top Spending Reasons</h3>
              <div className="space-y-2">
                {stats.petals.topSpendReasons.length > 0 ? (
                  stats.petals.topSpendReasons.map((reason, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-neutral-300 truncate">{reason.reason}</span>
                      <span className="text-red-400 font-medium">
                        {reason.total.toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-neutral-500">No data</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Discount Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-blue-400" />
            Discount Rewards
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Total Rewards</div>
              <div className="text-2xl font-bold text-white">{stats.discounts.totalRewards}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Purchased</div>
              <div className="text-2xl font-bold text-blue-400">
                {stats.discounts.totalPurchases.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Redeemed</div>
              <div className="text-2xl font-bold text-green-400">
                {stats.discounts.totalRedemptions.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Active Vouchers</div>
              <div className="text-2xl font-bold text-yellow-400">
                {stats.discounts.activeVouchers.toLocaleString()}
              </div>
            </div>
          </div>

          {stats.discounts.topRewards.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Top Discount Rewards</h3>
              <div className="space-y-2">
                {stats.discounts.topRewards.map((reward) => (
                  <div key={reward.id} className="flex justify-between text-sm">
                    <div>
                      <span className="text-neutral-300">{reward.name}</span>
                      <span className="text-neutral-500 ml-2">
                        ({reward.petalCost.toLocaleString()} petals)
                      </span>
                    </div>
                    <span className="text-blue-400 font-medium">{reward.purchases} purchases</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cosmetic Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-purple-400" />
            Cosmetics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Total Purchases</div>
              <div className="text-2xl font-bold text-purple-400">
                {stats.cosmetics.totalPurchases.toLocaleString()}
              </div>
            </div>
          </div>

          {stats.cosmetics.topCosmetics.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Top Cosmetics</h3>
              <div className="space-y-2">
                {stats.cosmetics.topCosmetics.map((cosmetic, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-neutral-300 truncate">{cosmetic.sku}</span>
                    <span className="text-purple-400 font-medium">
                      {cosmetic.purchaseCount} purchases
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Wallet Statistics */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-400" />
            User Wallets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Total Wallets</div>
              <div className="text-2xl font-bold text-white">{stats.wallets.totalWallets}</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Total Balance</div>
              <div className="text-2xl font-bold text-cyan-400">
                {stats.wallets.totalBalance.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <div className="text-sm text-neutral-400 mb-1">Average Balance</div>
              <div className="text-2xl font-bold text-white">
                {Math.round(stats.wallets.avgBalance).toLocaleString()}
              </div>
            </div>
          </div>

          {stats.wallets.topBalances.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-black/50 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Top Balances</h3>
              <div className="space-y-2">
                {stats.wallets.topBalances.map((wallet) => (
                  <div key={wallet.userId} className="flex justify-between text-sm">
                    <div>
                      <span className="text-neutral-300">{wallet.username}</span>
                      <span className="text-neutral-500 ml-2">
                        (Lifetime: {wallet.lifetimeEarned.toLocaleString()})
                      </span>
                    </div>
                    <span className="text-cyan-400 font-medium">
                      {wallet.balance.toLocaleString()} petals
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
