/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
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
        await play('/assets/music/hub_ambience.ogg', -18);
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
          OTAKUMORI
        </Link>
        <div className="hub-right">
          <Link href="/achievements" className="hub-btn">
            Memory Card
          </Link>
          <Link href="/soapstones" className="hub-btn">
            Soapstones
          </Link>
          <Link href="/mini-games" className="hub-btn">
            Play
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
          ← / → to rotate • Enter to confirm
        </div>
      </div>
    </div>
  );
}
