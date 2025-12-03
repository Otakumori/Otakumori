'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarDisplay } from '@/app/components/profile/AvatarDisplay';
import { AvatarGallery } from './AvatarGallery';
import { CommunitySettings } from './CommunitySettings';
import { AdultContentGate } from './AdultContentGate';
import { LeaderboardsTab } from './LeaderboardsTab';

type ActiveTab = 'showcase' | 'gallery' | 'settings' | 'gated' | 'leaderboards';

export function CommunityHub() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<ActiveTab>('showcase');

  // Check if user has adult verification
  const isAdultVerified = user?.publicMetadata?.adultVerified === true;

  const tabs = [
    { id: 'showcase' as const, label: 'Avatar Showcase', icon: '' },
    { id: 'gallery' as const, label: 'Community Gallery', icon: '<span role="img" aria-label="emoji">️</span>' },
    { id: 'leaderboards' as const, label: 'Leaderboards', icon: '<span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>' },
    { id: 'settings' as const, label: 'Community Settings', icon: '' },
    ...(isAdultVerified ? [{ id: 'gated' as const, label: 'Gated Content', icon: '' }] : []),
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Community Hub</h1>
          <p className="text-zinc-300">
            Share your avatars, explore the community, and connect with fellow travelers
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/10 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'showcase' && <AvatarShowcase />}
            {activeTab === 'gallery' && <AvatarGallery />}
            {activeTab === 'leaderboards' && <LeaderboardsTab />}
            {activeTab === 'settings' && <CommunitySettings />}
            {activeTab === 'gated' && isAdultVerified && <AdultContentGate />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AvatarShowcase() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Your Avatar Showcase</h2>
        <p className="text-zinc-300 mb-6">
          Display your custom avatar and share it with the community
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Avatar Display */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Current Avatar</h3>
          <div className="flex justify-center">
            <AvatarDisplay size="lg" showEditButton={true} />
          </div>
          <div className="mt-4 text-center">
            <button className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
              Share to Gallery
            </button>
          </div>
        </div>

        {/* Avatar Stats */}
        <div className="bg-white/10 rounded-xl p-6 border border-white/20">
          <h3 className="text-xl font-semibold text-white mb-4">Avatar Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Views</span>
              <span className="text-white font-semibold">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Likes</span>
              <span className="text-white font-semibold">89</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Shares</span>
              <span className="text-white font-semibold">23</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-300">Downloads</span>
              <span className="text-white font-semibold">12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm"></span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">
                Your avatar was featured in the community gallery
              </p>
              <p className="text-zinc-400 text-xs">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm"><span role="img" aria-label="emoji">️</span></span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">Someone liked your avatar design</p>
              <p className="text-zinc-400 text-xs">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm"></span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm">Your avatar was downloaded by a community member</p>
              <p className="text-zinc-400 text-xs">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
