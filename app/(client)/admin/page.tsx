'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import LoadingBonfire from '../../../components/ui/LoadingBonfire';
import { motion } from 'framer-motion';
import QuickActions from '../../../components/admin/QuickActions';
import MessageManager from '../../../components/admin/MessageManager';

interface AdminStats {
  totalUsers: number;
  totalPetals: number;
  activeUsers: number;
  totalMessages: number;
  topRatedMessage: string;
}

export default function AdminPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPetals: 0,
    activeUsers: 0,
    totalMessages: 0,
    topRatedMessage: '',
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoaded) return;

      try {
        if (!user) {
          router.push('/login');
          return;
        }

        // Check if user has admin role (you can implement your own admin check)
        const isAdmin = user.publicMetadata?.role === 'admin' || 
                       user.emailAddresses.some(email => 
                         email.emailAddress === process.env.NEXT_PUBLIC_ADMIN_EMAIL
                       );

        if (!isAdmin) {
          router.push('/');
          return;
        }

        // For now, set mock stats since we don't have the database tables
        setStats({
          totalUsers: 0,
          totalPetals: 0,
          activeUsers: 0,
          totalMessages: 0,
          topRatedMessage: 'No messages yet',
        });

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, isLoaded, router]);

  if (isLoading) {
    return <LoadingBonfire />;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-pink-400">Princess Admin General's Throne</h1>
            <p className="mt-2 text-gray-400">Welcome to your domain, Your Highness</p>
          </div>
          <button
            onClick={() => signOut()}
            className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-pink-700"
          >
            Leave the Throne
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex space-x-4 border-b border-gray-700">
          {['dashboard', 'messages', 'users', 'media', 'reviews', 'music', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-pink-400 text-pink-400'
                  : 'text-gray-400 hover:text-pink-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Quick Actions */}
            <div>
              <h2 className="mb-4 text-2xl font-bold text-pink-400">Quick Actions</h2>
              <QuickActions />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* User Statistics Card */}
              <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg transition-colors hover:border-pink-500/40">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-pink-400">Ashen Ones</h2>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20">
                    <span className="text-pink-400">👥</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  <p className="text-gray-400">Total Ashen Ones</p>
                </div>
              </div>

              {/* Petal Economy Card */}
              <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg transition-colors hover:border-pink-500/40">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-pink-400">Petal Economy</h2>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20">
                    <span className="text-pink-400">🌸</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{stats.totalPetals}</p>
                  <p className="text-gray-400">Total Petals Collected</p>
                </div>
              </div>

              {/* Messages Card */}
              <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg transition-colors hover:border-pink-500/40">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-pink-400">Soapstone Messages</h2>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20">
                    <span className="text-pink-400">💬</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">{stats.totalMessages}</p>
                  <p className="text-gray-400">Total Messages</p>
                </div>
              </div>
            </div>

            {/* Top Message Card */}
            <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg transition-colors hover:border-pink-500/40">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-pink-400">Most Praised Message</h2>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/20">
                  <span className="text-pink-400">👑</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg italic text-pink-200">"{stats.topRatedMessage}"</p>
                <p className="text-gray-400">Most Praised by the Community</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <MessageManager />
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* User management features will go here */}
            <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-pink-400">User Management</h2>
              <p className="text-gray-400">
                Coming soon: User management tools, permissions, and more!
              </p>
            </div>
          </motion.div>
        )}

        {/* Media Tab */}
        {activeTab === 'media' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-pink-400">Media Management</h2>
              <p className="mb-4 text-gray-400">
                Manage your site's media files, upload new images, and organize your content.
              </p>
              <a
                href="/admin/media"
                className="inline-block rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-pink-700"
              >
                Go to Media Manager
              </a>
            </div>
          </motion.div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-pink-400">Review Moderation</h2>
              <p className="mb-4 text-gray-400">
                Moderate customer reviews, approve or reject submissions, and maintain quality.
              </p>
              <a
                href="/admin/reviews"
                className="inline-block rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-pink-700"
              >
                Go to Review Queue
              </a>
            </div>
          </motion.div>
        )}

        {/* Music Tab */}
        {activeTab === 'music' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-pink-400">Music Management</h2>
              <p className="mb-4 text-gray-400">
                Create playlists, upload MP3s, and manage your site's background music. Users can opt-in to enjoy the tunes!
              </p>
              <a
                href="/admin/music"
                className="inline-block rounded-lg bg-pink-600 px-4 py-2 text-sm font-medium transition-colors hover:bg-pink-700"
              >
                Go to Music Manager
              </a>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Site settings will go here */}
            <div className="rounded-lg border border-pink-500/20 bg-gray-800 p-6 shadow-lg">
              <h2 className="mb-4 text-xl font-semibold text-pink-400">Site Settings</h2>
              <p className="text-gray-400">
                Coming soon: Site configuration, theme settings, and more!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
