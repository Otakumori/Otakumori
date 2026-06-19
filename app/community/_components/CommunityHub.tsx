'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { GuestModeBanner } from './GuestModeBanner';

type ActiveTab = 'overview' | 'creator' | 'showcase' | 'gallery' | 'settings' | 'gated' | 'leaderboards';

const AvatarDisplay = dynamic(
  () => import('@/app/components/profile/AvatarDisplay').then((mod) => mod.AvatarDisplay),
  {
    ssr: false,
    loading: () => <div className="text-sm text-zinc-400">Loading avatar preview...</div>,
  },
);
const AvatarGallery = dynamic(() => import('./AvatarGallery').then((mod) => mod.AvatarGallery), {
  ssr: false,
  loading: () => <TabLoading label="Loading gallery..." />,
});
const CommunitySettings = dynamic(
  () => import('./CommunitySettings').then((mod) => mod.CommunitySettings),
  { ssr: false, loading: () => <TabLoading label="Loading settings..." /> },
);
const AdultContentGate = dynamic(
  () => import('./AdultContentGate').then((mod) => mod.AdultContentGate),
  { ssr: false, loading: () => <TabLoading label="Loading gated content..." /> },
);
const LeaderboardsTab = dynamic(
  () => import('./LeaderboardsTab').then((mod) => mod.LeaderboardsTab),
  { ssr: false, loading: () => <TabLoading label="Loading leaderboards..." /> },
);
const AvatarCreatorTab = dynamic(
  () => import('./AvatarCreatorTab').then((mod) => mod.AvatarCreatorTab),
  { ssr: false, loading: () => <TabLoading label="Loading avatar creator..." /> },
);

function TabLoading({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-zinc-300">
      {label}
    </div>
  );
}

export function CommunityHub({ performanceMode = false }: { performanceMode?: boolean }) {
  if (performanceMode) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-white">Community Hub</h1>
            <p className="text-zinc-300">
              Share your avatars, explore the community, and connect with fellow travelers
            </p>
          </div>
          <CommunityOverview onSelectTab={() => undefined} />
        </div>
      </div>
    );
  }

  return <CommunityHubInteractive />;
}

function CommunityHubInteractive() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const isAdultVerified = user?.publicMetadata?.adultVerified === true;

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'OM' },
    { id: 'creator' as const, label: 'Avatar Creator', icon: 'Art' },
    { id: 'showcase' as const, label: 'Avatar Showcase', icon: 'AV' },
    { id: 'gallery' as const, label: 'Community Gallery', icon: 'Gallery' },
    { id: 'leaderboards' as const, label: 'Leaderboards', icon: 'Rank' },
    { id: 'settings' as const, label: 'Community Settings', icon: 'Prefs' },
    ...(isAdultVerified ? [{ id: 'gated' as const, label: 'Gated Content', icon: '18+' }] : []),
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-white">Community Hub</h1>
          <p className="text-zinc-300">
            Share your avatars, explore the community, and connect with fellow travelers
          </p>
        </div>

        <GuestModeBanner />

        <div className="mb-8 flex space-x-1 rounded-lg bg-white/10 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center space-x-2 rounded-md px-4 py-3 transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-pink-500 text-white shadow-lg'
                  : 'text-zinc-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">{tab.icon}</span>
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && <CommunityOverview onSelectTab={setActiveTab} />}
            {activeTab === 'creator' && <AvatarCreatorTab />}
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

function CommunityOverview({ onSelectTab }: { onSelectTab: (tab: ActiveTab) => void }) {
  const cards = [
    {
      title: 'Create an avatar',
      body: 'Open the full creator when you are ready to customize and save a traveler.',
      action: 'Open creator',
      tab: 'creator' as const,
    },
    {
      title: 'Browse the gallery',
      body: 'See community-inspired avatar concepts without needing live provider data.',
      action: 'View gallery',
      tab: 'gallery' as const,
    },
    {
      title: 'Check rankings',
      body: 'Leaderboards load on demand so the public hub stays quick and stable.',
      action: 'Open leaderboards',
      tab: 'leaderboards' as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <button
          key={card.title}
          type="button"
          onClick={() => onSelectTab(card.tab)}
          className="rounded-xl border border-white/15 bg-white/[0.07] p-6 text-left transition hover:-translate-y-0.5 hover:border-pink-300/50 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-pink-200"
        >
          <h2 className="text-xl font-semibold text-white">{card.title}</h2>
          <p className="mt-3 text-sm text-zinc-300">{card.body}</p>
          <span className="mt-5 inline-flex text-sm font-semibold text-pink-200">{card.action}</span>
        </button>
      ))}
    </div>
  );
}

function AvatarShowcase() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">Your Avatar Showcase</h2>
        <p className="mb-6 text-zinc-300">
          Display your custom avatar and share it with the community
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-white/20 bg-white/10 p-6">
          <h3 className="mb-4 text-xl font-semibold text-white">Current Avatar</h3>
          <div className="flex justify-center">
            <AvatarDisplay size="lg" showEditButton={true} />
          </div>
          <div className="mt-4 text-center">
            <button className="rounded-lg bg-pink-500 px-6 py-2 text-white transition-colors hover:bg-pink-600">
              Share to Gallery
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-white/20 bg-white/10 p-6">
          <h3 className="mb-4 text-xl font-semibold text-white">Avatar Statistics</h3>
          <div className="space-y-4">
            <StatRow label="Views" value="1,247" />
            <StatRow label="Likes" value="89" />
            <StatRow label="Shares" value="23" />
            <StatRow label="Downloads" value="12" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-white/20 bg-white/10 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">Recent Activity</h3>
        <div className="space-y-3">
          <ActivityRow text="Your avatar was featured in the community gallery" time="2 hours ago" />
          <ActivityRow text="Someone liked your avatar design" time="5 hours ago" />
          <ActivityRow text="Your avatar was downloaded by a community member" time="1 day ago" />
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-300">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function ActivityRow({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex items-center space-x-3 rounded-lg bg-white/5 p-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500">
        <span className="text-sm text-white">OM</span>
      </div>
      <div className="flex-1">
        <p className="text-sm text-white">{text}</p>
        <p className="text-xs text-zinc-400">{time}</p>
      </div>
    </div>
  );
}
