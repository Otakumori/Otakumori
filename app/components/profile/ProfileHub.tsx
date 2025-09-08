'use client';

import { useState } from 'react';
import Link from 'next/link';
import GlassPanel from '../GlassPanel';
import ProfileLoadout from './ProfileLoadout';
import { t } from '../../lib/microcopy';

type ProfileData = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  totalPetals: number;
  achievements: number;
  orders: number;
  joinDate: string;
} | null;

type ProfileHubProps = {
  profileData: ProfileData;
};

export default function ProfileHub({ profileData }: ProfileHubProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', href: '/profile' },
    { id: 'orders', label: 'Orders', href: '/profile/orders' },
    { id: 'petals', label: 'Rewards (Petals)', href: '/profile/petals' },
    { id: 'achievements', label: 'Achievements', href: '/profile/achievements' },
    { id: 'addresses', label: 'Addresses', href: '/profile/addresses' },
    { id: 'security', label: 'Security', href: '/profile/security' },
  ];

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <GlassPanel className="p-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Loading your shrine...
          </h2>
          <p className="text-zinc-400">
            Please wait while we gather your profile data.
          </p>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
      {/* Profile Sidebar */}
      <div className="lg:col-span-1">
        <GlassPanel className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
              <span className="text-2xl text-fuchsia-300">
                {profileData.avatar ? '👤' : '🌸'}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white">{profileData.username}</h2>
            <p className="text-sm text-zinc-400">{profileData.email}</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-300">Total Petals</span>
              <span className="text-fuchsia-300 font-semibold">{profileData.totalPetals}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-300">Achievements</span>
              <span className="text-fuchsia-300 font-semibold">{profileData.achievements}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-300">Orders</span>
              <span className="text-fuchsia-300 font-semibold">{profileData.orders}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-300">Member Since</span>
              <span className="text-zinc-400">
                {new Date(profileData.joinDate).toLocaleDateString()}
              </span>
            </div>
            
            {/* Loadout Button */}
            <div className="pt-4 border-t border-white/10">
              <ProfileLoadout />
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white/5 rounded-xl p-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-center transition-colors ${
                  activeTab === tab.id
                    ? 'bg-fuchsia-500/90 text-white'
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Overview Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <GlassPanel className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-fuchsia-400 rounded-full"></div>
                  <span className="text-zinc-300">Collected 5 petals from the cherry tree</span>
                  <span className="text-zinc-500 ml-auto">2 hours ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-zinc-300">Unlocked achievement: "First Steps"</span>
                  <span className="text-zinc-500 ml-auto">1 day ago</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-zinc-300">Completed order #1234</span>
                  <span className="text-zinc-500 ml-auto">3 days ago</span>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-fuchsia-300">{profileData.totalPetals}</div>
                  <div className="text-sm text-zinc-400">Petals Collected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-fuchsia-300">{profileData.achievements}</div>
                  <div className="text-sm text-zinc-400">Achievements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-fuchsia-300">{profileData.orders}</div>
                  <div className="text-sm text-zinc-400">Orders Placed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-fuchsia-300">12</div>
                  <div className="text-sm text-zinc-400">Games Played</div>
                </div>
              </div>
            </GlassPanel>
          </div>
        )}
      </div>
    </div>
  );
}
