'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Gamepad2, Bell, Eye, Volume2, Palette, Globe, Save } from 'lucide-react';
import {
  UserSettings,
  PrivacySettings,
  GameSettings,
  UserSettingsUpdate,
  PrivacySettingsUpdate,
  GameSettingsUpdate,
} from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'privacy' | 'games' | 'notifications'>(
    'general',
  );
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);

      const [userRes, privacyRes, gamesRes] = await Promise.all([
        fetch('/api/v1/settings/user'),
        fetch('/api/v1/settings/privacy'),
        fetch('/api/v1/settings/games'),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData.ok) {
          setUserSettings(userData.data);
        }
      }

      if (privacyRes.ok) {
        const privacyData = await privacyRes.json();
        if (privacyData.ok) {
          setPrivacySettings(privacyData.data);
        }
      }

      if (gamesRes.ok) {
        const gamesData = await gamesRes.json();
        if (gamesData.ok) {
          setGameSettings(gamesData.data.settings);
        }
      }
    } catch (error) {
      logger.error('Failed to load settings', {
        extra: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserSettings = async (updates: UserSettingsUpdate) => {
    try {
      setIsSaving(true);

      const response = await fetch('/api/v1/settings/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setUserSettings(data.data);
        }
      }
    } catch (error) {
      logger.error('Failed to save user settings', {
        extra: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const savePrivacySettings = async (updates: PrivacySettingsUpdate) => {
    try {
      setIsSaving(true);

      const response = await fetch('/api/v1/settings/privacy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setPrivacySettings(data.data);
        }
      }
    } catch (error) {
      logger.error('Failed to save privacy settings', {
        extra: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveGameSettings = async (updates: GameSettingsUpdate) => {
    try {
      setIsSaving(true);

      const response = await fetch('/api/v1/settings/games', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          setGameSettings((prev) =>
            prev.map((setting) => (setting.gameCode === updates.gameCode ? data.data : setting)),
          );
        }
      }
    } catch (error) {
      logger.error('Failed to save game settings', {
        extra: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Customize your Otakumori experience with personalized settings and preferences.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'general' && userSettings && (
                  <GeneralSettings
                    settings={userSettings}
                    onSave={saveUserSettings}
                    isSaving={isSaving}
                  />
                )}

                {activeTab === 'privacy' && privacySettings && (
                  <PrivacySettingsTab
                    settings={privacySettings}
                    onSave={savePrivacySettings}
                    isSaving={isSaving}
                  />
                )}

                {activeTab === 'games' && (
                  <GameSettingsTab
                    settings={gameSettings}
                    onSave={saveGameSettings}
                    isSaving={isSaving}
                  />
                )}

                {activeTab === 'notifications' && userSettings && (
                  <NotificationSettings
                    settings={userSettings}
                    onSave={saveUserSettings}
                    isSaving={isSaving}
                  />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// General Settings Component
function GeneralSettings({
  settings,
  onSave,
  isSaving,
}: {
  settings: UserSettings;
  onSave: (updates: UserSettingsUpdate) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    profileVisibility: settings.profileVisibility,
    allowFriendRequests: settings.allowFriendRequests,
    allowPartyInvites: settings.allowPartyInvites,
    allowMessages: settings.allowMessages,
    activityVisibility: settings.activityVisibility,
    leaderboardOptOut: settings.leaderboardOptOut,
    contentFilter: settings.contentFilter,
    language: settings.language,
    timezone: settings.timezone,
    theme: settings.theme,
    motionReduced: settings.motionReduced,
    soundEnabled: settings.soundEnabled,
    musicEnabled: settings.musicEnabled,
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-5 w-5 text-pink-600" />
        <h2 className="text-xl font-semibold text-gray-900">General Settings</h2>
      </div>

      {/* Profile Visibility */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Visibility</label>
          <select
            value={formData.profileVisibility}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, profileVisibility: e.target.value as any }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activity Visibility
          </label>
          <select
            value={formData.activityVisibility}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, activityVisibility: e.target.value as any }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="public">Public</option>
            <option value="friends">Friends Only</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>

      {/* Social Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Social Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.allowFriendRequests}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, allowFriendRequests: e.target.checked }))
              }
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Allow friend requests</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.allowPartyInvites}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, allowPartyInvites: e.target.checked }))
              }
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Allow party invites</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.allowMessages}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, allowMessages: e.target.checked }))
              }
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Allow messages</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.leaderboardOptOut}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, leaderboardOptOut: e.target.checked }))
              }
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Opt out of leaderboards</span>
          </label>
        </div>
      </div>

      {/* Appearance & Accessibility */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Appearance & Accessibility</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
            <select
              value={formData.theme}
              onChange={(e) => setFormData((prev) => ({ ...prev, theme: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.motionReduced}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, motionReduced: e.target.checked }))
              }
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Reduce motion</span>
          </label>
        </div>
      </div>

      {/* Audio Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Audio Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.soundEnabled}
              onChange={(e) => setFormData((prev) => ({ ...prev, soundEnabled: e.target.checked }))}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Enable sound effects</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.musicEnabled}
              onChange={(e) => setFormData((prev) => ({ ...prev, musicEnabled: e.target.checked }))}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-700">Enable background music</span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Privacy Settings Component
function PrivacySettingsTab({
  settings,
  onSave,
  isSaving,
}: {
  settings: PrivacySettings;
  onSave: (updates: PrivacySettingsUpdate) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState({
    showOnlineStatus: settings.showOnlineStatus,
    showLastSeen: settings.showLastSeen,
    showActivity: settings.showActivity,
    showAchievements: settings.showAchievements,
    showLeaderboardScores: settings.showLeaderboardScores,
    showPartyActivity: settings.showPartyActivity,
    showPurchaseHistory: settings.showPurchaseHistory,
    allowSearchIndexing: settings.allowSearchIndexing,
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-pink-600" />
        <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Online Status</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.showOnlineStatus}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, showOnlineStatus: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Show online status</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.showLastSeen}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, showLastSeen: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Show last seen</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Activity & Achievements</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.showActivity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, showActivity: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Show activity feed</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.showAchievements}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, showAchievements: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Show achievements</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.showLeaderboardScores}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, showLeaderboardScores: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Show leaderboard scores</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Social & Search</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.showPartyActivity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, showPartyActivity: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Show party activity</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.allowSearchIndexing}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, allowSearchIndexing: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Allow search indexing</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase History</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.showPurchaseHistory}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, showPurchaseHistory: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Show purchase history</span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// Game Settings Component
function GameSettingsTab({
  settings,
  onSave,
  isSaving,
}: {
  settings: GameSettings[];
  onSave: (updates: GameSettingsUpdate) => void;
  isSaving: boolean;
}) {
  const gameCodes = ['petal_samurai', 'puzzle_reveal', 'bubble_girl', 'memory_match'] as const;

  const getGameSettings = (gameCode: string) => {
    return (
      settings.find((s) => s.gameCode === gameCode) || {
        gameCode,
        difficulty: 'normal' as const,
        soundEffects: true,
        music: true,
        hapticFeedback: true,
        autoSave: true,
      }
    );
  };

  const updateGameSettings = (gameCode: string, updates: Partial<GameSettingsUpdate>) => {
    onSave({ gameCode: gameCode as any, ...updates });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Gamepad2 className="h-5 w-5 text-pink-600" />
        <h2 className="text-xl font-semibold text-gray-900">Game Settings</h2>
      </div>

      <div className="space-y-8">
        {gameCodes.map((gameCode) => {
          const gameSettings = getGameSettings(gameCode);
          const gameName = gameCode
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          return (
            <div key={gameCode} className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{gameName}</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={gameSettings.difficulty}
                    onChange={(e) =>
                      updateGameSettings(gameCode, { difficulty: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={gameSettings.soundEffects}
                      onChange={(e) =>
                        updateGameSettings(gameCode, { soundEffects: e.target.checked })
                      }
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Sound effects</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={gameSettings.music}
                      onChange={(e) => updateGameSettings(gameCode, { music: e.target.checked })}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Background music</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={gameSettings.hapticFeedback}
                      onChange={(e) =>
                        updateGameSettings(gameCode, { hapticFeedback: e.target.checked })
                      }
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Haptic feedback</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={gameSettings.autoSave}
                      onChange={(e) => updateGameSettings(gameCode, { autoSave: e.target.checked })}
                      className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Auto-save progress</span>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Notification Settings Component
function NotificationSettings({
  settings,
  onSave,
  isSaving,
}: {
  settings: UserSettings;
  onSave: (updates: UserSettingsUpdate) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState(settings.notificationPreferences);

  const handleSave = () => {
    onSave({ notificationPreferences: formData });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="h-5 w-5 text-pink-600" />
        <h2 className="text-xl font-semibold text-gray-900">Notification Settings</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.checked }))}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Email notifications</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.push}
                onChange={(e) => setFormData((prev) => ({ ...prev, push: e.target.checked }))}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Push notifications</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.inApp}
                onChange={(e) => setFormData((prev) => ({ ...prev, inApp: e.target.checked }))}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">In-app notifications</span>
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.friendRequests}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, friendRequests: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Friend requests</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.partyInvites}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, partyInvites: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Party invites</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.achievements}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, achievements: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Achievements</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.leaderboards}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, leaderboards: e.target.checked }))
                }
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Leaderboard updates</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.comments}
                onChange={(e) => setFormData((prev) => ({ ...prev, comments: e.target.checked }))}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Comments</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.activities}
                onChange={(e) => setFormData((prev) => ({ ...prev, activities: e.target.checked }))}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="text-sm text-gray-700">Friend activities</span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
