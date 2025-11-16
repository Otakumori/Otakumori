/**
 * Admin Console Page
 * 
 * Secure admin interface for managing feature flags and site settings.
 * Only accessible to admin users (emails in ADMIN_EMAILS).
 */

import { requireAdmin } from '@/app/lib/auth/admin';
import { env } from '@/env';
import AdminConsoleClient from './AdminConsoleClient';
import Link from 'next/link';
import { Users, Flower, Palette, Ticket, Shield, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminPage() {
  // Check if Clerk is configured
  const isClerkConfigured = Boolean(
    env.CLERK_SECRET_KEY && env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );

  if (!isClerkConfigured) {
    // In development, allow access; in production, show disabled message
    if (process.env.NODE_ENV === 'development') {
      // Allow dev access but warn
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 mb-6">
              <h1 className="text-2xl font-bold text-yellow-200 mb-2">Admin Console (Dev Mode)</h1>
              <p className="text-yellow-100/80">
                Clerk is not configured. Admin console is only available in development mode.
              </p>
            </div>
            <AdminConsoleClient />
          </div>
        </div>
      );
    }

    // Production: show disabled message
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Admin Disabled</h1>
          <p className="text-zinc-300">
            Admin console requires authentication. Clerk is not configured in this environment.
          </p>
        </div>
      </div>
    );
  }

  // Require admin access
  const adminUser = await requireAdmin();

  // User is admin - show admin console
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Console</h1>
          <p className="text-zinc-300">Manage Otaku-mori operations and settings</p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            href="/admin/users"
            className="group rounded-xl border border-white/10 bg-black/50 p-6 hover:border-pink-500/50 hover:bg-black/70 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="rounded-lg bg-pink-500/20 p-3">
                <Users className="h-6 w-6 text-pink-400" />
              </div>
              <h2 className="text-xl font-semibold text-white group-hover:text-pink-300">Users & Profiles</h2>
            </div>
            <p className="text-sm text-zinc-400">
              View user list, petal balances, lifetime earnings, and NSFW status
            </p>
          </Link>

          <Link
            href="/admin/economy"
            className="group rounded-xl border border-white/10 bg-black/50 p-6 hover:border-pink-500/50 hover:bg-black/70 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="rounded-lg bg-green-500/20 p-3">
                <BarChart3 className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-white group-hover:text-pink-300">Petal Economy</h2>
            </div>
            <p className="text-sm text-zinc-400">
              Monitor total petals earned/spent, top earners, and daily caps
            </p>
          </Link>

          <Link
            href="/admin/cosmetics"
            className="group rounded-xl border border-white/10 bg-black/50 p-6 hover:border-pink-500/50 hover:bg-black/70 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="rounded-lg bg-purple-500/20 p-3">
                <Palette className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white group-hover:text-pink-300">Cosmetics</h2>
            </div>
            <p className="text-sm text-zinc-400">
              Manage cosmetics config, costs, rarity, and NSFW flags
            </p>
          </Link>

          <Link
            href="/admin/vouchers"
            className="group rounded-xl border border-white/10 bg-black/50 p-6 hover:border-pink-500/50 hover:bg-black/70 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="rounded-lg bg-blue-500/20 p-3">
                <Ticket className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-white group-hover:text-pink-300">Discounts & Vouchers</h2>
            </div>
            <p className="text-sm text-zinc-400">
              View voucher usage stats and manage discount rewards
            </p>
          </Link>

          <Link
            href="/admin/nsfw"
            className="group rounded-xl border border-white/10 bg-black/50 p-6 hover:border-pink-500/50 hover:bg-black/70 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="rounded-lg bg-red-500/20 p-3">
                <Shield className="h-6 w-6 text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-white group-hover:text-pink-300">NSFW Controls</h2>
            </div>
            <p className="text-sm text-zinc-400">
              Global NSFW toggle, user-level overrides, and stats
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="group rounded-xl border border-white/10 bg-black/50 p-6 hover:border-pink-500/50 hover:bg-black/70 transition-all"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="rounded-lg bg-yellow-500/20 p-3">
                <Flower className="h-6 w-6 text-yellow-400" />
              </div>
              <h2 className="text-xl font-semibold text-white group-hover:text-pink-300">Feature Flags</h2>
            </div>
            <p className="text-sm text-zinc-400">
              Manage feature flags and site settings
            </p>
          </Link>
        </div>

        {/* Legacy Admin Console */}
        <div className="mt-8">
          <AdminConsoleClient userId={adminUser.id} userEmail={adminUser.email} />
        </div>
      </div>
    </div>
  );
}
