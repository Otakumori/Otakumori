'use client';

import { useEffect, useState } from 'react';
import GameCubeBootSequence from '@/app/components/gamecube/GameCubeBootSequence';
import GameCubeHubV2 from './_components/GameCubeHubV2';
import ErrorBoundary3D from '@/components/ErrorBoundary3D';
import ClientErrorBoundary from '@/app/components/util/ClientErrorBoundary';

export default function HubClient() {
  const [bootState, setBootState] = useState<'loading' | 'boot' | 'hub'>('loading');

  useEffect(() => {
    // Always show boot sequence (no localStorage gating)
    setBootState('boot');
  }, []);

  const handleBootComplete = () => {
    // No localStorage - always show boot on next visit
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
    return (
      <ClientErrorBoundary>
        <GameCubeBootSequence onComplete={handleBootComplete} skipable={true} />
      </ClientErrorBoundary>
    );
  }

  return (
    <ClientErrorBoundary>
      <ErrorBoundary3D>
        <GameCubeHubV2 />
      </ErrorBoundary3D>
    </ClientErrorBoundary>
  );
}
