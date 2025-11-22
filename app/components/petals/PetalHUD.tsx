'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PetalHUD() {
  const [visible, setVisible] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [me, setMe] = useState<number | null>(null);
  const [lifetimePetals, setLifetimePetals] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [team, setTeam] = useState<{
    active: boolean;
    total: number;
    goal: number;
    eventName?: string;
  } | null>(null);

  // Check if user has seen HUD before (hidden by default until first collect)
  useEffect(() => {
    const hasSeenHUD = localStorage.getItem('om_has_seen_petal_hud') === 'true';
    if (hasSeenHUD) {
      // User has seen HUD before, show it immediately
      setVisible(true);
      // Fetch initial balance
      fetch('/api/v1/petals/balance')
        .then((r) => r.json())
        .then((data) => {
          if (data.ok && data.data) {
            setMe(data.data.balance);
            setLifetimePetals(data.data.lifetimePetalsEarned ?? null);
            setIsGuest(data.data.isGuest ?? false);
          }
        })
        .catch(() => {
          // Fallback to legacy API
          fetch('/api/petals/me')
            .then((r) => r.json())
            .then((j) => {
              setMe(j.total);
            });
        });
    }
    // Fetch team data
    fetch('/api/petals/global')
      .then((r) => r.json())
      .then((j) => setTeam(j))
      .catch(() => {});
  }, []);

  // Sync balance function
  const syncBalance = useCallback(async () => {
    try {
      // Try v1 API first (for authenticated users)
      const response = await fetch('/api/v1/petals/balance');
      if (response.ok) {
        const data = await response.json();
        if (data.ok && data.data) {
          setMe(data.data.balance);
          setLifetimePetals(data.data.lifetimePetalsEarned ?? null);
          setIsGuest(data.data.isGuest ?? false);
          return;
        }
      }

      // Fallback to legacy API
      const j = await fetch('/api/petals/me').then((r) => r.json());
      setMe(j.total);
    } catch (error) {
      console.error('Failed to sync petal balance:', error);
    }
  }, []);

  // listen for petal-collect and petal:earn events
  useEffect(() => {
    const onCollect = async () => {
      await syncBalance();
      const g = await fetch('/api/petals/global')
        .then((r) => r.json())
        .catch(() => null);
      if (g) setTeam(g);
    };

    const onEarn = async (event: CustomEvent) => {
      // Check if this is the first collect (HUD reveal)
      const hasSeenHUD = localStorage.getItem('om_has_seen_petal_hud') === 'true';
      const isFirstCollect = !hasSeenHUD;

      // Update balance optimistically if provided
      if (event.detail?.balance !== null && event.detail?.balance !== undefined) {
        setMe(event.detail.balance);
      } else {
        // Otherwise sync from server
        await syncBalance();
      }

      // Update lifetime if provided
      if (
        event.detail?.lifetimePetalsEarned !== null &&
        event.detail?.lifetimePetalsEarned !== undefined
      ) {
        setLifetimePetals(event.detail.lifetimePetalsEarned);
      }

      // Update guest status
      if (event.detail?.isGuest !== undefined) {
        setIsGuest(event.detail.isGuest);
      }

      // Reveal HUD on first collect
      if (isFirstCollect) {
        localStorage.setItem('om_has_seen_petal_hud', 'true');
        setVisible(true);
        setShowAnimation(true);
        // Remove animation flag after animation completes
        setTimeout(() => setShowAnimation(false), 800);
      }
    };

    const onSpend = async (event: CustomEvent) => {
      // Update balance optimistically if provided
      if (event.detail?.balance !== null && event.detail?.balance !== undefined) {
        setMe(event.detail.balance);
      } else {
        // Otherwise sync from server
        await syncBalance();
      }

      // Lifetime doesn't change on spend, but update if provided
      if (
        event.detail?.lifetimePetalsEarned !== null &&
        event.detail?.lifetimePetalsEarned !== undefined
      ) {
        setLifetimePetals(event.detail.lifetimePetalsEarned);
      }
    };

    window.addEventListener('petal:collect', onCollect as any);
    window.addEventListener('petal:earn', onEarn as any);
    window.addEventListener('petal:spend', onSpend as any);
    return () => {
      window.removeEventListener('petal:collect', onCollect as any);
      window.removeEventListener('petal:earn', onEarn as any);
      window.removeEventListener('petal:spend', onSpend as any);
    };
  }, [syncBalance]);

  const pct =
    team?.active && team.goal ? Math.min(100, Math.round((team.total / team.goal) * 100)) : 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={showAnimation ? { opacity: 0, scale: 0.8, y: -20 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
          }}
          className="fixed top-6 right-6 z-40 w-[min(90vw,280px)] space-y-2"
          aria-live="polite"
          aria-label={`Petal balance: ${me ?? 0}`}
        >
          {/* Personal */}
          <motion.div
            initial={showAnimation ? { opacity: 0, x: 20 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: showAnimation ? 0.1 : 0, duration: 0.4 }}
            className={`rounded-xl border border-white/20 bg-gradient-to-br from-black/80 via-purple-900/20 to-black/80 p-4 backdrop-blur-md shadow-lg ${
              showAnimation ? 'ring-2 ring-pink-400/50 ring-offset-2 ring-offset-black/50' : ''
            }`}
          >
            <div className="flex flex-col items-start gap-1">
              <div className="text-xs text-zinc-400 font-medium">Petals</div>
              <div className="text-2xl font-bold text-white tabular-nums">{me ?? 0}</div>
              {/* Show lifetime for authenticated users, or on hover/click for guests */}
              {!isGuest && lifetimePetals !== null && lifetimePetals > 0 ? (
                <div className="text-[10px] text-pink-200/60">
                  Lifetime: {lifetimePetals.toLocaleString()}
                </div>
              ) : isGuest ? (
                <div className="text-[10px] text-zinc-500 italic">Sign in to save your petals</div>
              ) : null}
            </div>
          </motion.div>

          {/* Team (event) */}
          {team?.active && (
            <motion.div
              initial={showAnimation ? { opacity: 0, x: 20 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: showAnimation ? 0.2 : 0, duration: 0.4 }}
              className="rounded-xl border border-white/20 bg-gradient-to-br from-black/80 via-purple-900/20 to-black/80 p-3 backdrop-blur-md shadow-lg"
            >
              <div className="mb-1 flex items-center justify-between text-xs text-zinc-300">
                <span>{team.eventName || 'Community Bloom'}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-zinc-800">
                <div className="h-full rounded-full bg-fuchsia-600" style={{ width: `${pct}%` }} />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
