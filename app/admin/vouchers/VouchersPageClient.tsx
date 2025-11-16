'use client';

import { useEffect, useState } from 'react';
import { Ticket } from 'lucide-react';

interface VoucherStats {
  totalVouchers: number;
  activeVouchers: number;
  redeemedVouchers: number;
  expiredVouchers: number;
  totalDiscountValue: number;
  topUsers: Array<{ userId: string; username: string; voucherCount: number }>;
}

export default function VouchersPageClient() {
  const [stats, setStats] = useState<VoucherStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/admin/vouchers/stats', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          if (data?.ok && data?.data) {
            setStats(data.data);
          }
        }
      } catch (err) {
        console.error('Failed to load voucher stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-neutral-400">Loading voucher stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-red-400">Failed to load voucher stats</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-1 text-3xl font-bold text-white flex items-center gap-2">
        <Ticket className="h-8 w-8 text-blue-400" />
        Discount Vouchers
      </h1>
      <p className="mb-6 text-neutral-300">View voucher usage stats and manage discount rewards</p>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">Total Vouchers</div>
          <div className="text-2xl font-bold text-white">{stats.totalVouchers}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">Active</div>
          <div className="text-2xl font-bold text-green-400">{stats.activeVouchers}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">Redeemed</div>
          <div className="text-2xl font-bold text-blue-400">{stats.redeemedVouchers}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/50 p-4">
          <div className="text-sm text-neutral-400 mb-1">Expired</div>
          <div className="text-2xl font-bold text-red-400">{stats.expiredVouchers}</div>
        </div>
      </div>

      {/* Top Users */}
      {stats.topUsers.length > 0 && (
        <div className="mb-6 rounded-xl border border-white/10 bg-black/50 p-4">
          <h2 className="mb-4 text-lg font-semibold text-white">Top Voucher Users</h2>
          <div className="space-y-2">
            {stats.topUsers.map((user) => (
              <div key={user.userId} className="flex justify-between text-sm">
                <span className="text-neutral-300">{user.username}</span>
                <span className="text-blue-400 font-medium">{user.voucherCount} vouchers</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-black/50 p-4">
        <p className="text-sm text-neutral-400">
          For detailed voucher management, visit the{' '}
          <a href="/admin/discounts" className="text-pink-400 hover:text-pink-300 underline">
            Discount Rewards
          </a>{' '}
          page.
        </p>
      </div>
    </div>
  );
}

