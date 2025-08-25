'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Flower, ShoppingBag, Settings, Sparkles, BarChart3 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { AdminLayout } from '@/components/admin/AdminNav';

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
  });
  const loadDashboardStats = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [stats]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-32 w-32 animate-spin rounded-full border-b-2 border-pink-500"></div>
            <p className="text-lg text-pink-300">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-xl text-neutral-300">
            Welcome back, {user?.firstName || 'Admin'}. Here's what's happening with your site.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </motion.div>

          {/* Total Petals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-lg bg-gradient-to-br from-pink-600 to-pink-700 p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-200">Total Petals</p>
                <p className="text-3xl font-bold">{stats.totalPetals.toLocaleString()}</p>
              </div>
              <Flower className="h-12 w-12 text-pink-200" />
            </div>
          </motion.div>

          {/* Total Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-lg bg-gradient-to-br from-green-600 to-green-700 p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-200">Total Orders</p>
                <p className="text-3xl font-bold">{stats.totalOrders.toLocaleString()}</p>
              </div>
              <ShoppingBag className="h-12 w-12 text-green-200" />
            </div>
          </motion.div>

          {/* Total Runes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-200">Total Runes</p>
                <p className="text-3xl font-bold">{stats.totalRunes.toLocaleString()}</p>
              </div>
              <Sparkles className="h-12 w-12 text-purple-200" />
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-lg border border-gray-700 bg-gray-800 p-6 transition-colors hover:border-pink-500"
          >
            <div className="mb-4 flex items-center space-x-3">
              <Settings className="h-6 w-6 text-pink-400" />
              <h3 className="text-lg font-semibold text-white">Site Settings</h3>
            </div>
            <p className="mb-4 text-gray-400">
              Configure site-wide settings, rewards, and rune systems.
            </p>
            <button className="rounded-md bg-pink-600 px-4 py-2 text-white transition-colors hover:bg-pink-700">
              Manage Settings
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="rounded-lg border border-gray-700 bg-gray-800 p-6 transition-colors hover:border-pink-500"
          >
            <div className="mb-4 flex items-center space-x-3">
              <Users className="h-6 w-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">User Management</h3>
            </div>
            <p className="mb-4 text-gray-400">
              View and manage user accounts, permissions, and activity.
            </p>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
              Manage Users
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="rounded-lg border border-gray-700 bg-gray-800 p-6 transition-colors hover:border-pink-500"
          >
            <div className="mb-4 flex items-center space-x-3">
              <BarChart3 className="h-6 w-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Analytics</h3>
            </div>
            <p className="mb-4 text-gray-400">View detailed analytics and performance metrics.</p>
            <button className="rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700">
              View Analytics
            </button>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-lg border border-gray-700 bg-gray-800 p-6"
        >
          <h3 className="mb-4 text-xl font-semibold text-white">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, _index) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 rounded-md bg-gray-700 p-3"
                >
                  <div className="h-2 w-2 rounded-full bg-pink-400"></div>
                  <span className="text-gray-300">{activity.description}</span>
                  <span className="ml-auto text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-gray-400">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
