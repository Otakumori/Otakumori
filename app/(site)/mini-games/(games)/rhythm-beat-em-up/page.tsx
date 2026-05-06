'use client';
import { useUser } from '@clerk/nextjs'; // Clerk client
import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import GameShell from '../../_shared/GameShell';
import BootScreen from '@/app/components/games/BootScreen';
import { getAsset } from '../../_shared/assets-resolver';
import type { AssetManifest } from '@/app/components/games/GameAssetPreloader';

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
});

export default function Page() {
  const { isSignedIn } = useUser();
  const [mapOverride, setMapOverride] = useState<string | null>(null);

  // Preload game assets
  const gameAssets = useMemo<AssetManifest>(() => {
    const sprites: string[] = [];
    const images: string[] = [];

    // Collect sprite URLs
    const playerSprite = getAsset('rhythm-beat-em-up', 'sprites.player');
    const enemySprite = getAsset('rhythm-beat-em-up', 'sprites.enemy');
    if (playerSprite) sprites.push(playerSprite);
    if (enemySprite) sprites.push(enemySprite);

    // Collect background image URLs
    const bgUrl = getAsset('rhythm-beat-em-up', 'bg') || getAsset('rhythm-beat-em-up', 'backgrounds.city');
    if (bgUrl) images.push(bgUrl);

    return {
      sprites: sprites.length > 0 ? sprites : undefined,
      images: images.length > 0 ? images : undefined,
      // Audio can be added here if needed
    };
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    const u = new URLSearchParams(location.search).get('map');
    if (u && u.startsWith('/assets/maps/')) setMapOverride(u);
  }, [isSignedIn]);

  return (
    <BootScreen gameId="rhythm-beat" assets={gameAssets}>
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <GameShell gameKey="rhythm-beat-em-up" title="Rhythm Beat-Em-Up">
          <Scene {...(mapOverride ? { mapUrl: mapOverride } : {})} />
        </GameShell>

        {/* Dev-only UI for signed-in users */}
        {isSignedIn && (
          <div className="mt-3 text-xs text-white/70">
            {
              <>
                ''
                <span role="img" aria-label="emoji">
                  D
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  v
                </span>
                <span role="img" aria-label="emoji">
                  :
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  p
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  s
                </span>
                <span role="img" aria-label="emoji">
                  s
                </span>
                ' '''
              </>
            }
            <code>
              {
                <>
                  <span role="img" aria-label="emoji">
                    ?
                  </span>
                  <span role="img" aria-label="emoji">
                    m
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    p
                  </span>
                  <span role="img" aria-label="emoji">
                    =
                  </span>
                  /
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  <span role="img" aria-label="emoji">
                    e
                  </span>
                  <span role="img" aria-label="emoji">
                    t
                  </span>
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  /
                  <span role="img" aria-label="emoji">
                    m
                  </span>
                  <span role="img" aria-label="emoji">
                    a
                  </span>
                  <span role="img" aria-label="emoji">
                    p
                  </span>
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  /
                  <span role="img" aria-label="emoji">
                    y
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    u
                  </span>
                  <span role="img" aria-label="emoji">
                    r
                  </span>
                  .
                  <span role="img" aria-label="emoji">
                    j
                  </span>
                  <span role="img" aria-label="emoji">
                    s
                  </span>
                  <span role="img" aria-label="emoji">
                    o
                  </span>
                  <span role="img" aria-label="emoji">
                    n
                  </span>
                </>
              }
            </code>
            {
              <>
                ''' '
                <span role="img" aria-label="emoji">
                  t
                </span>
                <span role="img" aria-label="emoji">
                  o
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  t
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  s
                </span>
                <span role="img" aria-label="emoji">
                  t
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  a
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  c
                </span>
                <span role="img" aria-label="emoji">
                  u
                </span>
                <span role="img" aria-label="emoji">
                  s
                </span>
                <span role="img" aria-label="emoji">
                  t
                </span>
                <span role="img" aria-label="emoji">
                  o
                </span>
                <span role="img" aria-label="emoji">
                  m
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  m
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  p
                </span>
                . ''
              </>
            }
          </div>
        )}
      </div>
    </BootScreen>
  );
}
