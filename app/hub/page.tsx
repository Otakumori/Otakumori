// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';
import { useEffect } from 'react';
import CubeHub from './_scene/CubeHub';
import AvatarPerch from './_scene/AvatarPerch';
import FrontSelector from './_scene/FrontSelector';
import { useHub } from './_scene/store';
import { useHubInput } from './_scene/useInput';
import './_scene/hub.css';
import { play } from '@/app/mini-games/_shared/audio-bus';
import Link from 'next/link';

export default function HubPage() {
  const { face, isZooming, backToIdle } = useHub();
  useHubInput();

  // ambience loop
  useEffect(() => {
    let playing = true;
    (async () => {
      try {
        if (playing) {
          await play('/assets/music/hub_ambience.ogg', -18);
        }
      } catch {}
    })();
    return () => {
      playing = false;
    };
  }, []);

  // after confirm animation, navigate
  useEffect(() => {
    if (!isZooming) return;
    const t = setTimeout(() => {
      if (face === 'games') location.assign('/mini-games');
      if (face === 'trade') location.assign('/trade');
      if (face === 'avatar') location.assign('/profile');
      if (face === 'music') location.assign('/music');
      backToIdle();
    }, 450);
    return () => clearTimeout(t);
  }, [isZooming, face, backToIdle]);

  return (
    <div className="hub-root">
      {/* sky/petals layer is your existing background; this is content */}
      <div className="hub-topbar">
        <Link href="/" className="hub-brand">
          {
            <>
              ''
              <span role="img" aria-label="emoji">
                O
              </span>
              <span role="img" aria-label="emoji">
                T
              </span>
              <span role="img" aria-label="emoji">
                A
              </span>
              <span role="img" aria-label="emoji">
                K
              </span>
              <span role="img" aria-label="emoji">
                U
              </span>
              <span role="img" aria-label="emoji">
                M
              </span>
              <span role="img" aria-label="emoji">
                O
              </span>
              <span role="img" aria-label="emoji">
                R
              </span>
              <span role="img" aria-label="emoji">
                I
              </span>
              ''
            </>
          }
        </Link>
        <div className="hub-right">
          <Link href="/achievements" className="hub-btn">
            {
              <>
                ''
                <span role="img" aria-label="emoji">
                  M
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  m
                </span>
                <span role="img" aria-label="emoji">
                  o
                </span>
                <span role="img" aria-label="emoji">
                  r
                </span>
                <span role="img" aria-label="emoji">
                  y
                </span>
                ' '
                <span role="img" aria-label="emoji">
                  C
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  r
                </span>
                <span role="img" aria-label="emoji">
                  d
                </span>
                ''
              </>
            }
          </Link>
          <Link href="/soapstones" className="hub-btn">
            {
              <>
                ''
                <span role="img" aria-label="emoji">
                  S
                </span>
                <span role="img" aria-label="emoji">
                  o
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
                <span role="img" aria-label="emoji">
                  t
                </span>
                <span role="img" aria-label="emoji">
                  o
                </span>
                <span role="img" aria-label="emoji">
                  n
                </span>
                <span role="img" aria-label="emoji">
                  e
                </span>
                <span role="img" aria-label="emoji">
                  s
                </span>
                ''
              </>
            }
          </Link>
          <Link href="/mini-games" className="hub-btn">
            {
              <>
                ''
                <span role="img" aria-label="emoji">
                  P
                </span>
                <span role="img" aria-label="emoji">
                  l
                </span>
                <span role="img" aria-label="emoji">
                  a
                </span>
                <span role="img" aria-label="emoji">
                  y
                </span>
                ''
              </>
            }
          </Link>
        </div>
      </div>
      {/* Cube + avatar sit lower in frame */}
      <div className="hub-stage">
        <CubeHub />
        <AvatarPerch />
        <FrontSelector />

        {/* D-pad hints */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-xl border border-white/15 bg-black/35 px-3 py-1 text-sm">
          {
            <>
              '' ←' '/' '→' '
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              ' '
              <span role="img" aria-label="emoji">
                r
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                a
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              ' '•' '
              <span role="img" aria-label="emoji">
                E
              </span>
              <span role="img" aria-label="emoji">
                n
              </span>
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                e
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              ' '
              <span role="img" aria-label="emoji">
                t
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              ' '
              <span role="img" aria-label="emoji">
                c
              </span>
              <span role="img" aria-label="emoji">
                o
              </span>
              <span role="img" aria-label="emoji">
                n
              </span>
              <span role="img" aria-label="emoji">
                f
              </span>
              <span role="img" aria-label="emoji">
                i
              </span>
              <span role="img" aria-label="emoji">
                r
              </span>
              <span role="img" aria-label="emoji">
                m
              </span>
              ''
            </>
          }
        </div>
      </div>
    </div>
  );
}
