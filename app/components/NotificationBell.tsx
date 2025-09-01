'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import GlassCard from '@/app/components/ui/GlassCard';
import { NotificationResponse, type Notification } from '@/app/lib/contracts';

interface NotificationBellProps {
  className?: string;
}

export default function NotificationBell({ className = '' }: NotificationBellProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/notifications?limit=20');
      const result = await response.json();

      if (result.ok) {
        setNotifications(result.data.notifications);
        setUnreadCount(result.data.unreadCount);
      } else {
        console.error('Failed to load notifications:', result.error);
      }
    } catch (error) {
      console.error('Notifications error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/v1/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notificationIds.includes(notification.id)
              ? { ...notification, read: true }
              : notification,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return '👥';
      case 'request':
        return '📨';
      case 'achievement':
        return '🏆';
      case 'trade':
        return '🔄';
      case 'score-beaten':
        return '🎯';
      case 'comment':
        return '💬';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  };

  const getNotificationText = (notification: Notification) => {
    const payload = notification.payload as any;

    switch (notification.type) {
      case 'follow':
        return `${payload.username || 'Someone'} started following you`;
      case 'request':
        return `${payload.username || 'Someone'} sent you a friend request`;
      case 'achievement':
        return `You unlocked: ${payload.name || 'New Achievement'}`;
      case 'trade':
        return `Trade completed: ${payload.itemName || 'Items'}`;
      case 'score-beaten':
        return `${payload.username || 'Someone'} beat your score in ${payload.gameCode || 'a game'}`;
      case 'comment':
        return `${payload.username || 'Someone'} commented on your profile`;
      case 'system':
        return payload.message || 'System notification';
      default:
        return 'New notification';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-pink-300 hover:text-pink-200 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5zM4.5 19.5a2.5 2.5 0 01-2.5-2.5V7a2.5 2.5 0 012.5-2.5h15a2.5 2.5 0 012.5 2.5v10a2.5 2.5 0 01-2.5 2.5h-15z"
          />
        </svg>

        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-hidden bg-gradient-to-br from-pink-900/95 to-purple-900/95 backdrop-blur-xl rounded-2xl border border-pink-500/20 shadow-2xl z-50"
          >
            <div className="p-4 border-b border-pink-500/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-pink-300">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
                      if (unreadIds.length > 0) {
                        markAsRead(unreadIds);
                      }
                    }}
                    className="text-xs text-pink-300/70 hover:text-pink-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-pink-300/70 mt-2 text-sm">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔔</div>
                  <p className="text-pink-300/70 text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-pink-500/10">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 hover:bg-pink-900/20 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-pink-900/10' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead([notification.id]);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-pink-100 text-sm leading-relaxed">
                            {getNotificationText(notification)}
                          </p>
                          <p className="text-pink-300/50 text-xs mt-1">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
