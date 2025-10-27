'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAsset } from './assets-resolver';
import { play } from './audio-bus';
import { isPractice } from '@/config/games';

export type GameEndPayload = { score: number; stats?: any; durationMs?: number };

type ShowCreditsMode = 'always' | 'once' | 'never';

type Theme = {
  accent: string;
  overlayBg: string;
  sfxOpen?: string | null;
  sfxClose?: string | null;
  frameImg?: string | null;
  creditsText?: string | null;
  creditsUrl?: string | null;
  pledgeLabel?: string | null;
  pledgeUrl?: string | null;
  showCreditsInPause: ShowCreditsMode;
};

export default function GameShell({
  gameKey,
  title,
  children,
  returnTo = '/mini-games',
  resultsExtra,
}: {
  gameKey: string;
  title?: string;
  children: React.ReactNode;
  returnTo?: string;
  resultsExtra?: React.ReactNode;
}) {
  const router = useRouter();
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState<GameEndPayload | null>(null);
  const [exiting, setExiting] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);

  const theme: Theme = useMemo(() => {
    const accent = (getAsset(gameKey, 'themeAccent') as string) ?? '#ffb7c5';
    const overlayBg = (getAsset(gameKey, 'themeOverlayBg') as string) ?? 'rgba(18,16,22,0.72)';
    return {
      accent,
      overlayBg,
      sfxOpen: getAsset(gameKey, 'themeSfxOpen'),
      sfxClose: getAsset(gameKey, 'themeSfxClose'),
      frameImg: getAsset(gameKey, 'uiFrame'),
      creditsText: (getAsset(gameKey, 'themeCreditsText') as string) ?? null,
      creditsUrl: (getAsset(gameKey, 'themeCreditsUrl') as string) ?? null,
      pledgeLabel: (getAsset(gameKey, 'themePledgeLabel') as string) ?? null,
      pledgeUrl: (getAsset(gameKey, 'themePledgeUrl') as string) ?? null,
      showCreditsInPause: (getAsset(gameKey, 'showCreditsInPause') as ShowCreditsMode) ?? 'once',
    };
  }, [gameKey]);

  // Hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPaused((p) => !p);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Expose hooks for scenes
  useEffect(() => {
    (window as any).__gameEnd = (p: GameEndPayload) => setEnded(p);
    (window as any).__gamePause = () => setPaused(true);
    (window as any).__gameResume = () => setPaused(false);
  }, []);

  // Play UI sounds on open
  useEffect(() => {
    if ((paused || ended) && theme.sfxOpen) play(theme.sfxOpen, -8);
  }, [paused, ended, theme.sfxOpen]);

  // Credits footer visibility ("once per session" support)
  const [showFooter, setShowFooter] = useState(true);
  useEffect(() => {
    if (theme.showCreditsInPause === 'once') {
      const key = `gc_credits_seen_${gameKey}`;
      const seen = sessionStorage.getItem(key) === '1';
      setShowFooter(!seen);
      if (!seen) sessionStorage.setItem(key, '1');
    } else if (theme.showCreditsInPause === 'never') {
      setShowFooter(false);
    } else {
      setShowFooter(true);
    }
  }, [gameKey, theme.showCreditsInPause]);

  function quitToHub() {
    if (theme.sfxClose) play(theme.sfxClose, -6);
    setExiting(true);
    setTimeout(() => router.push(returnTo), 420);
  }

  return (
    <div
      ref={shellRef}
      className={[
        'relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl',
        'mg-crt mg-tint',
        'gc-shell-container',
        exiting ? 'gc-exit' : 'gc-enter',
      ].join(' ')}
      style={{ ['--accent' as any]: theme.accent }}
    >
      {/* 16:9 aspect lock */}
      <div className="aspect-[16/9]" />
      <div className="absolute inset-0">
        {theme.frameImg && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-45"
            style={{ background: `url(${theme.frameImg}) center/cover no-repeat` }}
          />
        )}

        {/* Practice Mode Indicator */}
        {isPractice(gameKey as any) && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-yellow-500/90 text-black text-xs px-2 py-1 rounded-full font-medium">
              Practice Mode
            </div>
          </div>
        )}

        {/* Scene goes here */}
        <div
          aria-hidden={paused || !!ended}
          className={paused || ended ? 'pointer-events-none' : ''}
        >
          {children}
        </div>

        {/* Pause */}
        {paused && !ended && (
          <Overlay
            title={title ?? 'Paused'}
            bg={theme.overlayBg}
            accent={theme.accent}
            primary={{ label: 'Resume', onClick: () => setPaused(false) }}
            secondary={{ label: 'Quit to Hub', onClick: quitToHub }}
            footer={
              showFooter
                ? {
                    creditsText: theme.creditsText,
                    creditsUrl: theme.creditsUrl,
                    pledgeLabel: theme.pledgeLabel,
                    pledgeUrl: theme.pledgeUrl,
                  }
                : undefined
            }
          />
        )}

        {/* End */}
        {ended && (
          <Overlay
            title={title ?? 'Results'}
            bg={theme.overlayBg}
            accent={theme.accent}
            body={
              <div className="text-pink-200/90">
                <div className="mb-2">Score: {ended.score}</div>
                {resultsExtra}
              </div>
            }
            primary={{ label: 'Play Again', onClick: () => window.location.reload() }}
            secondary={{ label: 'Quit to Hub', onClick: quitToHub }}
            footer={(() => {
              const footerData: any = {};
              if (theme.creditsText !== undefined) footerData.creditsText = theme.creditsText;
              if (theme.creditsUrl !== undefined) footerData.creditsUrl = theme.creditsUrl;
              if (theme.pledgeLabel !== undefined) footerData.pledgeLabel = theme.pledgeLabel;
              if (theme.pledgeUrl !== undefined) footerData.pledgeUrl = theme.pledgeUrl;
              return Object.keys(footerData).length > 0 ? footerData : undefined;
            })()}
          />
        )}
      </div>
    </div>
  );
}

function Overlay({
  title,
  bg,
  accent,
  body,
  primary,
  secondary,
  footer,
}: {
  title: string;
  bg: string;
  accent: string;
  body?: React.ReactNode;
  primary: { label: string; onClick: () => void };
  secondary: { label: string; onClick: () => void };
  footer?: {
    creditsText?: string | null;
    creditsUrl?: string | null;
    pledgeLabel?: string | null;
    pledgeUrl?: string | null;
  };
}) {
  return (
    <div className="absolute inset-0 grid place-items-center" style={{ background: bg }}>
      <div
        className="relative rounded-2xl border px-6 py-4"
        style={{
          borderColor: accent,
          background: 'rgba(0,0,0,0.55)',
          boxShadow: `0 0 24px ${accent}33`,
        }}
      >
        <div className="text-lg font-semibold" style={{ color: accent }}>
          {title}
        </div>
        {body && <div className="mt-2">{body}</div>}
        <div className="mt-3 flex gap-3">
          <button
            onClick={primary.onClick}
            className="rounded-xl border px-3 py-2 hover:opacity-90"
            style={{ borderColor: accent, color: accent, background: `${accent}1A` }}
          >
            {primary.label}
          </button>
          <button
            onClick={secondary.onClick}
            className="rounded-xl border px-3 py-2 hover:opacity-90"
            style={{ borderColor: accent, color: accent, background: `${accent}1A` }}
          >
            {secondary.label}
          </button>
        </div>

        {!!footer && (footer.creditsText || footer.pledgeLabel) && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-pink-200/80">
            {footer.creditsText &&
              (footer.creditsUrl ? (
                <a
                  href={footer.creditsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:opacity-90"
                >
                  {footer.creditsText}
                </a>
              ) : (
                <span>{footer.creditsText}</span>
              ))}
            {footer.pledgeLabel && footer.pledgeUrl && (
              <a
                href={footer.pledgeUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border px-2 py-1 hover:opacity-90"
                style={{ borderColor: accent, color: accent, background: `${accent}14` }}
              >
                {footer.pledgeLabel}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
