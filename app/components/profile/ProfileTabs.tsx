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

export default function ProfileTabs({
  overview,
  achievements,
  games,
  cosmetics,
}: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'games', label: 'Games' },
    { id: 'cosmetics', label: 'Cosmetics' },
  ];

  const panels: Record<TabId, ReactNode> = {
    overview,
    achievements,
    games,
    cosmetics,
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();

    let nextIndex = index;
    if (e.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    if (e.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = tabs.length - 1;

    const next = tabs[nextIndex];
    if (!next) return;
    setActiveTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  };

  return (
    <section className="mori-panel overflow-hidden">
      <div className="flex overflow-x-auto border-b border-white/[0.08] bg-black/10 px-2" role="tablist" aria-label="Profile sections">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`relative shrink-0 px-4 py-4 text-sm font-medium transition-colors sm:px-5 ${
              activeTab === tab.id
                ? 'text-[#fff1e4]'
                : 'text-[#8f7f7d] hover:text-[#d9ccc7]'
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-3 bottom-0 h-px bg-[#c7a97f]" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={`tabpanel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab.id}`}
            hidden={activeTab !== tab.id}
          >
            {activeTab === tab.id ? panels[tab.id] : null}
          </div>
        ))}
      </div>
    </section>
  );
}
