'use client';
import { useEffect, useState, useCallback } from 'react';

export default function PetalHUD() {
  const [visible, setVisible] = useState(false);
  const [me, setMe] = useState<number | null>(null);
  const [lifetimePetals, setLifetimePetals] = useState<number | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [team, setTeam] = useState<{
    active: boolean;
    total: number;
    goal: number;
    eventName?: string;
  } | null>(null);

  useEffect(() => {
    const seen = localStorage.getItem('om_petal_seen');
    if (seen === '1') setVisible(true);
    // initial fetch
    fetch('/api/petals/me')
      .then((r) => r.json())
      .then((j) => {
        setMe(j.total);
        if (j.total > 0) {
          localStorage.setItem('om_petal_seen', '1');
          setVisible(true);
        }
      });
    fetch('/api/petals/global')
      .then((r) => r.json())
      .then((j) => setTeam(j));
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
          localStorage.setItem('om_petal_seen', '1');
          setVisible(true);
          return;
        }
      }
      
      // Fallback to legacy API
      const j = await fetch('/api/petals/me').then((r) => r.json());
      setMe(j.total);
      if (j.total > 0) {
        localStorage.setItem('om_petal_seen', '1');
        setVisible(true);
      }
    } catch (error) {
      console.error('Failed to sync petal balance:', error);
    }
  }, []);

  // listen for petal-collect and petal:earn events
  useEffect(() => {
    const onCollect = async () => {
      await syncBalance();
      const g = await fetch('/api/petals/global').then((r) => r.json()).catch(() => null);
      if (g) setTeam(g);
    };
    
    const onEarn = async (event: CustomEvent) => {
      // Update balance optimistically if provided
      if (event.detail?.balance !== null && event.detail?.balance !== undefined) {
        setMe(event.detail.balance);
      } else {
        // Otherwise sync from server
        await syncBalance();
      }
      
      // Update lifetime if provided
      if (event.detail?.lifetimePetalsEarned !== null && event.detail?.lifetimePetalsEarned !== undefined) {
        setLifetimePetals(event.detail.lifetimePetalsEarned);
      }
      
      // Update guest status
      if (event.detail?.isGuest !== undefined) {
        setIsGuest(event.detail.isGuest);
      }
      
      localStorage.setItem('om_petal_seen', '1');
      setVisible(true);
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
      if (event.detail?.lifetimePetalsEarned !== null && event.detail?.lifetimePetalsEarned !== undefined) {
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

  if (!visible) return null;

  const pct =
    team?.active && team.goal ? Math.min(100, Math.round((team.total / team.goal) * 100)) : 0;

  return (
    <div className="fixed bottom-6 right-6 z-40 w-[min(90vw,340px)] space-y-2">
      {/* Personal */}
      <div className="rounded-xl border border-white/12 bg-black/70 p-3 backdrop-blur-md">
        <div className="flex flex-col items-start gap-0.5">
          <div className="text-xs text-zinc-300">Petals</div>
          <div className="text-xl font-semibold text-white">{me ?? 0}</div>
          {/* Show lifetime for authenticated users, or on hover/click for guests */}
          {!isGuest && lifetimePetals !== null && lifetimePetals > 0 ? (
            <div className="text-[10px] text-pink-200/50">
              Lifetime: {lifetimePetals.toLocaleString()}
            </div>
          ) : isGuest ? (
            <div className="text-[10px] text-zinc-500 italic">
              Sign in to save your petals
            </div>
          ) : null}
        </div>
      </div>

      {/* Team (event) */}
      {team?.active && (
        <div className="rounded-xl border border-white/12 bg-black/70 p-3 backdrop-blur-md">
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-300">
            <span>{team.eventName || 'Community Bloom'}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-fuchsia-600" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
