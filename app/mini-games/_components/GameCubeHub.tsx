'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { initInput } from './InputController';
import FaceLabel from './FaceLabel';

const ConsoleCard = dynamic(() => import('../console/ConsoleCard'), { ssr: false });

const faces = [
  { id: 'petal-run', label: 'Petal Run', href: '/mini-games/petal-run' },
  { id: 'memory', label: 'Memory', href: '/mini-games/memory' },
  { id: 'rhythm', label: 'Rhythm', href: '/mini-games/rhythm' },
];

export default function GameCubeHub() {
  const [idx, setIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const active = faces[idx];

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const cleanup = initInput(node, {
      onRotateLeft: () => setIdx((i) => (i + faces.length - 1) % faces.length),
      onRotateRight: () => setIdx((i) => (i + 1) % faces.length),
      onSelect: () => router.push(active.href),
      onBack: () => setIdx(0),
    });
    return cleanup;
  }, [active.href, router]);

  const listboxId = useMemo(() => `faces_${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <section
      ref={containerRef}
      tabIndex={0}
      className="relative isolate z-0 mx-auto w-full max-w-[900px] h-[min(80vh,90svh)] overflow-hidden outline-none"
    >
      {/* 3D canvas / hub */}
      <div className="absolute inset-0 z-0">
        <ConsoleCard />
      </div>
      {/* Overlay labels */}
      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-10 grid place-items-center p-2">
        <div
          className="flex max-w-[720px] flex-wrap items-center justify-center gap-2"
          role="listbox"
          aria-activedescendant={`${listboxId}_${active.id}`}
        >
          {faces.map((f, i) => (
            <FaceLabel
              key={f.id}
              id={`${listboxId}_${f.id}`}
              label={f.label}
              href={f.href}
              active={i === idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
