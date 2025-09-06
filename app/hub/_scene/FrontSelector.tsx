'use client';
import { useEffect, useMemo, useState } from 'react';
import { useAnchors } from './anchors';
import { useHub, ORDER } from './store';

// Fallback icons - you can replace these with actual icon paths later
const iconMap: Record<string, string> = {
  games: '🎮',
  trade: '💎',
  avatar: '👤',
  music: '🎵',
  drawerTop: '💾',
  drawerBottom: '📝',
};

export default function FrontSelector() {
  const { anchors } = useAnchors();
  const { face, selectorIndex, focusChip, setFace, confirm, isZooming } = useHub();
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    function refreshCenter() {
      setCenter({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
    refreshCenter();
    window.addEventListener('resize', refreshCenter);
    return () => window.removeEventListener('resize', refreshCenter);
  }, []);

  // only render chips while front is focused
  if (face !== 'front') return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[4]">
      {ORDER.map((key, i) => {
        const a = anchors[key];
        if (!a?.visible) return null;
        const isHot = i === selectorIndex;
        return (
          <button
            key={key}
            className={`gc-chip ${isHot ? 'hot' : ''}`}
            style={{ left: a.x, top: a.y }}
            onMouseEnter={() => focusChip(i)}
            onClick={() => {
              focusChip(i);
              setTimeout(() => confirm(), 0);
            }}
          >
            <span className="gc-chip-ico">{iconMap[key]}</span>
            <span className="gc-chip-label">{label(key)}</span>
            {/* ripple line toward screen center */}
            {!isZooming && (
              <span className="gc-ripple" style={rippleStyle(a.x, a.y, center.x, center.y)} />
            )}
          </button>
        );
      })}
      {/* drawers */}
      {['drawerTop', 'drawerBottom'].map((k) => {
        const a = (anchors as any)[k];
        if (!a?.visible) return null;
        return (
          <a
            key={k}
            className="gc-chip gc-chip--drawer"
            style={{ left: a.x, top: a.y }}
            href={k === 'drawerTop' ? '/achievements' : '/soapstones'}
          >
            <span className="gc-chip-ico">{iconMap[k]}</span>
            <span className="gc-chip-label">
              {k === 'drawerTop' ? 'Memory Card' : 'Soapstones'}
            </span>
          </a>
        );
      })}
    </div>
  );
}

function label(k: 'games' | 'trade' | 'avatar' | 'music') {
  return (
    {
      games: 'Mini-Games',
      trade: 'Trade Center',
      avatar: 'Avatar & Community',
      music: 'Music Player',
    } as const
  )[k];
}

function rippleStyle(x: number, y: number, cx: number, cy: number) {
  const dx = cx - x;
  const dy = cy - y;
  const len = Math.max(0, Math.hypot(dx, dy) - 40);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI; // deg
  return {
    width: `${len}px`,
    transform: `translate(-50%, -50%) rotate(${ang}deg)`,
  } as React.CSSProperties;
}
