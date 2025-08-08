'use client';

import { useState } from 'react';
import {
  Home,
  Users,
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  Bell,
  Heart,
  BookOpen,
  MessageCircle,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavigationProps {
  className?: string;
}

export default function MobileNavigation({ className }: MobileNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'shop', label: 'Shop', icon: ShoppingCart },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const quickActions = [
    { id: 'search', label: 'Search', icon: Search },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'petalnotes', label: 'Petalnotes', icon: BookOpen },
    { id: 'echoes', label: 'Echoes', icon: MessageCircle },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <div
        className={`fixed left-0 right-0 top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 ${className}`}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">Otaku-mori</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-2">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Side Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl dark:bg-gray-900">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menu</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Profile Section */}
              <div className="mb-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900">
                    <User className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">SakuraFan</p>
                    <p className="text-sm text-gray-500">Level 15 • 1,247 petals</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mb-6">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
                  Quick Actions
                </h3>
                <div className="space-y-1">
                  {quickActions.map(action => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <Icon className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-900 dark:text-white">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Items */}
              <div>
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-gray-500">
                  Navigation
                </h3>
                <div className="space-y-1">
                  {navigationItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMenuOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                          activeTab === item.id
                            ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400'
                            : 'text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-colors ${
                  activeTab === item.id
                    ? 'bg-pink-50 text-pink-500 dark:bg-pink-900/20'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button size="lg" className="h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Content Padding for Mobile */}
      <div className="pb-20 pt-16">{/* Your page content goes here */}</div>
    </>
  );
}
