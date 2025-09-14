'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gamesMeta from '../games.meta.json';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import OwnedRunesGrid from '@/app/mini-games/_components/OwnedRunesGrid';
import RuneGlyph from '@/app/components/runes/RuneGlyph';
import { http } from '@/app/lib/http';
import * as Sentry from '@sentry/nextjs';

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

export default function ConsoleCard({ gameKey, defaultFace }: { gameKey?: string; defaultFace?: number }) {
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

  // Boot gate once per session
  useEffect(() => {
    const key = 'om_gc_boot_seen';
    const seen = typeof window !== 'undefined' ? sessionStorage.getItem(key) === '1' : true;
    if (!seen) {
      setMode('boot');
      const t = setTimeout(() => {
        sessionStorage.setItem(key, '1');
        setMode('cube');
      }, 2000);
      return () => clearTimeout(t);
    }
    setMode('cube');
  }, []);

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
      }
      if (e.key === 'ArrowRight') {
        setAnimMs(isReducedMotion ? 100 : 180);
        if (face === 0) setFace(2);
        else if (face === 1) setFace(0);
        else if (face === 2) setFace(0);
      }
      // Vertical rotation between front/top/bottom
      if (e.key === 'ArrowUp') {
        setAnimMs(isReducedMotion ? 100 : 180);
        if (face === 0) setFace(4);
        else if (face === 3) setFace(0);
        else if (face === 4) setFace(0);
      }
      if (e.key === 'ArrowDown') {
        setAnimMs(isReducedMotion ? 100 : 180);
        if (face === 0) setFace(3);
        else if (face === 4) setFace(0);
        else if (face === 3) setFace(0);
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
    const nearest = withAngles.reduce((best, cur) =>
      dist(current, cur.rot) < dist(current, best.rot) ? cur : best,
    withAngles[0]);
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
      <div className="grid grid-cols-2 gap-3">
        <button className="rounded-lg border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15" onClick={() => setFace(1)}>
          <div className="text-white font-medium">Mini-Games</div>
          <div className="text-xs text-zinc-300">Choose a game</div>
        </button>
        <button className="rounded-lg border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15" onClick={() => setFace(2)}>
          <div className="text-white font-medium">Character / Community</div>
          <div className="text-xs text-zinc-300">Create avatar, see feed</div>
        </button>
        <button className="rounded-lg border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15" onClick={() => setFace(3)}>
          <div className="text-white font-medium">Music + Extras</div>
          <div className="text-xs text-zinc-300">OST, CRT, VHS</div>
        </button>
        <button className="rounded-lg border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15" onClick={() => setFace(4)}>
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
          <a href="/profile/achievements" className="text-xs text-pink-300 underline hover:text-pink-200">View Achievements</a>
          <PetalSlot />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {(gamesMeta as Array<{ slug: string; name: string; icon: string; desc: string }>).map((g) => (
          <button
            key={g.slug}
            className="group relative rounded-lg border border-white/15 bg-white/10 p-4 text-left hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-pink-500/60"
            onClick={() => router.push(`/mini-games/games/${g.slug}`)}
            data-testid="start-game"
          >
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <GameIcon slug={g.slug} icon={g.icon} />
                <div className="text-white font-medium">{g.name}</div>
              </div>
              <span className="text-xs text-pink-300">Start</span>
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
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-1 text-sm font-semibold text-zinc-100">{g.name}</div>
              <p className="text-xs text-zinc-300">{g.desc}</p>
              <div className="mt-2 text-[10px] text-zinc-400">Press Enter/A to start</div>
            </div>
          </button>
        ))}
      </div>
      <AchievementsPreview />
    </div>
  );

  const CharacterFace = () => (
    <div className="p-4 space-y-2">
      <FaceTitle>Character / Community</FaceTitle>
      <div className="rounded-lg border border-white/15 bg-white/10 p-4 text-sm text-zinc-300">
        Character creation and community feed will appear here after avatar setup.
      </div>
    </div>
  );

  const MusicFace = () => (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <FaceTitle>Music + Extras</FaceTitle>
        <label className="text-xs text-zinc-300 inline-flex items-center gap-2" data-testid="card-audio-toggle">
          <input type="checkbox" className="accent-pink-500" checked={audioOn} onChange={(e) => setAudioOn(e.target.checked)} />
          Audio
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {['ost_loop_1.mp3', 'ost_loop_2.mp3'].map((src) => (
          <div key={src} className="rounded-lg border border-white/15 bg-white/10 p-3">
            <div className="text-xs text-zinc-300">{src}</div>
            {audioOn && (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <audio src={`/${src}`} loop autoPlay controls className="mt-2 w-full" preload="none" />
            )}
          </div>
        ))}
      </div>
      <div className="text-xs text-zinc-400">CRT/Scanline/VHS toggles to be applied card-local.</div>
    </div>
  );

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
          <select className="bg-black/40 text-white text-sm rounded px-2 py-1 border border-white/15" value={selected} onChange={(e) => setSelected(e.target.value)}>
            {['rune_a', 'rune_b', 'rune_c', 'rune_d', 'rune_e'].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <span className="text-zinc-400">+</span>
          <select className="bg-black/40 text-white text-sm rounded px-2 py-1 border border-white/15" value={second} onChange={(e) => setSecond(e.target.value)}>
            {['rune_a', 'rune_b', 'rune_c', 'rune_d', 'rune_e'].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button onClick={fuse} className="ml-auto rounded border border-pink-400/40 px-3 py-1 text-sm text-pink-200 hover:bg-pink-500/10 disabled:opacity-50" disabled={busy} data-testid="fuse-submit">
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

  const Boot = () => (
    <div className="grid place-items-center h-64" data-testid="boot-seen">
      <div className="text-center text-pink-200">
        <div className="mb-2 text-lg">GameCube BIOS</div>
        <div className="text-xs opacity-80">Booting…</div>
      </div>
    </div>
  );

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
      tabIndex={0}
      className="mx-auto max-w-5xl rounded-2xl border border-white/15 bg-black/50 p-4 outline-none"
      aria-label="Mini-Games Console"
    >
      {mode === 'boot' && <Boot />}
      {mode === 'loadingGame' && <LoadingGame />}
      {mode === 'playingGame' && <PlayingGame />}
      {mode === 'cube' && (
        <div
          className="mx-auto my-1"
          style={{ perspective: '1000px', width: '100%', maxWidth: 720, userSelect: 'none' as any, touchAction: 'none' as any }}
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
              style={{ transform: `translateZ(${cubeSize / 2}px)`, backfaceVisibility: 'hidden' as any }}
            >
              <FaceRoot />
            </div>
            {/* Left (Face 1) */}
            <div
              className="absolute inset-0 rounded-xl border border-white/15 bg-white/5 text-white"
              style={{ transform: `rotateY(-90deg) translateZ(${cubeSize / 2}px)`, backfaceVisibility: 'hidden' as any }}
            >
              <MiniGamesFace />
            </div>
            {/* Right (Face 2) */}
            <div
              className="absolute inset-0 rounded-xl border border-white/15 bg-white/5 text-white"
              style={{ transform: `rotateY(90deg) translateZ(${cubeSize / 2}px)`, backfaceVisibility: 'hidden' as any }}
            >
              <CharacterFace />
            </div>
            {/* Bottom (Face 3) */}
            <div
              className="absolute inset-0 rounded-xl border border-white/15 bg-white/5 text-white"
              style={{ transform: `rotateX(90deg) translateZ(${cubeSize / 2}px)`, backfaceVisibility: 'hidden' as any }}
            >
              <MusicFace />
            </div>
            {/* Top (Face 4) */}
            <div
              className="absolute inset-0 rounded-xl border border-white/15 bg-white/5 text-white"
              style={{ transform: `rotateX(-90deg) translateZ(${cubeSize / 2}px)`, backfaceVisibility: 'hidden' as any }}
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
          <span className="emoji-noto">🎮</span>
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
            <div key={a.id} className="rounded bg-white/10 p-2 text-[11px] text-zinc-200" title={a.description}>
              <div className="truncate">{a.name}</div>
              {a.unlockedAt && (
                <div className="text-[10px] text-zinc-400">{new Date(a.unlockedAt).toLocaleDateString()}</div>
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
    'rhythm-beat-em-up': dynamic(() => import('../rhythm-beat-em-up/Scene'), { ssr: false }),
    'bubble-girl': dynamic(() => import('../bubble-girl/InCard'), { ssr: false }),
    'quick-math': dynamic(() => import('../quick-math/QuickMathWrapper').then((m) => m.QuickMathWrapper), { ssr: false }),
    'puzzle-reveal': dynamic(() => import('../puzzle-reveal/InCard'), { ssr: false }),
    'petal-samurai': dynamic(() => import('../petal-samurai/InCard'), { ssr: false }),
    'petal-storm-rhythm': dynamic(() => import('../petal-storm-rhythm/InCard'), { ssr: false }),
    'bubble-ragdoll': dynamic(() => import('../bubble-ragdoll/Scene'), { ssr: false }),
    'samurai-petal-slice': dynamic(() => import('../samurai-petal-slice/Scene'), { ssr: false }),
    'blossomware': dynamic(() => import('../blossomware/InCard'), { ssr: false }),
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
  const [imgSrc, setImgSrc] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    const candidates = [
      `/assets/games/${slug}.svg`,
      `/assets/games/${slug}.png`,
      `/assets/games/${slug}.jpg`,
    ];
    let i = 0;
    const tryNext = () => {
      if (i >= candidates.length) {
        if (!cancelled) setImgSrc(null);
        return;
      }
      const src = candidates[i++];
      const img = new Image();
      img.onload = () => {
        if (!cancelled) setImgSrc(src);
      };
      img.onerror = () => tryNext();
      img.src = src;
    };
    tryNext();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const statusDot = (
    process.env.NODE_ENV !== 'production' && (
      <span
        className={[
          'ml-1 inline-block h-1.5 w-1.5 rounded-full align-middle',
          imgSrc ? 'bg-green-400' : 'bg-zinc-500',
        ].join(' ')}
        title={imgSrc ? 'Custom icon found' : 'Using fallback icon'}
      />
    )
  );

  if (imgSrc) {
    return (
      <span className="inline-flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
