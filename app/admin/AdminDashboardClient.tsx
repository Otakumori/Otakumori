'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users,
  Flower,
  ShoppingBag,
  Settings,
  Sparkles,
  BarChart3,
  AlertTriangle,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { AdminLayout } from '../../components/admin/AdminNav';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

interface DashboardStats {
  totalUsers: number;
  totalPetals: number;
  totalOrders: number;
  totalRunes: number;
  activeCombos: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
  attention: Array<{
    key: string;
    label: string;
    count: number;
    valueCents: number | null;
    href: string;
    severity: 'neutral' | 'attention' | 'critical';
  }>;
  sourceDigest: string;
}

export function AdminDashboardClient() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPetals: 0,
    totalOrders: 0,
    totalRunes: 0,
    activeCombos: 0,
    recentActivity: [],
    attention: [],
    sourceDigest: '',
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats((current) => data.data?.stats || current);
      }
    } catch (error) {
      const logger = await getLogger();
      logger.error(
        'Failed to load dashboard data',
        undefined,
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboardStats();
  }, [loadDashboardStats]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[70svh] items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border border-[#c7a97f]/20 border-t-[#c7a97f]/70" />
            <p className="mt-4 text-sm text-[#827873]">Loading operations…</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const metrics = [
    { label: 'Users', value: stats.totalUsers, icon: Users, detail: 'Local profiles' },
    { label: 'Petals', value: stats.totalPetals, icon: Flower, detail: 'Economy total' },
    { label: 'Orders', value: stats.totalOrders, icon: ShoppingBag, detail: 'Recorded orders' },
    {
      label: 'Runes',
      value: stats.totalRunes,
      icon: Sparkles,
      detail: `${stats.activeCombos} active combos`,
    },
  ];

  const actions = [
    {
      href: '/admin/settings',
      title: 'Site settings',
      description: 'Appearance, seasonal state, and world configuration.',
      icon: Settings,
    },
    {
      href: '/admin/users',
      title: 'User management',
      description: 'Profiles, permissions, and player-state review.',
      icon: Users,
    },
    {
      href: '/admin/economy',
      title: 'Economy & analytics',
      description: 'Petals, reward pressure, and commerce health.',
      icon: BarChart3,
    },
  ];

  return (
    <AdminLayout>
      <main className="p-5 sm:p-7 lg:p-9">
        <div className="mx-auto max-w-7xl">
          <header className="mb-7 border-b border-white/[0.08] pb-6">
            <h1 className="font-display text-3xl font-semibold text-[#f5eee9]">Operations</h1>
            <p className="mt-2 text-sm text-[#9f9490]">
              Welcome back, {user?.firstName || 'Admin'}. This view is for status and action, not
              decoration.
            </p>
          </header>

          <section
            aria-label="Operational metrics"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="mori-admin-panel p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6f6662]">
                        {metric.label}
                      </div>
                      <div className="mt-2 font-display text-3xl font-semibold text-[#f5eee9]">
                        {metric.value.toLocaleString()}
                      </div>
                      <div className="mt-1 text-xs text-[#827873]">{metric.detail}</div>
                    </div>
                    <div className="rounded-lg border border-white/[0.08] bg-white/[0.025] p-2.5 text-[#a9855f]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <section className="mt-7" aria-labelledby="attention-title">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2
                  id="attention-title"
                  className="font-display text-xl font-semibold text-[#eee6e1]"
                >
                  Commerce attention
                </h2>
                <p className="mt-1 text-sm text-[#827873]">
                  Live order and finance exceptions. Select a card to inspect source records.
                </p>
              </div>
              {stats.sourceDigest && (
                <span className="font-mono text-[10px] text-[#625a57]" title={stats.sourceDigest}>
                  source {stats.sourceDigest.slice(0, 12)}
                </span>
              )}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {stats.attention.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={`mori-admin-panel p-4 transition-colors hover:border-white/[0.16] ${
                    item.severity === 'critical'
                      ? 'border-rose-400/25'
                      : item.severity === 'attention'
                        ? 'border-amber-300/20'
                        : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#9f9490]">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold text-[#f5eee9]">{item.count}</p>
                      {item.valueCents != null && (
                        <p className="mt-1 text-xs text-[#827873]">
                          {(item.valueCents / 100).toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </p>
                      )}
                    </div>
                    {item.severity !== 'neutral' && (
                      <AlertTriangle
                        aria-hidden="true"
                        className={`h-4 w-4 ${
                          item.severity === 'critical' ? 'text-rose-300' : 'text-amber-300'
                        }`}
                      />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-7 grid gap-3 lg:grid-cols-3" aria-label="Quick actions">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="mori-admin-panel group p-5 transition-colors hover:border-white/[0.16]"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-[#a9855f]" />
                    <h2 className="text-sm font-semibold text-[#eee6e1]">{action.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#827873]">{action.description}</p>
                  <div className="mt-4 text-xs text-[#9f9490] transition-colors group-hover:text-[#d5c7c0]">
                    Open →
                  </div>
                </Link>
              );
            })}
          </section>

          <section
            className="mori-admin-panel mt-7 overflow-hidden"
            aria-labelledby="recent-activity-title"
          >
            <div className="border-b border-white/[0.07] px-5 py-4">
              <h2
                id="recent-activity-title"
                className="font-display text-lg font-semibold text-[#eee6e1]"
              >
                Recent activity
              </h2>
            </div>
            {stats.recentActivity.length > 0 ? (
              <div className="divide-y divide-white/[0.06]">
                {stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center"
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#a9855f]"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1 text-sm text-[#b8ada8]">
                      {activity.description}
                    </span>
                    <time
                      className="text-xs text-[#625a57]"
                      dateTime={new Date(activity.timestamp).toISOString()}
                    >
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </time>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-10 text-center text-sm text-[#756b67]">No recent activity.</p>
            )}
          </section>
        </div>
      </main>
    </AdminLayout>
  );
}
