'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
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

function relativeIndex(index: number, selectedIndex: number, length: number) {
  const forward = (index - selectedIndex + length) % length;
  return forward > length / 2 ? forward - length : forward;
}

function getRelicDepth(relative: number) {
  const distance = Math.abs(relative);

  if (distance === 0) return { opacity: 1, scale: 1, visible: true };
  if (distance === 1) return { opacity: 0.62, scale: 0.78, visible: true };
  if (distance === 2) return { opacity: 0.22, scale: 0.6, visible: true };
  return { opacity: 0, scale: 0.48, visible: false };
}

export function MiniGameArcSelector({ games }: { games: MiniGameArcOption[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const pointerStart = useRef<{ id: number; x: number } | null>(null);
  const selectedRelicRef = useRef<HTMLElement | null>(null);
  const selectedGame = games[selectedIndex];
  const presentation = useMemo(
    () => (selectedGame ? getApprovedGamePresentation(selectedGame.slug) : undefined),
    [selectedGame],
  );
  const displayName = useMemo(
    () =>
      selectedGame
        ? (presentation?.displayName ?? selectedGame.title)
        : '',
    [presentation, selectedGame],
  );

  if (!selectedGame) return null;

  const selectOffset = (offset: number) => {
    setSelectedIndex((current) => wrapIndex(current + offset, games.length));
  };

  const setRelicTilt = (event: PointerEvent<HTMLElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const target = event.currentTarget;
    const bounds = target.getBoundingClientRect();
    const x = ((event.clientY - bounds.top) / bounds.height - 0.5) * -8;
    const y = ((event.clientX - bounds.left) / bounds.width - 0.5) * 8;
    target.style.setProperty('--om-tilt-x', `${Math.max(-3, Math.min(3, x))}deg`);
    target.style.setProperty('--om-tilt-y', `${Math.max(-4, Math.min(4, y))}deg`);
  };

  const resetRelicTilt = () => {
    selectedRelicRef.current?.style.setProperty('--om-tilt-x', '0deg');
    selectedRelicRef.current?.style.setProperty('--om-tilt-y', '0deg');
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
          Each doorway keeps its own game feel. Turn the reliquary index to choose one clear way in.
        </p>
      </div>

      <div className="om-games-selector__stage">
        <div className="om-games-selector__mechanism" aria-hidden="true">
          <div className="om-games-selector__disc" />
          <div className="om-games-selector__aperture" />
        </div>
        <div
          aria-activedescendant={`mini-game-option-${selectedGame.id}`}
          aria-describedby="mini-games-selector-hint"
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
            const relative = relativeIndex(index, selectedIndex, games.length);
            const depth = getRelicDepth(relative);
            const gamePresentation = getApprovedGamePresentation(game.slug);
            const gameName = gamePresentation?.displayName ?? game.title;
            // Only the audited presentation registry can supply hub artwork.
            // Legacy catalogue image strings are not asset authority and several
            // point at retired paths, so an unapproved relic falls back to an
            // intentional material frame rather than a broken image.
            const art = gamePresentation?.hub ?? gamePresentation?.cover;

            return (
              <button
                aria-selected={index === selectedIndex}
                className={`om-games-selector__option ${depth.visible ? 'is-perceptible' : 'is-occluded'} ${
                  index === selectedIndex ? 'is-selected' : ''
                }`}
                data-relative-index={relative}
                id={`mini-game-option-${game.id}`}
                key={game.id}
                onClick={() => setSelectedIndex(index)}
                role="option"
                style={
                  {
                    '--om-relic-opacity': depth.opacity,
                    '--om-relic-scale': depth.scale,
                    '--om-relic-x': `calc(${relative} * clamp(5.75rem, 14vw, 14.5rem))`,
                    '--om-relic-y': `calc(${Math.abs(relative)} * clamp(0.8rem, 1.7vw, 1.7rem))`,
                    zIndex: 12 - Math.abs(relative),
                  } as CSSProperties
                }
                tabIndex={-1}
                type="button"
              >
                <span className="om-games-selector__relic-frame" aria-hidden="true">
                  {art ? (
                    <Image
                      alt=""
                      className="om-games-selector__cover"
                      fill
                      priority={index === selectedIndex}
                      sizes="(max-width: 640px) 10rem, 17rem"
                      src={art}
                    />
                  ) : (
                    <span className="om-games-selector__cover om-games-selector__cover--fallback" />
                  )}
                </span>
                <span className="om-games-selector__option-label">{gameName}</span>
              </button>
            );
          })}
        </div>
        <p className="sr-only" id="mini-games-selector-hint">
          Use left and right arrow keys, Home, End, nearby relics, or a horizontal swipe to choose a game.
        </p>
        <p className="sr-only" role="status">
          Selected game: {displayName}. {selectedIndex + 1} of {games.length}.
        </p>

        <article
          className="om-game-relic om-games-selector__record"
          onPointerLeave={resetRelicTilt}
          onPointerMove={setRelicTilt}
          ref={selectedRelicRef}
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
