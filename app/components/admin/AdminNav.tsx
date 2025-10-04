'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: '' },
  { href: '/admin/users', label: 'Users', icon: '' },
  { href: '/admin/products', label: 'Products', icon: '' },
  { href: '/admin/orders', label: 'Orders', icon: '' },
  { href: '/admin/reviews', label: 'Reviews', icon: '' },
  { href: '/admin/runes', label: 'Runes', icon: '' },
  { href: '/admin/rewards', label: 'Rewards', icon: '' },
  { href: '/admin/burst', label: 'Burst', icon: '' },
  { href: '/admin/settings', label: 'Settings', icon: '' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                ← Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {adminNavItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                        pathname === item.href
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                      )}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
