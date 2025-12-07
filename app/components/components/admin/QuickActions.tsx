'use client';
'use client';

import { logger } from '@/app/lib/logger';
import React, { useState } from 'react';
// Removed supabase import - using API routes for admin actions
import { motion } from 'framer-motion';
import { PUBLIC_KEYS } from '@/constants.client';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => Promise<void>;

export default function QuickActions() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [maintenanceStatus, setMaintenanceStatus] = useState<boolean | null>(null);

  // Check current maintenance status
  React.useEffect(() => {
    checkMaintenanceStatus();
  }, []);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': PUBLIC_KEYS.apiKey || 'dev-key',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMaintenanceStatus(data.maintenance);
      }
    } catch (error) {
      logger.error('Failed to check maintenance status:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    }
  };

  const toggleMaintenanceMode = async () => {
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': PUBLIC_KEYS.apiKey || 'dev-key',
        },
        body: JSON.stringify({
          maintenance: !maintenanceStatus,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMaintenanceStatus(data.maintenance);
        alert(`Maintenance mode ${data.maintenance ? 'enabled' : 'disabled'} successfully!`);
      } else {
        throw new Error('Failed to toggle maintenance mode');
      }
    } catch (error) {
      logger.error('Error toggling maintenance mode:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      alert('Failed to toggle maintenance mode. Please try again.');
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'view-users',
      title: 'View Users',
      description: 'Browse and manage user accounts',
      icon: '',
      color: 'bg-blue-500/20 hover:bg-blue-500/30',
      action: async () => {
        setIsLoading('view-users');
        try {
          // TODO: Navigate to user management page
          alert('User management page coming soon!');
        } finally {
          setIsLoading(null);
        }
      },
    },
    {
      id: 'manage-content',
      title: 'Manage Content',
      description: 'Edit blog posts and shop items',
      icon: '',
      color: 'bg-green-500/20 hover:bg-green-500/30',
      action: async () => {
        setIsLoading('manage-content');
        try {
          // TODO: Navigate to content management page
          alert('Content management page coming soon!');
        } finally {
          setIsLoading(null);
        }
      },
    },
    {
      id: 'view-analytics',
      title: 'View Analytics',
      description: 'Check site performance and user stats',
      icon: '',
      color: 'bg-purple-500/20 hover:bg-purple-500/30',
      action: async () => {
        setIsLoading('view-analytics');
        try {
          // TODO: Navigate to analytics dashboard
          alert('Analytics dashboard coming soon!');
        } finally {
          setIsLoading(null);
        }
      },
    },
    {
      id: 'toggle-maintenance',
      title: maintenanceStatus ? 'Disable Maintenance' : 'Enable Maintenance',
      description: maintenanceStatus
        ? 'Disable site maintenance mode'
        : 'Enable site maintenance mode',
      icon: maintenanceStatus ? '<span role="img" aria-label="emoji">�</span>�' : '',
      color: maintenanceStatus
        ? 'bg-green-500/20 hover:bg-green-500/30'
        : 'bg-yellow-500/20 hover:bg-yellow-500/30',
      action: async () => {
        setIsLoading('toggle-maintenance');
        try {
          await toggleMaintenanceMode();
        } finally {
          setIsLoading(null);
        }
      },
    },
    {
      id: 'backup-data',
      title: 'Backup Data',
      description: 'Create database and file backups',
      icon: '',
      color: 'bg-indigo-500/20 hover:bg-indigo-500/30',
      action: async () => {
        setIsLoading('backup-data');
        try {
          const response = await fetch('/api/admin/backup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': PUBLIC_KEYS.apiKey || 'dev-key',
            },
          });

          if (response.ok) {
            alert('Backup initiated successfully!');
          } else {
            throw new Error('Backup failed');
          }
        } catch (error) {
          logger.error('Backup error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
          alert('Failed to initiate backup. Please try again.');
        } finally {
          setIsLoading(null);
        }
      },
    },
    {
      id: 'clear-cache',
      title: 'Clear Cache',
      description: 'Clear Redis cache and temporary files',
      icon: '',
      color: 'bg-orange-500/20 hover:bg-orange-500/30',
      action: async () => {
        setIsLoading('clear-cache');
        try {
          const response = await fetch('/api/admin/cache/clear', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': PUBLIC_KEYS.apiKey || 'dev-key',
            },
          });

          if (response.ok) {
            alert('Cache cleared successfully!');
          } else {
            throw new Error('Cache clear failed');
          }
        } catch (error) {
          logger.error('Cache clear error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
          alert('Failed to clear cache. Please try again.');
        } finally {
          setIsLoading(null);
        }
      },
    },
    {
      id: 'system-health',
      title: 'System Health',
      description: 'Check system status and performance',
      icon: '',
      color: 'bg-red-500/20 hover:bg-red-500/30',
      action: async () => {
        setIsLoading('system-health');
        try {
          const response = await fetch('/api/health', {
            method: 'GET',
          });

          if (response.ok) {
            const health = await response.json();
            alert(
              `System Status: ${health.status}\nDatabase: ${health.database}\nRedis: ${health.redis}`,
            );
          } else {
            throw new Error('Health check failed');
          }
        } catch (error) {
          logger.error('Health check error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
          alert('Failed to check system health. Please try again.');
        } finally {
          setIsLoading(null);
        }
      },
    },
    {
      id: 'send-notification',
      title: 'Send Notification',
      description: 'Send site-wide notification to users',
      icon: '',
      color: 'bg-pink-500/20 hover:bg-pink-500/30',
      action: async () => {
        setIsLoading('send-notification');
        try {
          const message = prompt('Enter notification message:');
          if (message) {
            const response = await fetch('/api/admin/notifications', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': PUBLIC_KEYS.apiKey || 'dev-key',
              },
              body: JSON.stringify({ message }),
            });

            if (response.ok) {
              alert('Notification sent successfully!');
            } else {
              throw new Error('Failed to send notification');
            }
          }
        } catch (error) {
          logger.error('Notification error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
          alert('Failed to send notification. Please try again.');
        } finally {
          setIsLoading(null);
        }
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {quickActions.map((action) => (
        <motion.button
          key={action.id}
          onClick={action.action}
          disabled={isLoading === action.id}
          className={`rounded-lg border border-gray-700 p-4 ${action.color} transition-colors disabled:cursor-not-allowed disabled:opacity-50`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{action.icon}</span>
            <div className="text-left">
              <h3 className="font-medium text-white">{action.title}</h3>
              <p className="text-sm text-gray-400">{action.description}</p>
            </div>
          </div>
          {isLoading === action.id && (
            <div className="mt-2">
              <div className="mx-auto h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
}
