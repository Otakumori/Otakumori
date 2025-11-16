'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Flower, Zap, ChevronRight, Home, Ticket, Users, Palette, Shield } from 'lucide-react';

const adminRoutes = [
  {
    path: '/admin',
    name: 'Dashboard',
    icon: Home,
    description: 'Admin overview',
  },
  {
    path: '/admin/users',
    name: 'Users & Profiles',
    icon: Users,
    description: 'User overview and management',
  },
  {
    path: '/admin/economy',
    name: 'Economy Overview',
    icon: Sparkles,
    description: 'Monitor petals, discounts, and cosmetics',
  },
  {
    path: '/admin/cosmetics',
    name: 'Cosmetics',
    icon: Palette,
    description: 'Manage cosmetics config',
  },
  {
    path: '/admin/vouchers',
    name: 'Vouchers',
    icon: Ticket,
    description: 'Discount voucher management',
  },
  {
    path: '/admin/nsfw',
    name: 'NSFW Controls',
    icon: Shield,
    description: 'NSFW gating and controls',
  },
  {
    path: '/admin/settings',
    name: 'Appearance',
    icon: Sparkles,
    description: 'Theme and seasonal settings',
  },
  {
    path: '/admin/runes',
    name: 'Rune System',
    icon: Sparkles,
    description: 'Manage runes and combos',
  },
  {
    path: '/admin/rewards',
    name: 'Rewards',
    icon: Flower,
    description: 'Configure petal rewards',
  },
  {
    path: '/admin/petal-shop',
    name: 'Petal Shop',
    icon: Flower,
    description: 'Manage petal shop items',
  },
  {
    path: '/admin/coupons',
    name: 'Coupons',
    icon: Ticket,
    description: 'Coupon SKUs and templates',
  },
  {
    path: '/admin/discounts',
    name: 'Discount Rewards',
    icon: Ticket,
    description: 'Manage petal-purchased discount vouchers',
  },
  {
    path: '/admin/burst',
    name: 'Burst System',
    icon: Zap,
    description: 'Configure burst effects',
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="fixed left-0 top-0 z-40 h-full border-r border-neutral-700 bg-neutral-900/95 backdrop-blur-sm transition-all duration-300">
      <div className={`flex h-full flex-col ${isExpanded ? 'w-64' : 'w-16'}`}>
        {/* Header */}
        <div className="border-b border-neutral-700 p-4">
          <div className="flex items-center justify-between">
            {isExpanded && <h2 className="text-lg font-bold text-white">Admin Panel</h2>}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg p-2 transition-colors hover:bg-neutral-800"
              aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <ChevronRight
                className={`h-4 w-4 text-neutral-400 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {adminRoutes.map((route) => {
            const Icon = route.icon;
            const isActive = pathname === route.path;

            return (
              <Link
                key={route.path}
                href={route.path}
                className={`group flex items-center space-x-3 rounded-lg p-3 transition-all duration-200 ${
                  isActive
                    ? 'border border-pink-500/30 bg-pink-500/20 text-pink-300'
                    : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
                }`}
              >
                <Icon
                  className={`h-5 w-5 flex-shrink-0 ${
                    isActive ? 'text-pink-400' : 'text-neutral-400 group-hover:text-neutral-200'
                  }`}
                />

                {isExpanded && (
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{route.name}</div>
                    <div className="truncate text-xs text-neutral-500">{route.description}</div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-neutral-700 p-4">
          {isExpanded && (
            <div className="text-center text-xs text-neutral-500">Admin Panel v1.0</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Layout wrapper for admin pages
export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <AdminNav />
      <div className="ml-16 lg:ml-64">{children}</div>
    </div>
  );
}
