'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export function CommunitySettings() {
  const { user } = useUser();
  const [settings, setSettings] = useState({
    allowAvatarSharing: true,
    allowAvatarDownloads: true,
    showInGallery: true,
    allowSuggestiveOutfits: false,
    allowSuggestivePhysics: false,
    allowSuggestiveInteractions: false,
    emailNotifications: true,
    pushNotifications: false,
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Community Settings</h2>
        <p className="text-zinc-300 mb-6">
          Customize your community experience and privacy preferences
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Avatar Sharing Settings */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Avatar Sharing</h3>
          <div className="space-y-4">
            <SettingToggle
              label="Allow others to download my avatar"
              description="Let community members download and use your avatar designs"
              checked={settings.allowAvatarDownloads}
              onChange={(value) => handleSettingChange('allowAvatarDownloads', value)}
            />
            <SettingToggle
              label="Show my avatar in community gallery"
              description="Display your avatar in the public community gallery"
              checked={settings.showInGallery}
              onChange={(value) => handleSettingChange('showInGallery', value)}
            />
            <SettingToggle
              label="Allow avatar sharing with attribution"
              description="Let others share your avatar with proper credit"
              checked={settings.allowAvatarSharing}
              onChange={(value) => handleSettingChange('allowAvatarSharing', value)}
            />
          </div>
        </div>

        {/* Adult Content Settings */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Adult Content Preferences</h3>
          <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 text-sm">
              ⚠️ These settings require adult verification. Some content may not be suitable for all
              audiences.
            </p>
          </div>
          <div className="space-y-4">
            <SettingToggle
              label="Allow suggestive outfits"
              description="Enable suggestive clothing options in avatar creation"
              checked={settings.allowSuggestiveOutfits}
              onChange={(value) => handleSettingChange('allowSuggestiveOutfits', value)}
              disabled={!user?.publicMetadata?.adultVerified}
            />
            <SettingToggle
              label="Allow suggestive physics"
              description="Enable physics effects for suggestive content"
              checked={settings.allowSuggestivePhysics}
              onChange={(value) => handleSettingChange('allowSuggestivePhysics', value)}
              disabled={!user?.publicMetadata?.adultVerified}
            />
            <SettingToggle
              label="Allow suggestive interactions"
              description="Enable suggestive interaction animations"
              checked={settings.allowSuggestiveInteractions}
              onChange={(value) => handleSettingChange('allowSuggestiveInteractions', value)}
              disabled={!user?.publicMetadata?.adultVerified}
            />
          </div>
          {!user?.publicMetadata?.adultVerified && (
            <div className="mt-4">
              <a
                href="/adults/verify"
                className="inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Verify Age for Adult Content
              </a>
            </div>
          )}
        </div>

        {/* Notification Settings */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Notifications</h3>
          <div className="space-y-4">
            <SettingToggle
              label="Email notifications"
              description="Receive notifications via email about community activity"
              checked={settings.emailNotifications}
              onChange={(value) => handleSettingChange('emailNotifications', value)}
            />
            <SettingToggle
              label="Push notifications"
              description="Receive browser push notifications"
              checked={settings.pushNotifications}
              onChange={(value) => handleSettingChange('pushNotifications', value)}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-6">
          <motion.button
            className="px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Settings
          </motion.button>
        </div>
      </div>
    </div>
  );
}

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: SettingToggleProps) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-1">
        <h4 className="font-medium text-white mb-1">{label}</h4>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          disabled ? 'bg-gray-600 cursor-not-allowed' : checked ? 'bg-pink-500' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
