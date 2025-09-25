'use client';

import { useEffect, useState } from 'react';
import GameCubeBootOverlay from './_components/GameCubeBootOverlay';
import GameCubeHubV2 from './_components/GameCubeHubV2';

export default function HubClient() {
  const [bootState, setBootState] = useState<'loading' | 'boot' | 'hub'>('loading');

  useEffect(() => {
    // Check if boot should be shown (once per day)
    try {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const bootKey = `otm_gc_boot_${today}`;
      const sessionKey = 'otm_gc_boot_seen';

      // Check localStorage for today's boot
      const hasBootedToday = localStorage.getItem(bootKey) === 'true';

      // Check sessionStorage for this session
      const hasBootedThisSession = sessionStorage.getItem(sessionKey) === 'true';

      if (hasBootedToday || hasBootedThisSession) {
        setBootState('hub');
      } else {
        setBootState('boot');
      }
    } catch {
      // If localStorage/sessionStorage fails, skip boot
      setBootState('hub');
    }
  }, []);

  const handleBootComplete = () => {
    try {
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const bootKey = `otm_gc_boot_${today}`;
      const sessionKey = 'otm_gc_boot_seen';

      // Mark as booted for today and this session
      localStorage.setItem(bootKey, 'true');
      sessionStorage.setItem(sessionKey, 'true');
    } catch {
      // Ignore storage errors
    }

    setBootState('hub');
  };

  const handleBootSkip = () => {
    try {
      const sessionKey = 'otm_gc_boot_seen';
      // Only mark session as seen, not the daily flag
      sessionStorage.setItem(sessionKey, 'true');
    } catch {
      // Ignore storage errors
    }

    setBootState('hub');
  };

  if (bootState === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-pink-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (bootState === 'boot') {
    return <GameCubeBootOverlay onComplete={handleBootComplete} onSkip={handleBootSkip} />;
  }

  return <GameCubeHubV2 />;
}
