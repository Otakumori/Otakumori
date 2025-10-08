'use client';

import { useState, useEffect } from 'react';
import { Shield, MessageSquare, Bell, Filter, UserX } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import GlassButton from './ui/GlassButton';
import { type UserSafetySettings, type UserSafetySettingsUpdate } from '@/app/lib/contracts';

interface SafetySettingsProps {
  className?: string;
}

export default function SafetySettings({ className = '' }: SafetySettingsProps) {
  const [settings, setSettings] = useState<UserSafetySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [_saving, _setSaving] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<
    Array<{ id: string; username: string; display_name?: string }>
  >([]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/safety/settings');
        const result = await response.json();

        if (result.ok) {
          setSettings(result.data);
          // Load blocked users details
          if (result.data.blockedUsers.length > 0) {
            loadBlockedUsers(result.data.blockedUsers);
          }
        } else {
          console.error('Failed to load safety settings:', result.error);
        }
      } catch (error) {
        console.error('Error loading safety settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const loadBlockedUsers = async (userIds: string[]) => {
    try {
      // This would need a proper API endpoint to fetch user details
      // For now, we'll just show the IDs
      setBlockedUsers(userIds.map((id) => ({ id, username: id })));
    } catch (error) {
      console.error('Error loading blocked users:', error);
    }
  };

  const updateSettings = async (updates: UserSafetySettingsUpdate) => {
    try {
      setSaving(true);
      const response = await fetch('/api/v1/safety/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (result.ok) {
        setSettings(result.data);
      } else {
        console.error('Failed to update safety settings:', result.error);
      }
    } catch (error) {
      console.error('Error updating safety settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      const response = await fetch('/api/v1/safety/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'unblock',
        }),
      });

      const result = await response.json();

      if (result.ok) {
        // Remove from local state
        setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
        // Update settings
        if (settings) {
          setSettings({
            ...settings,
            blockedUsers: settings.blockedUsers.filter((id) => id !== userId),
          });
        }
      } else {
        console.error('Failed to unblock user:', result.error);
      }
    } catch (error) {
      console.error('Error unblocking user:', error);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <GlassCard className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-6 bg-white/10 rounded mb-4"></div>
            <div className="h-4 bg-white/5 rounded mb-2"></div>
            <div className="h-4 bg-white/5 rounded w-3/4 mx-auto"></div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className={`${className}`}>
        <GlassCard className="p-8 text-center">
          <Shield className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Safety Settings</h3>
          <p className="text-white/60">Failed to load safety settings.</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-pink-400" />
          <h2 className="text-2xl font-bold text-white">Safety & Privacy</h2>
        </div>

        {/* Communication Settings */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Communication</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Allow Friend Requests</div>
                <div className="text-white/60 text-sm">
                  Let other users send you friend requests
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowFriendRequests}
                  onChange={(e) => updateSettings({ allowFriendRequests: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Allow Party Invites</div>
                <div className="text-white/60 text-sm">Let other users invite you to parties</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowPartyInvites}
                  onChange={(e) => updateSettings({ allowPartyInvites: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Allow Messages</div>
                <div className="text-white/60 text-sm">
                  Let other users send you direct messages
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowMessages}
                  onChange={(e) => updateSettings({ allowMessages: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>
          </div>
        </GlassCard>

        {/* Content Filter */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Content Filter</h3>
          </div>

          <div className="space-y-3">
            <div className="text-white font-medium mb-2">Filter Level</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'strict', label: 'Strict', description: 'Maximum protection' },
                { value: 'moderate', label: 'Moderate', description: 'Balanced filtering' },
                { value: 'lenient', label: 'Lenient', description: 'Minimal filtering' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSettings({ contentFilter: option.value as any })}
                  className={`p-3 rounded-lg border transition-colors ${
                    settings.contentFilter === option.value
                      ? 'border-pink-500 bg-pink-500/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="text-white font-medium text-sm">{option.label}</div>
                  <div className="text-white/60 text-xs">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Report Notifications</div>
                <div className="text-white/60 text-sm">
                  Get notified when your reports are reviewed
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reportNotifications}
                  onChange={(e) => updateSettings({ reportNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Moderation Notifications</div>
                <div className="text-white/60 text-sm">Get notified about moderation actions</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.moderationNotifications}
                  onChange={(e) => updateSettings({ moderationNotifications: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
              </label>
            </div>
          </div>
        </GlassCard>

        {/* Blocked Users */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserX className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Blocked Users</h3>
          </div>

          {blockedUsers.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">No blocked users</p>
            </div>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">
                      {user.display_name || user.username}
                    </div>
                    <div className="text-white/60 text-sm">@{user.username}</div>
                  </div>
                  <GlassButton variant="secondary" size="sm" onClick={() => unblockUser(user.id)}>
                    Unblock
                  </GlassButton>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
