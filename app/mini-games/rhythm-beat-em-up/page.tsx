/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';
import { useUser } from '@clerk/nextjs'; // Clerk client
import { useEffect, useState } from 'react';
import GameShell from '../_shared/GameShell';
import Scene from './Scene';

export default function Page() {
  const { isSignedIn } = useUser();
  const [mapOverride, setMapOverride] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    const u = new URLSearchParams(location.search).get('map');
    if (u && u.startsWith('/assets/maps/')) setMapOverride(u);
  }, [isSignedIn]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <GameShell gameKey="rhythm-beat-em-up" title="Rhythm Beat-Em-Up">
        <Scene mapUrl={mapOverride ?? undefined} />
      </GameShell>

      {/* Dev-only UI for signed-in users */}
      {isSignedIn && (
        <div className="mt-3 text-xs text-white/70">
          Dev: pass <code>?map=/assets/maps/your.json</code> to test a custom map.
        </div>
      )}
    </div>
  );
}
