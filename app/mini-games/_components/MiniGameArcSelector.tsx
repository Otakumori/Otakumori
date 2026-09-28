'use client';

import Link from 'next/link';
import type { CSSProperties, KeyboardEvent } from 'react';
import { useMemo, useRef, useState } from 'react';

import { MoriLineTrace, MoriSealMark } from '@/app/components/mori/MoriInteraction';
import { getApprovedGamePresentation } from '@/lib/approved-visual-assets';

export type MiniGameArcOption = {
  category: string;
  description: string;
  id: string;
  slug: string;
  title: string;
};

const swipeThreshold = 32;

function wrapIndex(index: number, length: number) {
  return (index + length) % length;
}

export function MiniGameArcSelector({ games }: { games: MiniGameArcOption[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const selectedGame = games[selectedIndex];
  const displayName = useMemo(
    () =>
      selectedGame
        ? (getApprovedGamePresentation(selectedGame.slug)?.displayName ?? selectedGame.title)
        : '',
    [selectedGame],
  );

  if (!selectedGame) return null;

  const selectOffset = (offset: number) => {
    setTilt({ x: 0, y: 0 });
    setSelectedIndex((current) => wrapIndex(current + offset, games.length));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      selectOffset(-1);
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      selectOffset(1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      setSelectedIndex(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      setSelectedIndex(games.length - 1);
    }
  };

  return (
    <section className="om-games-selector" aria-labelledby="mini-games-title">
      <div className="om-games-selector__intro">
        <p className="om-games-selector__eyebrow">Portal index · choose a threshold</p>
        <h1 id="mini-games-title" className="om-games-selector__title">
          Mini-games, held in the dark.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#d9cdbd] sm:text-lg">
          Each doorway keeps its own game feel. The archive only gives you a clear way in.
        </p>
      </div>

      <div className="om-games-selector__stage">
        <div className="om-games-selector__disc" aria-hidden="true" />
        <div
          aria-activedescendant={`mini-game-option-${selectedGame.id}`}
          aria-label="Mini-game selector"
          className="om-games-selector__rail"
          onKeyDown={handleKeyDown}
          onPointerDown={(event) => {
            pointerStart.current = { id: event.pointerId, x: event.clientX };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            const start = pointerStart.current;
            pointerStart.current = null;
            if (!start || start.id !== event.pointerId) return;
            const distance = event.clientX - start.x;
            if (Math.abs(distance) >= swipeThreshold) selectOffset(distance > 0 ? -1 : 1);
          }}
          role="listbox"
          tabIndex={0}
        >
          {games.map((game, index) => {
            const selected = index === selectedIndex;
            return (
              <button
                aria-selected={selected}
                className="om-games-selector__option"
                id={`mini-game-option-${game.id}`}
                key={game.id}
                onClick={() => {
                  setTilt({ x: 0, y: 0 });
                  setSelectedIndex(index);
                }}
                role="option"
                tabIndex={selected ? 0 : -1}
                type="button"
              >
                <span className="om-games-selector__option-label">{game.title}</span>
              </button>
            );
          })}
        </div>

        <article
          className="om-game-relic om-games-selector__record"
          onPointerLeave={() => setTilt({ x: 0, y: 0 })}
          onPointerMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientY - bounds.top) / bounds.height - 0.5) * -4;
            const y = ((event.clientX - bounds.left) / bounds.width - 0.5) * 4;
            setTilt({ x: Math.max(-2, Math.min(2, x)), y: Math.max(-2, Math.min(2, y)) });
          }}
          style={{
            '--om-tilt-x': `${tilt.x}deg`,
            '--om-tilt-y': `${tilt.y}deg`,
          } as CSSProperties}
        >
          <div className="om-games-selector__record-copy">
            <p className="om-games-selector__record-meta">{selectedGame.category}</p>
            <h2 className="om-games-selector__record-title mt-3">{displayName}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d9cdbd]">{selectedGame.description}</p>
            <MoriLineTrace className="mt-5" />
          </div>
          <div className="flex flex-col items-end justify-between gap-5">
            <MoriSealMark label="Selected game" />
            <Link className="mori-button-primary" href={`/mini-games/${selectedGame.slug}`}>
              Enter game
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
