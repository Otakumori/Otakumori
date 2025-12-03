'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

interface ProfileTabsProps {
  overview: ReactNode;
  achievements: ReactNode;
  games: ReactNode;
  cosmetics: ReactNode;
}

type TabId = 'overview' | 'achievements' | 'games' | 'cosmetics';

/**
 * Tabbed interface for profile sections
 * Keyboard accessible and responsive
 */
export default function ProfileTabs({
  overview,
  achievements,
  games,
  cosmetics,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '<span role="img" aria-label="emoji">�</span>�' },
    { id: 'achievements', label: 'Achievements', icon: '<span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>' },
    { id: 'games', label: 'Games', icon: '<span role="img" aria-label="emoji">�</span><span role="img" aria-label="emoji">�</span>' },
    { id: 'cosmetics', label: 'Cosmetics', icon: '<span role="img" aria-label="sparkles">✨</span>' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent, tabId: TabId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabId);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/50 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-white/10 bg-white/5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-pink-500/20 text-pink-300 border-b-2 border-pink-500'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <div
          id="tabpanel-overview"
          role="tabpanel"
          aria-labelledby="tab-overview"
          hidden={activeTab !== 'overview'}
        >
          {activeTab === 'overview' && overview}
        </div>

        <div
          id="tabpanel-achievements"
          role="tabpanel"
          aria-labelledby="tab-achievements"
          hidden={activeTab !== 'achievements'}
        >
          {activeTab === 'achievements' && achievements}
        </div>

        <div
          id="tabpanel-games"
          role="tabpanel"
          aria-labelledby="tab-games"
          hidden={activeTab !== 'games'}
        >
          {activeTab === 'games' && games}
        </div>

        <div
          id="tabpanel-cosmetics"
          role="tabpanel"
          aria-labelledby="tab-cosmetics"
          hidden={activeTab !== 'cosmetics'}
        >
          {activeTab === 'cosmetics' && cosmetics}
        </div>
      </div>
    </div>
  );
}
