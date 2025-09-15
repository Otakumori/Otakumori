'use client';

import { useWorld } from '@/app/world/WorldProvider';

export default function QuakeHUD() {
  const { settings } = useWorld();

  if (settings.avatarMode !== 'hud') return null;

  return (
    <div className="fixed left-4 bottom-4 z-40 pointer-events-auto hud-shell">
      <div className="hud-panel">
        <div className="hud-avatar">{/* cropped avatar render */}</div>
        <div className="hud-bars">
          <div className="bar stamina">
            <span />
          </div>
          <div className="bar xp">
            <span />
          </div>
        </div>
        <div className="hud-metrics">
          <button className="petals">
            ◦{' '}
            <b>
              {
                <>
                  <span role="img" aria-label="emoji">
                    1
                  </span>
                  ,
                  <span role="img" aria-label="emoji">
                    2
                  </span>
                  <span role="img" aria-label="emoji">
                    4
                  </span>
                  <span role="img" aria-label="emoji">
                    8
                  </span>
                </>
              }
            </b>
          </button>
          <button className="quest-ticker">
            {
              <>
                <span role="img" aria-label="emoji">
                  P
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  t
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  l
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  C
                </span>
                <span role="img" aria-label="emoji">
                  o
                </span>
                <span role="img" aria-label="emoji">
                  l
                </span>
                <span role="img" aria-label="emoji">
                  l
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  c
                </span>
                <span role="img" aria-label="emoji">
                  t
                </span>
                <span role="img" aria-label="emoji">
                  o
                </span>
                <span role="img" aria-label="emoji">
                  r
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  2
                </span>
                <span role="img" aria-label="emoji">
                  3
                </span>
                /
                <span role="img" aria-label="emoji">
                  5
                </span>
                <span role="img" aria-label="emoji">
                  0
                </span>
              </>
            }
          </button>
        </div>
        <div className="hud-toasts" aria-live="polite" />
      </div>
    </div>
  );
}
