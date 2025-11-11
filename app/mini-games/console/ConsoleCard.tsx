'use client';

import { audio } from '@/app/lib/audio';
import { http } from '@/app/lib/http';
import { getGameImageBySlug } from '@/app/lib/games';
import * as Sentry from '@sentry/nextjs';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import OwnedRunesGrid from '../_components/OwnedRunesGrid';
import gamesMeta from '../games.meta.json';
// import { env } from '@/env.mjs';

type Mode = 'boot' | 'cube' | 'loadingGame' | 'playingGame';

function useQueryFace(): [number, (n: number) => void] {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const face = useMemo(() => {
    const raw = params.get('face');
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? Math.max(0, Math.min(4, n)) : 0;
  }, [params]);

  const setFace = useCallback(
    (n: number) => {
      const clamped = Math.max(0, Math.min(4, n));
      const next = new URLSearchParams(params.toString());
      next.set('face', String(clamped));
      router.replace(`${pathname}?${next.toString()}`);
      Sentry.addBreadcrumb({ category: 'minigames', message: `face:${clamped}`, level: 'info' });
    },
    [params, pathname, router],
  );

  return [face, setFace];
}

export default function ConsoleCard({
  gameKey,
  defaultFace,
}: {
  gameKey?: string;
  defaultFace?: number;
}) {
  const [mode, setMode] = useState<Mode>('boot');
  const [face, setFace] = useQueryFace();
  const [audioOn, setAudioOn] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [animMs, setAnimMs] = useState(160);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [rotation, setRotation] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });
  const rotStartRef = useRef<{ rx: number; ry: number } | null>(null);
  const [infoOpen, setInfoOpen] = useState<string | null>(null);
  useEffect(() => {
    setIsReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  useEffect(() => {
    // Only preload audio if not in reduced motion mode and audio is supported
    const audioEnabled = (process.env.NEXT_PUBLIC_ENABLE_AUDIO ?? 'true') !== 'false';
    if (
      !isReducedMotion &&
      audioEnabled &&
      typeof window !== 'undefined' &&
      'AudioContext' in window
    ) {
      audio
        .preload([
          ['gamecube_menu', '/sfx/gamecube-menu.mp3'],
          ['samus_jingle', '/sfx/samus-jingle.mp3'],
          ['boot_whoosh', '/sfx/boot_whoosh.mp3'],
        ])
        .catch((error) => {
          console.warn('Failed to preload audio files:', error);
        });
      setAudioOn(audioEnabled); // Track audio state
    }
  }, [isReducedMotion]);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.dataset.audioEnabled = audioOn ? 'true' : 'false';
  }, [audioOn]);

  // Boot gate once per session
  useEffect(() => {
    const key = 'om_gc_boot_seen';
    const seen = typeof window !== 'undefined' ? sessionStorage.getItem(key) === '1' : true;
    if (!seen) {
      setMode('boot');
      const t = setTimeout(
        () => {
          sessionStorage.setItem(key, '1');
          setMode('cube');
        },
        isReducedMotion ? 500 : 2000,
      );
      return () => clearTimeout(t);
    }
    setMode('cube');
  }, [isReducedMotion]);

  // Respect defaultFace on first mount if no query present
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('face');
    if (!raw && typeof defaultFace === 'number') {
      setFace(defaultFace);
    }
  }, [defaultFace, setFace]);

  // Start game flow if gameKey provided
  useEffect(() => {
    if (!gameKey) return;
    setMode('loadingGame');
    const t = setTimeout(() => setMode('playingGame'), 600);
    return () => clearTimeout(t);
  }, [gameKey]);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mode === 'playingGame') {
          // Exit to cube (Face 1 as games), then back to root on second Esc
          setMode('cube');
          setFace(0);
          router.replace('/mini-games?face=0');
          e.preventDefault();
          return;
        }
        if (mode === 'cube') {
          setFace(0);
          e.preventDefault();
          return;
        }
      }
      if (mode !== 'cube') return;
      // Horizontal rotation between front/left/right
      if (e.key === 'ArrowLeft') {
        setAnimMs(isReducedMotion ? 100 : 180);
        if (face === 0) setFace(1);
        else if (face === 2) setFace(0);
        else if (face === 1) setFace(0);
        audio.unlock();
        try {
          const audioEnabled = (process.env.NEXT_PUBLIC_ENABLE_AUDIO ?? 'true') !== 'false';
          if (audioEnabled) {
            audio.play('gamecube_menu', { gain: 0.25 });
          }
        } catch (error) {
          console.warn('Failed to play audio:', error);
        }
      }
      if (e.key === 'ArrowRight') {
        setAnimMs(isReducedMotion ? 100 : 180);
        if (face === 0) setFace(2);
        else if (face === 1) setFace(0);
        else if (face === 2) setFace(0);
        audio.unlock();
        try {
          const audioEnabled = (process.env.NEXT_PUBLIC_ENABLE_AUDIO ?? 'true') !== 'false';
          if (audioEnabled) {
            audio.play('gamecube_menu', { gain: 0.25 });
          }
        } catch (error) {
          console.warn('Failed to play audio:', error);
        }
      }
      // Vertical rotation between front/top/bottom
      if (e.key === 'ArrowUp') {
        setAnimMs(isReducedMotion ? 100 : 180);
        if (face === 0) setFace(4);
        else if (face === 3) setFace(0);
        else if (face === 4) setFace(0);
        audio.unlock();
        try {
          const audioEnabled = (process.env.NEXT_PUBLIC_ENABLE_AUDIO ?? 'true') !== 'false';
          if (audioEnabled) {
            audio.play('gamecube_menu', { gain: 0.25 });
          }
        } catch (error) {
          console.warn('Failed to play audio:', error);
        }
      }
      if (e.key === 'ArrowDown') {
        setAnimMs(isReducedMotion ? 100 : 180);
        if (face === 0) setFace(3);
        else if (face === 4) setFace(0);
        else if (face === 3) setFace(0);
        audio.unlock();
        try {
          const audioEnabled = (process.env.NEXT_PUBLIC_ENABLE_AUDIO ?? 'true') !== 'false';
          if (audioEnabled) {
            audio.play('gamecube_menu', { gain: 0.25 });
          }
        } catch (error) {
          console.warn('Failed to play audio:', error);
        }
      }
      if (e.key === 'Enter') {
        if (face === 1) router.push('/mini-games/games/petal-collection');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, face, setFace, router]);

  // Gamepad support (A/B, D-pad, basic stick)
  useEffect(() => {
    let raf = 0;
    const prev = { buttons: [] as number[] };
    const press = (cur: number, i: number) => (prev.buttons[i] || 0) === 0 && cur === 1;
    const loop = () => {
      try {
        const pads = (navigator as any).getGamepads ? (navigator as any).getGamepads() : [];
        const gp = pads && pads[0];
        if (gp) {
          const buttons = gp.buttons.map((b: any) => (b && b.pressed ? 1 : 0));
          const axes = gp.axes || [0, 0];
          if (mode === 'cube' && Array.isArray(axes)) {
            const [ax = 0, ay = 0] = axes;
            if (Math.abs(ax) > 0.2 || Math.abs(ay) > 0.2) {
              setRotation({ rx: ay * 20, ry: ax * 20 });
            }
          }
          // D-pad
          if (mode === 'cube') {
            if (press(buttons[14], 14)) {
              setAnimMs(isReducedMotion ? 100 : 180);
              if (face === 0) setFace(1);
              else if (face === 2) setFace(0);
              else if (face === 1) setFace(0);
            }
            if (press(buttons[15], 15)) {
              setAnimMs(isReducedMotion ? 100 : 180);
              if (face === 0) setFace(2);
              else if (face === 1) setFace(0);
              else if (face === 2) setFace(0);
            }
            if (press(buttons[12], 12)) {
              setAnimMs(isReducedMotion ? 100 : 180);
              if (face === 0) setFace(4);
              else if (face === 3) setFace(0);
              else if (face === 4) setFace(0);
            }
            if (press(buttons[13], 13)) {
              setAnimMs(isReducedMotion ? 100 : 180);
              if (face === 0) setFace(3);
              else if (face === 4) setFace(0);
              else if (face === 3) setFace(0);
            }
          }
          // A (0) / B (1)
          if (press(buttons[0], 0)) {
            if (mode === 'cube' && face === 1) router.push('/mini-games/games/petal-collection');
          }
          if (press(buttons[1], 1)) {
            if (mode === 'playingGame') {
              setMode('cube');
              setFace(0);
              router.replace('/mini-games?face=0');
            } else if (mode === 'cube') {
              setFace(0);
            }
          }
          prev.buttons = buttons;
        }
      } catch {}
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode, face, setFace, router, isReducedMotion]);

  // Accessibility: focus trap root
  useEffect(() => {
    containerRef.current?.focus();
  }, [mode, face]);

  const FaceTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-sm font-semibold text-white" aria-live="polite" data-testid="face-title">
      {children}
    </h2>
  );

  // 3D cube transforms
  const cubeSize = 280; // px
  const getRotationForFace = (f: number) => {
    switch (f) {
      case 1: // left
        return { rx: 0, ry: 90 };
      case 2: // right
        return { rx: 0, ry: -90 };
      case 3: // bottom
        return { rx: 90, ry: 0 };
      case 4: // top
        return { rx: -90, ry: 0 };
      default:
        return { rx: 0, ry: 0 };
    }
  };
  const targetRot = getRotationForFace(face);
  const displayRot = dragging ? rotation : targetRot;
  useEffect(() => {
    if (!dragging) setRotation(targetRot);
  }, [face, dragging]);

  // Swipe/drag inertia
  const startRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    rotStartRef.current = { ...targetRot };
    setDragging(true);
    setAnimMs(0);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !startRef.current || !rotStartRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    const sens = 0.4; // deg per px
    const next = {
      rx: rotStartRef.current.rx + dy * sens,
      ry: rotStartRef.current.ry - dx * sens,
    };
    next.rx = Math.max(-110, Math.min(110, next.rx));
    next.ry = Math.max(-110, Math.min(110, next.ry));
    setRotation(next);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = startRef.current;
    startRef.current = null;
    setDragging(false);
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const dt = Math.max(1, performance.now() - s.t);
    const v = Math.sqrt(dx * dx + dy * dy) / dt; // px/ms
    const threshold = 24;
    const duration = Math.min(280, Math.max(isReducedMotion ? 100 : 160, v * 240));
    setAnimMs(duration);
    const candidates = [0, 1, 2, 3, 4];
    const withAngles = candidates.map((f) => ({ f, rot: getRotationForFace(f) }));
    const dist = (a: { rx: number; ry: number }, b: { rx: number; ry: number }) =>
      Math.hypot(a.rx - b.rx, a.ry - b.ry);
    const current = rotation;
    const nearest = withAngles.reduce(
      (best, cur) => (dist(current, cur.rot) < dist(current, best.rot) ? cur : best),
      withAngles[0],
    );
    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      setFace(face);
    } else {
      // Rubber-band overshoot then snap
      const toward = { rx: Math.sign(-dy), ry: Math.sign(dx) };
      const overshoot = 8; // deg
      const tgt = getRotationForFace(nearest.f);
      setAnimMs(120);
      setRotation({ rx: tgt.rx + toward.rx * overshoot, ry: tgt.ry + toward.ry * overshoot });
      setTimeout(() => {
        setAnimMs(duration);
        setFace(nearest.f);
      }, 120);
    }
  };

  // Faces
  const FaceRoot = () => (
    <div className="p-4 space-y-3">
      <FaceTitle>Root Selector</FaceTitle>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <button
          className="rounded-lg border border-white/15 bg-white/10 p-3 sm:p-4 text-left hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          onClick={() => {
            setFace(1);
            audio.unlock();
            try {
              try {
                const audioEnabled = (process.env.NEXT_PUBLIC_ENABLE_AUDIO ?? 'true') !== 'false';
                if (audioEnabled) {
                  audio.play('gamecube_menu', { gain: 0.25 });
                }
              } catch (error) {
                console.warn('Failed to play audio:', error);
              }
            } catch (error) {
              console.warn('Failed to play audio:', error);
            }
          }}
          aria-label="Go to Mini-Games"
        >
          <div className="text-white font-medium">Mini-Games</div>
          <div className="text-xs text-zinc-300">Choose a game</div>
        </button>
        <button
          className="rounded-lg border border-white/15 bg-white/10 p-3 sm:p-4 text-left hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          onClick={() => {
            setFace(2);
            audio.unlock();
            try {
              try {
                const audioEnabled = (process.env.NEXT_PUBLIC_ENABLE_AUDIO ?? 'true') !== 'false';
                if (audioEnabled) {
                  audio.play('gamecube_menu', { gain: 0.25 });
                }
              } catch (error) {
                console.warn('Failed to play audio:', error);
              }
            } catch (error) {
              console.warn('Failed to play audio:', error);
            }
          }}
          aria-label="Go to Character and Community"
        >
          <div className="text-white font-medium">Character / Community</div>
          <div className="text-xs text-zinc-300">Create avatar, see feed</div>
        </button>
        <button
          className="rounded-lg border border-white/15 bg-white/10 p-3 sm:p-4 text-left hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          onClick={() => {
            setFace(3);
            audio.unlock();
            try {
              try {
                const audioEnabled = (process.env.NEXT_PUBLIC_ENABLE_AUDIO ?? 'true') !== 'false';
                if (audioEnabled) {
                  audio.play('gamecube_menu', { gain: 0.25 });
                }
              } catch (error) {
                console.warn('Failed to play audio:', error);
              }
            } catch (error) {
              console.warn('Failed to play audio:', error);
            }
          }}
          aria-label="Go to Music and Extras"
        >
          <div className="text-white font-medium">Music + Extras</div>
          <div className="text-xs text-zinc-300">OST, CRT, VHS</div>
        </button>
        <button
          className="rounded-lg border border-white/15 bg-white/10 p-3 sm:p-4 text-left hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
          onClick={() => {
            setFace(4);
            audio.unlock();
            try {
              try {
                const audioEnabled = (process.env.NEXT_PUBLIC_ENABLE_AUDIO ?? 'true') !== 'false';
                if (audioEnabled) {
                  audio.play('gamecube_menu', { gain: 0.25 });
                }
              } catch (error) {
                console.warn('Failed to play audio:', error);
              }
            } catch (error) {
              console.warn('Failed to play audio:', error);
            }
          }}
          aria-label="Go to Trade Center"
        >
          <div className="text-white font-medium">Trade Center</div>
          <div className="text-xs text-zinc-300">Fuse and trade runes</div>
        </button>
      </div>
    </div>
  );

  const MiniGamesFace = () => (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <FaceTitle>Mini-Games</FaceTitle>
        <div className="flex items-center gap-3">
          <a
            href="/profile/achievements"
            className="text-xs text-pink-300 underline hover:text-pink-200"
          >
            View Achievements
          </a>
          <PetalSlot />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        {(gamesMeta as Array<{ slug: string; name: string; icon: string; desc: string }>).map(
          (g) => (
            <div
              key={g.slug}
              className="group relative rounded-lg border border-white/15 bg-white/10 p-3 sm:p-4 text-left hover:bg-white/15 focus-within:outline-none focus-within:ring-2 focus-within:ring-pink-500/60"
              role="button"
              tabIndex={0}
              onClick={() => {
                try {
                  const audioEnabled = (process.env.NEXT_PUBLIC_ENABLE_AUDIO ?? 'true') !== 'false';
                  if (audioEnabled) {
                    audio.unlock();
                    // Small delay to ensure audio context is unlocked
                    setTimeout(() => {
                      audio.play('samus_jingle', { gain: 0.35 });
                    }, 10);
                  }
                } catch (error) {
                  console.warn('Failed to play audio:', error);
                }
                router.push(`/mini-games/games/${g.slug}`);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  try {
                    const audioEnabled =
                      (process.env.NEXT_PUBLIC_ENABLE_AUDIO ?? 'true') !== 'false';
                    if (audioEnabled) {
                      audio.unlock();
                      // Small delay to ensure audio context is unlocked
                      setTimeout(() => {
                        audio.play('samus_jingle', { gain: 0.35 });
                      }, 10);
                    }
                  } catch (error) {
                    console.warn('Failed to play audio:', error);
                  }
                  router.push(`/mini-games/games/${g.slug}`);
                }
              }}
              aria-label={`Start ${g.name}`}
              data-testid="start-game"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2">
                  <GameIcon slug={g.slug} icon={g.icon} />
                  <div className="text-white font-medium">{g.name}</div>
                </div>
                <span className="text-xs text-pink-300">Ready</span>
              </div>
              <div className="mt-1 text-xs text-zinc-300">Load inside console</div>

              {/* Info toggle */}
              <button
                type="button"
                className="absolute top-2 right-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-200 hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setInfoOpen(infoOpen === g.slug ? null : g.slug);
                }}
                aria-label={`About ${g.name}`}
                aria-expanded={infoOpen === g.slug}
              >
                ?
              </button>

              {/* Hover or toggled description overlay */}
              <div
                className={[
                  'pointer-events-none absolute inset-0 rounded-lg bg-black/70 p-3 opacity-0 transition-opacity',
                  'group-hover:opacity-100',
                  infoOpen === g.slug ? 'opacity-100 pointer-events-auto' : '',
                ].join(' ')}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="mb-1 text-sm font-semibold text-zinc-100">{g.name}</div>
                <p className="text-xs text-zinc-300">{g.desc}</p>
                <div className="mt-2 text-[10px] text-zinc-400">Press Enter/A to start</div>
              </div>
            </div>
          ),
        )}
      </div>
      <AchievementsPreview />
    </div>
  );

  const CharacterFace = () => (
    <div className="p-4 space-y-2">
      <FaceTitle>Character / Community</FaceTitle>
      <CommunityFace />
    </div>
  );

  const MusicFace = () => {
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [crt, setCrt] = useState(false);
    const [vhs, setVhs] = useState(false);
    const [audio, setAudio] = useState(false);
    const [vol, setVol] = useState<number>(75);

    useEffect(() => {
      const reqId = `req_${Date.now()}`;
      fetch('/api/user/avatar', { headers: { 'x-request-id': reqId } })
        .then((r) => r.json())
        .then((j) => {
          if (!j.ok) throw new Error(j.message || j.code || 'Failed');
          const p = j.data?.prefs || {};
          setCrt(!!p.CRT);
          setVhs(!!p.VHS);
          setAudio(p.AUDIO !== false);
          setVol(typeof p.AUDIO_LEVEL === 'number' ? p.AUDIO_LEVEL : 75);
        })
        .catch((e) => setErr(e.message))
        .finally(() => setLoading(false));
    }, []);

    const save = async () => {
      await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-request-id': `req_${Date.now()}` },
        body: JSON.stringify({ prefs: { CRT: crt, VHS: vhs, AUDIO: audio, AUDIO_LEVEL: vol } }),
      });
    };

    if (loading) {
      return (
        <div className="p-4 text-xs text-zinc-300" data-testid="music-face-loading">
          Loading preferences…
        </div>
      );
    }

    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <FaceTitle>Music + Extras</FaceTitle>
          <label
            className="text-xs text-zinc-300 inline-flex items-center gap-2"
            data-testid="card-audio-toggle"
          >
            <input
              type="checkbox"
              name="audio"
              className="accent-pink-500"
              checked={audio}
              onChange={(e) => setAudio(e.target.checked)}
            />
            Audio
          </label>
        </div>
        {err && (
          <div className="rounded bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-200">
            {err}
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label
            className="text-xs text-zinc-300 inline-flex items-center gap-2"
            data-testid="card-crt-toggle"
          >
            <input
              type="checkbox"
              name="crt"
              checked={crt}
              onChange={(e) => setCrt(e.target.checked)}
            />{' '}
            CRT
          </label>
          <label
            className="text-xs text-zinc-300 inline-flex items-center gap-2"
            data-testid="card-vhs-toggle"
          >
            <input
              type="checkbox"
              name="vhs"
              checked={vhs}
              onChange={(e) => setVhs(e.target.checked)}
            />{' '}
            VHS
          </label>
          <label
            className="text-xs text-zinc-300 inline-flex items-center gap-2"
            data-testid="card-audio-level"
          >
            Volume
            <input
              type="range"
              name="volume"
              min={0}
              max={100}
              value={vol}
              onChange={(e) => setVol(parseInt(e.target.value))}
              className="ml-2 w-32"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['ost_loop_1.mp3', 'ost_loop_2.mp3'].map((src) => (
            <div key={src} className="rounded-lg border border-white/15 bg-white/10 p-3">
              <div className="text-xs text-zinc-300">{src}</div>
              {audio && (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <audio
                  src={`/${src}`}
                  loop
                  autoPlay
                  controls
                  className="mt-2 w-full"
                  preload="none"
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={save}
            className="rounded bg-pink-600 px-3 py-1 text-sm text-white hover:bg-pink-700"
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  const TradeFace = () => (
    <div className="p-4 space-y-3">
      <FaceTitle>Trade Center</FaceTitle>
      <OwnedRunesGrid />
      <FusePanel />
    </div>
  );

  const FusePanel = () => {
    const [selected, setSelected] = useState<string>('rune_a');
    const [second, setSecond] = useState<string>('rune_b');
    const [result, setResult] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const fuse = async () => {
      setBusy(true);
      setResult(null);
      try {
        const res = await http.post('/api/trade/fuse', { runeIds: [selected, second] });
        const body: any = res.data;
        if (body?.ok) setResult('Fusion complete');
        else setResult(body?.message || 'Fusion unavailable');
      } catch (e: any) {
        setResult(e?.message || 'Error');
        Sentry.captureMessage('fuse_error', { level: 'error' });
      } finally {
        setBusy(false);
      }
    };
    return (
      <div className="rounded-lg border border-white/15 bg-white/10 p-3">
        <div className="mb-2 text-xs text-zinc-300">Runes Fusion (MVP)</div>
        <div className="flex items-center gap-2">
          <select
            className="bg-black/40 text-white text-sm rounded px-2 py-1 border border-white/15"
            name="runeA"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {['rune_a', 'rune_b', 'rune_c', 'rune_d', 'rune_e'].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <span className="text-zinc-400">+</span>
          <select
            className="bg-black/40 text-white text-sm rounded px-2 py-1 border border-white/15"
            name="runeB"
            value={second}
            onChange={(e) => setSecond(e.target.value)}
          >
            {['rune_a', 'rune_b', 'rune_c', 'rune_d', 'rune_e'].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            onClick={fuse}
            className="ml-auto rounded border border-pink-400/40 px-3 py-1 text-sm text-pink-200 hover:bg-pink-500/10 disabled:opacity-50"
            disabled={busy}
            data-testid="fuse-submit"
          >
            {busy ? 'Fusing…' : 'Fuse'}
          </button>
        </div>
        {result && <div className="mt-2 text-xs text-zinc-300">{result}</div>}
      </div>
    );
  };

  const PetalSlot = () => {
    const [balance, setBalance] = useState<number | null>(null);
    useEffect(() => {
      let active = true;
      http
        .get<{ ok: boolean; balance: number }>('/api/petals/balance')
        .then((r) => {
          const b = (r.data as any)?.balance ?? 0;
          if (active) setBalance(b);
        })
        .catch(() => setBalance(null));
      return () => {
        active = false;
      };
    }, []);
    return (
      <div className="rounded-full bg-white/10 px-3 py-1 text-xs text-white" title="Slot A: petals">
        Slot A: {balance ?? '…'} petals
      </div>
    );
  };

  const Boot = () => {
    const [bootPhase, setBootPhase] = useState<'start' | 'logo' | 'complete'>('start');
    const [logoScale, setLogoScale] = useState(0);
    const [logoOpacity, setLogoOpacity] = useState(0);

    useEffect(() => {
      if (isReducedMotion) {
        setBootPhase('complete');
        return;
      }

      // Phase 1: Logo appears and scales up
      const timer1 = setTimeout(() => {
        setBootPhase('logo');
        setLogoOpacity(1);
        setLogoScale(1);
      }, 500);

      // Phase 2: Complete boot
      const timer2 = setTimeout(() => {
        setBootPhase('complete');
      }, 2500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }, [isReducedMotion]);

    return (
      <div className="grid place-items-center h-64 bg-black" data-testid="boot-seen">
        <div className="text-center text-white">
          {bootPhase === 'start' && <div className="text-sm opacity-60">Initializing...</div>}

          {bootPhase === 'logo' && (
            <div className="relative">
              {/* Classic GameCube "G" Logo */}
              <div
                className="text-8xl font-bold text-pink-400 transition-all duration-1000 ease-out"
                style={{
                  transform: `scale(${logoScale})`,
                  opacity: logoOpacity,
                  filter: 'drop-shadow(0 0 20px rgba(255, 79, 163, 0.5))',
                }}
              >
                G
              </div>

              {/* Spinning ring around the G */}
              <div
                className="absolute inset-0 border-4 border-pink-400 rounded-full animate-spin"
                style={{
                  width: '120px',
                  height: '120px',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  borderTopColor: 'transparent',
                  borderRightColor: 'transparent',
                }}
              />
            </div>
          )}

          {bootPhase === 'complete' && <div className="text-sm opacity-80">Ready</div>}
        </div>
      </div>
    );
  };

  const LoadingGame = () => (
    <div className="grid place-items-center h-64">
      <div className="text-center text-pink-200">
        <div className="mb-2 text-lg">Load Game</div>
        <div className="text-xs opacity-80">{gameKey}</div>
      </div>
    </div>
  );

  const PlayingGame = () => (
    <div className="rounded-xl border border-white/15 bg-black/60">
      <div className="aspect-[16/9] w-full grid place-items-center">
        <GameViewport gameKey={gameKey} />
      </div>
      <div className="px-3 py-1 text-[11px] text-zinc-400 text-right">Press Esc or B to quit</div>
    </div>
  );

  return (
    <section
      ref={containerRef}
      className="mx-auto max-w-5xl rounded-2xl border border-white/15 bg-black/50 p-4 outline-none"
      aria-label="Mini-Games Console"
    >
      {mode === 'boot' && (
        <>
          <Boot />
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              className="rounded border border-white/20 px-3 py-1 text-xs text-white/90 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
              onClick={() => {
                try {
                  sessionStorage.setItem('om_gc_boot_seen', '1');
                } catch {}
                setMode('cube');
              }}
              aria-label="Skip intro"
            >
              Skip intro
            </button>
          </div>
        </>
      )}
      {mode === 'loadingGame' && <LoadingGame />}
      {mode === 'playingGame' && <PlayingGame />}
      {mode === 'cube' && (
        <div
          className="mx-auto my-1"
          style={{
            perspective: '1000px',
            width: '100%',
            maxWidth: 720,
            userSelect: 'none' as any,
            touchAction: 'none' as any,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div
            className="relative mx-auto"
            style={{
              width: cubeSize,
              height: cubeSize,
              transformStyle: 'preserve-3d',
              transition: `transform ${animMs}ms ease` as any,
              transform: `rotateX(${displayRot.rx}deg) rotateY(${displayRot.ry}deg)`,
            }}
          >
            {/* Front (Face 0) */}
            <div
              className="absolute inset-0 rounded-xl border border-white/15 bg-white/5 text-white"
              style={{
                transform: `translateZ(${cubeSize / 2}px)`,
                backfaceVisibility: 'hidden' as any,
              }}
            >
              <FaceRoot />
            </div>
            {/* Left (Face 1) */}
            <div
              className="absolute inset-0 rounded-xl border border-white/15 bg-white/5 text-white"
              style={{
                transform: `rotateY(-90deg) translateZ(${cubeSize / 2}px)`,
                backfaceVisibility: 'hidden' as any,
              }}
            >
              <MiniGamesFace />
            </div>
            {/* Right (Face 2) */}
            <div
              className="absolute inset-0 rounded-xl border border-white/15 bg-white/5 text-white"
              style={{
                transform: `rotateY(90deg) translateZ(${cubeSize / 2}px)`,
                backfaceVisibility: 'hidden' as any,
              }}
            >
              <CharacterFace />
            </div>
            {/* Bottom (Face 3) */}
            <div
              className="absolute inset-0 rounded-xl border border-white/15 bg-white/5 text-white"
              style={{
                transform: `rotateX(90deg) translateZ(${cubeSize / 2}px)`,
                backfaceVisibility: 'hidden' as any,
              }}
            >
              <MusicFace />
            </div>
            {/* Top (Face 4) */}
            <div
              className="absolute inset-0 rounded-xl border border-white/15 bg-white/5 text-white"
              style={{
                transform: `rotateX(-90deg) translateZ(${cubeSize / 2}px)`,
                backfaceVisibility: 'hidden' as any,
              }}
            >
              <TradeFace />
            </div>
          </div>
        </div>
      )}
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
        <div>Arrows/Stick: rotate • A/Enter: select • B/Esc: back</div>
        <div className="inline-flex items-center gap-2">
          <span className="material-symbols-outlined">view_in_ar</span>
          <span className="emoji-noto">🃝</span>
        </div>
      </div>
    </section>
  );
}

function AchievementsPreview() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let active = true;
    fetch('/api/v1/games/achievements', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        const list = j?.data?.achievements || [];
        const unlocked = list.filter((a: any) => a.isUnlocked);
        if (active) setItems(unlocked.slice(0, 4));
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);
  return (
    <div className="rounded-lg border border-white/15 bg-white/5 p-3">
      <div className="mb-2 text-xs text-zinc-300">Recent Achievements</div>
      {loading ? (
        <div className="text-xs text-zinc-400">Loading…</div>
      ) : items.length === 0 ? (
        <div className="text-xs text-zinc-400">No recent achievements.</div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {items.map((a) => (
            <div
              key={a.id}
              className="rounded bg-white/10 p-2 text-[11px] text-zinc-200"
              title={a.description}
            >
              <div className="truncate">{a.name}</div>
              {a.unlockedAt && (
                <div className="text-[10px] text-zinc-400">
                  {new Date(a.unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Lazy game viewport; maps known game keys to mounted components
function GameViewport({ gameKey }: { gameKey?: string }) {
  if (!gameKey) return <div className="text-pink-200">No game selected.</div>;

  const Map: Record<string, React.ComponentType<any>> = {
    'petal-collection': dynamic(() => import('../petal-collection/Scene'), { ssr: false }),
    'memory-match': dynamic(() => import('../memory-match/InCard'), { ssr: false }),
    'otaku-beat-em-up': dynamic(() => import('../otaku-beat-em-up/Scene'), { ssr: false }),
    'bubble-girl': dynamic(() => import('../bubble-girl/InCard'), { ssr: false }),
    'quick-math': dynamic(
      () => import('../quick-math/QuickMathWrapper').then((m) => m.QuickMathWrapper),
      { ssr: false },
    ),
    'puzzle-reveal': dynamic(() => import('../puzzle-reveal/InCard'), { ssr: false }),
    'petal-samurai': dynamic(() => import('../petal-samurai/InCard'), { ssr: false }),
    'petal-storm-rhythm': dynamic(() => import('../petal-storm-rhythm/InCard'), { ssr: false }),
    'bubble-ragdoll': dynamic(() => import('../bubble-ragdoll/Scene'), { ssr: false }),
    'samurai-petal-slice': dynamic(() => import('../samurai-petal-slice/Scene'), { ssr: false }),
    blossomware: dynamic(() => import('../blossomware/InCard'), { ssr: false }),
    'dungeon-of-desire': dynamic(() => import('../dungeon-of-desire/InCard'), { ssr: false }),
    'maid-cafe-manager': dynamic(() => import('../maid-cafe-manager/InCard'), { ssr: false }),
    'thigh-coliseum': dynamic(() => import('../thigh-coliseum/InCard'), { ssr: false }),
  } as const;

  const Comp = Map[gameKey];
  if (!Comp) return <div className="text-pink-200">Game not found: {gameKey}</div>;
  // Many games are self-contained and stretch to parent size
  return <Comp />;
}

// Game metadata for tiles (icon + short description)
// metadata loaded from JSON above

function GameIcon({ slug, icon }: { slug: string; icon: string }) {
  const imgSrc = React.useMemo(() => getGameImageBySlug(slug), [slug]);

  const statusDot = process.env.NODE_ENV !== 'production' && (
    <span
      className={[
        'ml-1 inline-block h-1.5 w-1.5 rounded-full align-middle',
        imgSrc ? 'bg-green-400' : 'bg-zinc-500',
      ].join(' ')}
      title={imgSrc ? 'Custom icon found' : 'Using fallback icon'}
    />
  );

  if (imgSrc) {
    return (
      <span className="inline-flex items-center">
        <img src={imgSrc} alt="" className="h-5 w-5 object-contain" aria-hidden />
        {statusDot}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center">
      <span className="material-symbols-outlined text-pink-300 ms-opsz-24 ms-wght-500" aria-hidden>
        {icon}
      </span>
      {statusDot}
    </span>
  );
}

function CommunityFace() {
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<{ avatar?: { url: string }; prefs: any } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [wsDegraded, setWsDegraded] = React.useState(false);
  const [wsFailures, setWsFailures] = React.useState(0);
  const wsRef = React.useRef<WebSocket | null>(null);
  const wsTimerRef = React.useRef<number | null>(null);
  const lruIds = React.useRef<string[]>([]);
  const lastCursorRef = React.useRef<{ [k: string]: string | null }>({
    interaction: null,
    accidental: null,
    training: null,
    quest: null,
  });
  const [toasts, setToasts] = React.useState<
    Array<{ id: string; kind: string; text: string; testId?: string }>
  >([]);
  const [pendingInteraction, setPendingInteraction] = React.useState<{ requestId: string } | null>(
    null,
  );
  const [trainingActive, setTrainingActive] = React.useState(false);
  const [unlockedEmotes, setUnlockedEmotes] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    // Sentry breadcrumb on face enter
    try {
      // @ts-ignore
      const S = Sentry;
      S.addBreadcrumb({ category: 'minigames', message: 'face.enter:2', level: 'info' });
    } catch {}
    const reqId = `req_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    fetch('/api/user/avatar', { headers: { 'x-request-id': reqId } })
      .then(async (r) => {
        if (r.status === 401) {
          throw new Error('AUTH_REQUIRED');
        }
        const j = await r.json();
        if (!j.ok) {
          throw new Error(j.message || j.code || 'Failed');
        }
        return j;
      })
      .then((j) => {
        setData(j.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // --- WS mock layer + degraded polling (Face 2 scope) ---
  React.useEffect(() => {
    // Helper: add breadcrumb
    const bc = (message: string, extra?: Record<string, any>) => {
      try {
        // @ts-ignore
        const S = Sentry;
        S.addBreadcrumb({
          category: 'minigames',
          message,
          data: { face: 2, ...(extra || {}) },
          level: 'info',
        });
      } catch {}
    };
    const addToast = (t: { id?: string; kind: string; text: string; testId?: string }) => {
      const id = t.id || `t_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 2500);
    };
    const rememberId = (id: string) => {
      if (!id) return false;
      const arr = lruIds.current;
      if (arr.includes(id)) return false;
      arr.push(id);
      if (arr.length > 10000) arr.splice(0, arr.length - 10000);
      return true;
    };
    const handleEvent = (env: any) => {
      if (!rememberId(env.eventId)) return;
      switch (env.channel) {
        case 'training':
          bc('training.learn', { eventId: env.eventId });
          setTrainingActive(true);
          break;
        case 'quest':
          bc('quest.complete', { eventId: env.eventId });
          addToast({
            kind: 'success',
            text: 'Quest complete: reward granted',
            testId: 'toast-unlock-emote',
          });
          break;
        case 'interact':
          bc('interaction.request', { eventId: env.eventId });
          setPendingInteraction({ requestId: env?.payload?.requestId || 'req_unknown' });
          break;
        case 'accidental':
          bc('accidental.emit', { eventId: env.eventId });
          break;
      }
    };
    const startPolling = () => {
      if (!wsDegraded) return;
      const domains = ['interaction', 'accidental', 'training', 'quest'] as const;
      const tick = async () => {
        for (const d of domains) {
          const after = lastCursorRef.current[d] || '';
          try {
            const r = await fetch(
              `/api/community/${d}/pending?after=${encodeURIComponent(after)}&limit=100`,
              {
                headers: { 'x-request-id': `req_${Date.now()}` },
              },
            );
            const j = await r.json();
            if (j?.ok && j.data) {
              const evts: any[] = j.data.events || [];
              for (const ev of evts) handleEvent(ev);
              if (j.data.cursor) lastCursorRef.current[d] = j.data.cursor;
            }
          } catch {
            // ignore
          }
        }
        const jitter = Math.floor(Math.random() * 1000) - 500; // ±500ms
        wsTimerRef.current = window.setTimeout(tick, 4000 + jitter) as any;
      };
      if (!wsTimerRef.current) wsTimerRef.current = window.setTimeout(tick, 1200) as any;
    };
    const stopPolling = () => {
      if (wsTimerRef.current) {
        clearTimeout(wsTimerRef.current as any);
        wsTimerRef.current = null;
      }
    };
    const connect = () => {
      // Only connect if WebSocket is explicitly enabled
      const wsEnabled = (process.env.NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS ?? '0') === '1';
      //   envVarType: typeof process.env.NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS,
      // });

      // Always disable WebSocket for now to prevent connection errors
      // WebSocket is disabled by default to prevent "Insufficient resources" errors
      if (
        !wsEnabled ||
        (process.env.NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS ?? '0') === 'false' ||
        process.env.NEXT_PUBLIC_ENABLE_MOCK_COMMUNITY_WS === undefined
      ) {
        // WebSocket disabled, using polling instead
        setWsDegraded(true);
        bc('ws.disabled');
        startPolling();
        return;
      }

      // WebSocket enabled, proceeding with connection

      let ws: WebSocket | null = null;
      try {
        const url =
          process.env.NEXT_PUBLIC_COMMUNITY_WS_URL || 'ws://localhost:8787/__mock_community_ws';
        // Creating WebSocket connection
        ws = new WebSocket(url);
      } catch (e) {
        console.error('WebSocket connection failed:', e);
        setWsFailures((n) => n + 1);
        setWsDegraded(true);
        bc('ws.disconnect');
        startPolling();
        return;
      }
      wsRef.current = ws;
      bc('ws.connect');
      ws.onopen = () => {
        const hello = {
          type: 'hello',
          userId: 'clerk_session',
          sessionId: `sess_${Date.now()}`,
          faces: ['2'],
        };
        ws!.send(JSON.stringify(hello));
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'hello_ack') {
            setWsFailures(0);
            setWsDegraded(false);
            bc('ws.resume', { eventId: msg.resumeCursor });
            stopPolling();
          } else if (msg.type === 'event') {
            handleEvent(msg);
          }
        } catch {}
      };
      ws.onclose = () => {
        setWsFailures((n) => n + 1);
        if (!wsDegraded) {
          // wait 2s before marking degraded
          setTimeout(() => setWsDegraded(true), 2000);
        }
        bc('ws.disconnect');
        startPolling();
        setTimeout(connect, Math.min(5000, 800 + wsFailures * 600));
      };
      ws.onerror = () => {
        try {
          ws?.close();
        } catch {}
      };
    };
    connect();
    return () => {
      stopPolling();
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
    };
  }, [wsDegraded, wsFailures]);

  if (loading) {
    return (
      <div
        className="rounded-lg border border-white/15 bg-white/10 p-4 text-sm text-zinc-300"
        data-testid="face2-card-root"
      >
        Loading…
      </div>
    );
  }
  if (error) {
    return (
      <div
        className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
        role="alert"
      >
        {error === 'AUTH_REQUIRED' ? (
          <div data-testid="routing-guard">
            Login required for Community.{' '}
            <a className="underline" href="/sign-in?redirect_url=/mini-games?face=2">
              Sign in
            </a>{' '}
            or{' '}
            <a className="underline" href="/mini-games?face=0">
              return to Face 0
            </a>
            .
          </div>
        ) : (
          error
        )}
      </div>
    );
  }
  if (!data) return null;

  const prefs = data.prefs || {};

  if (!data.avatar?.url) {
    return (
      <div data-testid="face2-card-root">
        {wsDegraded && (
          <div
            className="mb-2 rounded bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300"
            data-testid="ws-banner-degraded"
          >
            Degraded Realtime: reconnecting… polling active
          </div>
        )}
        <AvatarCreator
          prefs={prefs}
          onSaved={(d) => setData(d)}
          saving={saving}
          setSaving={setSaving}
        />
      </div>
    );
  }
  return (
    <div data-testid="face2-card-root">
      {wsDegraded && (
        <div
          className="mb-2 rounded bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300"
          data-testid="ws-banner-degraded"
        >
          Degraded Realtime: reconnecting… polling active
        </div>
      )}
      <CommunityLobby
        avatarUrl={data.avatar.url}
        prefs={prefs}
        onPrefs={(p) => setData({ avatar: data.avatar, prefs: p })}
        saving={saving}
        setSaving={setSaving}
        pendingInteraction={pendingInteraction}
        onAccept={() => {
          setPendingInteraction(null);
          try {
            const S = Sentry;
            S.addBreadcrumb({
              category: 'minigames',
              message: 'interaction.accepted',
              level: 'info',
              data: { face: 2 },
            });
          } catch {}
        }}
        onDecline={() => {
          setPendingInteraction(null);
          try {
            const S = Sentry;
            S.addBreadcrumb({
              category: 'minigames',
              message: 'interaction.declined',
              level: 'info',
              data: { face: 2 },
            });
          } catch {}
        }}
        trainingActive={trainingActive}
        onTrainingConfirm={async () => {
          const r = await fetch('/api/community/training/confirm', { method: 'POST' });
          const j = await r.json();
          if (j.ok) {
            setTrainingActive(false);
            try {
              const S = Sentry;
              S.addBreadcrumb({
                category: 'minigames',
                message: 'training.learn',
                level: 'info',
                data: { face: 2 },
              });
            } catch {}
          }
        }}
        unlockedEmotes={unlockedEmotes}
        onQuestComplete={async () => {
          const res = await fetch('/api/community/quests/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questId: 'q_dungeon_of_desire', score: 97 }),
          });
          const j = await res.json();
          if (j.ok) {
            setUnlockedEmotes((prev) => new Set([...prev, 'blush_burst']));
            try {
              const S = Sentry;
              S.addBreadcrumb({
                category: 'minigames',
                message: 'emote.unlock',
                level: 'info',
                data: { face: 2, emoteId: 'blush_burst' },
              });
            } catch {}
            setToasts((prev) => [
              ...prev,
              {
                id: `t_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                kind: 'success',
                text: 'Emote unlocked: Blush Burst',
                testId: 'toast-unlock-emote',
              },
            ]);
          }
        }}
        onPerformEmote={async (dirty: boolean) => {
          if (dirty && !prefs.DIRTY_PREF) {
            setToasts((prev) => [
              ...prev,
              {
                id: `t_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                kind: 'warn',
                text: 'Content blocked by preferences',
                testId: 'toast-prefs-blocked',
              },
            ]);
            try {
              const S = Sentry;
              S.addBreadcrumb({
                category: 'minigames',
                message: 'prefs.blocked',
                level: 'info',
                data: { face: 2, dirty: true },
              });
            } catch {}
            return;
          }
          const res = await fetch('/api/community/emote/perform', { method: 'POST' });
          if (res.status === 429) {
            setToasts((prev) => [
              ...prev,
              {
                id: `t_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                kind: 'warn',
                text: 'Rate limited. Please wait.',
                testId: 'toast-rate-limited',
              },
            ]);
            try {
              const S = Sentry;
              S.addBreadcrumb({
                category: 'minigames',
                message: 'rate_limited',
                level: 'info',
                data: { face: 2 },
              });
            } catch {}
          } else {
            try {
              if (dirty && prefs.JIGGLE_VISIBLE) {
                const S = Sentry;
                S.addBreadcrumb({
                  category: 'minigames',
                  message: 'jiggle.play',
                  level: 'info',
                  data: { face: 2, dirty: true },
                });
              }
            } catch {}
          }
        }}
        onRequestInteraction={async () => {
          try {
            const res = await fetch('/api/community/interaction/request', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-request-id': `req_${Date.now()}` },
              body: JSON.stringify({ targetId: 'demo_target' }),
            });
            const j = await res.json().catch(() => ({}));
            if (res.status === 403 || j?.code === 'BLOCKED') {
              setToasts((prev) => [
                ...prev,
                {
                  id: `t_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                  kind: 'warn',
                  text: 'Target has blocked you',
                  testId: 'toast-blocked',
                },
              ]);
              setTimeout(
                () => setToasts((prev) => prev.filter((x) => x.testId !== 'toast-blocked')),
                2500,
              );
              return;
            }
            setPendingInteraction({ requestId: j?.data?.requestId || `req_local_${Date.now()}` });
            try {
              const S = Sentry;
              S.addBreadcrumb({
                category: 'minigames',
                message: 'interaction.request.sent',
                level: 'info',
                data: { face: 2 },
              });
            } catch {}
          } catch (e) {
            console.error('Failed to send interaction request:', e);
            setToasts((prev) => [
              ...prev,
              {
                id: `t_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                kind: 'warn',
                text: 'Failed to send request',
                testId: 'toast-request-failed',
              },
            ]);
            setTimeout(
              () => setToasts((prev) => prev.filter((x) => x.testId !== 'toast-request-failed')),
              2500,
            );
          }
        }}
      />
      {/* toasts */}
      <div className="mt-2 space-y-1">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="rounded bg-white/10 px-3 py-2 text-[11px] text-zinc-200"
            data-testid={t.testId}
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function AvatarCreator({
  prefs,
  onSaved,
  saving,
  setSaving,
}: {
  prefs: any;
  onSaved: (d: any) => void;
  saving: boolean;
  setSaving: (b: boolean) => void;
}) {
  const [url, setUrl] = React.useState('');
  const [dirty, setDirty] = React.useState(!!prefs.DIRTY_PREF);
  const [jiggle, setJiggle] = React.useState(!!prefs.JIGGLE_VISIBLE);
  const [audio, setAudio] = React.useState(prefs.AUDIO !== false);

  const save = async () => {
    setSaving(true);
    const body = {
      avatar: url ? { url } : undefined,
      prefs: { DIRTY_PREF: dirty, JIGGLE_VISIBLE: jiggle, AUDIO: audio },
    };
    const res = await fetch('/api/user/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-request-id': `req_${Date.now()}` },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    setSaving(false);
    if (j.ok) onSaved(j.data);
  };

  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-4">
      <div className="mb-2 text-sm text-zinc-200">Create your avatar</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs text-zinc-300">
          Image URL
          <input
            name="avatarUrl"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15"
            placeholder="https://…/avatar.png"
          />
        </label>
        <label className="text-xs text-zinc-300 inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="audio"
            checked={audio}
            onChange={(e) => setAudio(e.target.checked)}
          />
          Enable Audio
        </label>
        <label className="text-xs text-zinc-300 inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="jiggle"
            checked={jiggle}
            onChange={(e) => setJiggle(e.target.checked)}
          />
          Jiggle Visible (a11y toggle exists)
        </label>
        <label className="text-xs text-zinc-300 inline-flex items-center gap-2">
          <input
            type="checkbox"
            name="dirty"
            checked={dirty}
            onChange={(e) => setDirty(e.target.checked)}
          />
          DIRTY Pref (consent-gated)
        </label>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-pink-600 px-3 py-1 text-sm text-white hover:bg-pink-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

function CommunityLobby({
  avatarUrl,
  prefs,
  onPrefs,
  saving,
  setSaving,
  pendingInteraction,
  onAccept,
  onDecline,
  trainingActive,
  onTrainingConfirm,
  unlockedEmotes,
  onQuestComplete,
  onPerformEmote,
  onRequestInteraction,
}: {
  avatarUrl: string;
  prefs: any;
  onPrefs: (p: any) => void;
  saving: boolean;
  setSaving: (b: boolean) => void;
  pendingInteraction: { requestId: string } | null;
  onAccept: () => void;
  onDecline: () => void;
  trainingActive: boolean;
  onTrainingConfirm: () => void;
  unlockedEmotes: Set<string>;
  onQuestComplete: () => void;
  onPerformEmote: (dirty: boolean) => void;
  onRequestInteraction: () => void;
}) {
  const [crt, setCrt] = React.useState(!!prefs.CRT);
  const [vhs, setVhs] = React.useState(!!prefs.VHS);
  const [audio, setAudio] = React.useState(prefs.AUDIO !== false);

  const save = async () => {
    setSaving(true);
    const body = { prefs: { ...prefs, CRT: crt, VHS: vhs, AUDIO: audio } };
    const res = await fetch('/api/user/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-request-id': `req_${Date.now()}` },
      body: JSON.stringify(body),
    });
    const j = await res.json();
    setSaving(false);
    if (j.ok) onPrefs(j.data.prefs);
  };

  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-4">
      <div className="mb-3 flex items-center gap-3">
        {}
        <img src={avatarUrl} alt="" className="h-10 w-10 rounded" />
        <div className="text-sm text-zinc-200" data-testid="avatar-persisted">
          Welcome to the Community Lobby
        </div>
      </div>
      {/* Hotbar */}
      <div className="mb-3 flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            data-testid={`hotbar-slot-${i}`}
            className="rounded bg-white/10 px-2 py-1 text-[11px] text-zinc-200"
          >
            {i === 1 && unlockedEmotes.has('blush_burst') ? (
              <span>
                Blush Burst{' '}
                <span className="ml-1 rounded bg-pink-500/20 px-1" data-testid="combo-badge">
                  combo
                </span>
              </span>
            ) : (
              '—'
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-xs text-zinc-300 inline-flex items-center gap-2">
          <input type="checkbox" checked={crt} onChange={(e) => setCrt(e.target.checked)} /> CRT
        </label>
        <label className="text-xs text-zinc-300 inline-flex items-center gap-2">
          <input type="checkbox" checked={vhs} onChange={(e) => setVhs(e.target.checked)} /> VHS
        </label>
        <label
          className="text-xs text-zinc-300 inline-flex items-center gap-2"
          data-testid="chip-consent"
        >
          <input type="checkbox" checked={audio} onChange={(e) => setAudio(e.target.checked)} />{' '}
          Audio
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-pink-600 px-3 py-1 text-sm text-white hover:bg-pink-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
        <button
          onClick={onQuestComplete}
          data-testid="btn-start-quest"
          className="rounded border border-white/20 px-3 py-1 text-sm text-white/90"
        >
          Start Quest
        </button>
        <button
          onClick={() => onPerformEmote(false)}
          className="rounded border border-white/20 px-3 py-1 text-sm text-white/90"
        >
          Perform Emote
        </button>
        <button
          onClick={() => onPerformEmote(true)}
          className="rounded border border-white/20 px-3 py-1 text-sm text-white/90"
        >
          Perform DIRTY Emote
        </button>
        <button
          onClick={async () => {
            await fetch('/api/community/emote/perform', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ emoteId: 'bow' }),
            });
          }}
          className="rounded border border-white/20 px-3 py-1 text-sm text-white/90"
        >
          Bow
        </button>
        <button
          onClick={async () => {
            await fetch('/api/community/emote/perform', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ emoteId: 'thrust' }),
            });
          }}
          className="rounded border border-white/20 px-3 py-1 text-sm text-white/90"
        >
          Thrust
        </button>
        <button
          onClick={onRequestInteraction}
          data-testid="btn-request-interaction"
          className="rounded border border-white/20 px-3 py-1 text-sm text-white/90"
        >
          Request Interaction
        </button>
      </div>
      {pendingInteraction && (
        <div className="mt-3 rounded border border-white/15 bg-white/5 p-3 text-sm text-zinc-200">
          Incoming interaction request
          <div className="mt-2 flex gap-2">
            <button
              onClick={onAccept}
              data-testid="btn-accept"
              className="rounded bg-green-600 px-3 py-1 text-white text-xs"
            >
              Accept
            </button>
            <button
              onClick={onDecline}
              data-testid="btn-decline"
              className="rounded bg-red-600 px-3 py-1 text-white text-xs"
            >
              Decline
            </button>
          </div>
        </div>
      )}
      {trainingActive && (
        <div className="mt-3 flex items-center gap-2" data-testid="training-ring">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-400 border-r-transparent" />
          <button
            onClick={onTrainingConfirm}
            data-testid="btn-training-confirm"
            className="rounded border border-white/20 px-2 py-0.5 text-xs text-white/90"
          >
            Confirm Training
          </button>
        </div>
      )}
      <div className="mt-4 text-[11px] text-zinc-400">
        Card-contained; consent gates enforced for DIRTY/jiggle. Realtime events pending.
      </div>
    </div>
  );
}
