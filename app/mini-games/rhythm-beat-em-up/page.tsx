'use client';
import { useUser } from '@clerk/nextjs'; // Clerk client
import { useEffect, useState } from 'react';
import GameShell from '../_shared/GameShell';
import BootScreen from '../../components/games/BootScreen';
import Scene from './Scene';

);
}
export default function Page() {
  const { isSignedIn } = useUser();
  const [mapOverride, setMapOverride] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    const u = new URLSearchParams(location.search).get('map');
    if (u && u.startsWith('/assets/maps/')) setMapOverride(u);
  }, [isSignedIn]);

  return (
    <BootScreen gameId="rhythm-beat">
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
