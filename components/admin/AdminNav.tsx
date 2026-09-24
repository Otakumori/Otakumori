'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Flower,
  Zap,
  ChevronRight,
  Home,
  Ticket,
  Users,
  Palette,
  Shield,
  ShoppingBag,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

type AdminRoute = {
  path: string;
  name: string;
  icon: typeof Home;
  description: string;
};

type AdminGroup = {
  label: string;
  routes: AdminRoute[];
};

const adminGroups: AdminGroup[] = [
  {
    label: 'Operations',
    routes: [
      { path: '/admin', name: 'Dashboard', icon: Home, description: 'Operational overview' },
      { path: '/admin/users', name: 'Users & Profiles', icon: Users, description: 'Accounts and player state' },
      { path: '/admin/orders', name: 'Orders', icon: ShoppingBag, description: 'Order operations and tracking' },
    ],
  },
  {
    label: 'Commerce',
    routes: [
      { path: '/admin/economy', name: 'Economy', icon: Sparkles, description: 'Petals, discounts, cosmetics' },
      { path: '/admin/petal-shop', name: 'Petal Shop', icon: Flower, description: 'Petal shop inventory' },
      { path: '/admin/vouchers', name: 'Vouchers', icon: Ticket, description: 'Discount vouchers' },
      { path: '/admin/coupons', name: 'Coupons', icon: Ticket, description: 'Coupon SKUs and templates' },
      { path: '/admin/discounts', name: 'Discount Rewards', icon: Ticket, description: 'Petal-purchased discounts' },
    ],
  },
  {
    label: 'World & Content',
    routes: [
      { path: '/admin/content/blog', name: 'Blog Posts', icon: FileText, description: 'Author and publish stories' },
      { path: '/admin/settings', name: 'Appearance', icon: SlidersHorizontal, description: 'Theme and seasonal settings' },
      { path: '/admin/cosmetics', name: 'Cosmetics', icon: Palette, description: 'Cosmetics configuration' },
      { path: '/admin/runes', name: 'Rune System', icon: Sparkles, description: 'Runes and combinations' },
      { path: '/admin/rewards', name: 'Rewards', icon: Flower, description: 'Petal reward rules' },
      { path: '/admin/burst', name: 'Burst System', icon: Zap, description: 'Burst effect configuration' },
    ],
  },
  {
    label: 'Governance',
    routes: [
      { path: '/admin/nsfw', name: 'NSFW Controls', icon: Shield, description: 'Age gating and controls' },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <aside className="fixed left-0 top-0 z-40 h-full border-r border-white/[0.08] bg-[#09080a]/96 shadow-[18px_0_50px_rgba(0,0,0,0.28)] backdrop-blur-md">
      <div className={`flex h-full flex-col transition-[width] duration-200 ${isExpanded ? 'w-72' : 'w-16'}`}>
        <div className="border-b border-white/[0.08] p-4">
          <div className="flex items-center justify-between gap-3">
            {isExpanded && (
              <div>
                <h2 className="font-display text-base font-semibold text-[#f5eee9]">Otaku-mori Admin</h2>
                <p className="mt-0.5 text-[11px] text-[#8f8581]">Operations console</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="rounded-lg border border-white/[0.08] p-2 text-[#9c918c] transition-colors hover:border-white/[0.14] hover:bg-white/[0.04] hover:text-white"
              aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
          {adminGroups.map((group) => (
            <div key={group.label} className="mb-5 last:mb-0">
              {isExpanded && (
                <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6f6662]">
                  {group.label}
                </div>
              )}
              <div className="space-y-1">
                {group.routes.map((route) => {
                  const Icon = route.icon;
                  const isActive = pathname === route.path || (route.path !== '/admin' && pathname.startsWith(`${route.path}/`));

                  return (
                    <Link
                      key={route.path}
                      href={route.path}
                      title={isExpanded ? undefined : route.name}
                      className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                        isActive
                          ? 'border-[#a9855f]/24 bg-[#a9855f]/10 text-[#fff1e4]'
                          : 'border-transparent text-[#b7aca7] hover:border-white/[0.07] hover:bg-white/[0.035] hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#c7a97f]' : 'text-[#766d69] group-hover:text-[#aaa09b]'}`} />
                      {isExpanded && (
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{route.name}</div>
                          <div className="mt-0.5 truncate text-[11px] text-[#6f6662]">{route.description}</div>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/[0.08] p-4">
          {isExpanded && <div className="text-xs text-[#6f6662]">Draft changes stay isolated until approved.</div>}
        </div>
      </div>
    </aside>
  );
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mori-admin-shell">
      <AdminNav />
      <div className="ml-16 min-h-screen lg:ml-72">{children}</div>
    </div>
  );
}
