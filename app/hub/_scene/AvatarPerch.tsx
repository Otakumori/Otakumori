 
 
'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useHub } from './store';
import { getAsset } from '@/app/mini-games/_shared/assets-resolver';

export default function AvatarPerch() {
  const { isZooming } = useHub();
  const host = useRef<HTMLDivElement>(null);

  const imgUrl = getAsset('site', 'avatarIdle') ?? '/assets/ui/hub/avatar_idle.png';
  const shadowUrl = getAsset('site', 'avatarShadow') ?? '/assets/ui/hub/avatar_shadow.png';

  // gentle sway synced to time
  useEffect(() => {
    let raf = 0;
    function tick() {
      const el = host.current!;
      const t = performance.now() * 0.0014;
      const wob = Math.sin(t) * 2; // deg
      const bob = Math.sin(t * 0.5) * 1.5; // px
      el.style.transform = `translate(-50%, calc(-100% - 30px + ${bob}px)) rotate(${wob}deg) scale(${isZooming ? 0.96 : 1})`;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isZooming]);

  return (
    <div className="pointer-events-none absolute left-1/2 top-0 z-[5]">
      <div ref={host} style={{ transformOrigin: '50% 100%' }}>
        <img
          src={imgUrl}
          alt=""
          style={{ width: 200, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,.5))' }}
        />
        <img
          src={shadowUrl}
          alt=""
          style={{ width: 140, opacity: 0.6, transform: 'translate(30px, -26px)' }}
        />
      </div>
    </div>
  );
}
