import { useEffect, useRef, useState, useCallback } from 'react';
import { communityWS } from '@/lib/websocket/client';
import PetalParticleBurst from '@/app/components/effects/PetalParticleBurst';

const GLOBAL_PETAL_KEY = 'global_petals';
const USER_PETAL_KEY = 'user_petals';
const USER_PETAL_DATE_KEY = 'user_petals_date';
const GUEST_LIMIT = 50;
const USER_LIMIT = 2500; // For authenticated users (to be implemented with auth)
const ACHIEVEMENTS = [10, 50, 100, 500, 1000, 2500];

export default function PetalGameImage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userPetals, setUserPetals] = useState(0);
  const [globalPetals, setGlobalPetals] = useState(0);
  const [dailyCollectors, setDailyCollectors] = useState(0);
  const [lastCollectDate, setLastCollectDate] = useState('');
  const [particleTrigger, setParticleTrigger] = useState(0);

  // Calculate user limit based on auth status (guest vs authenticated)
  const effectiveLimit = userPetals > GUEST_LIMIT ? USER_LIMIT : GUEST_LIMIT;
  const [limitReached, setLimitReached] = useState(false);
  const [achievement, setAchievement] = useState<string | null>(null);

  // Daily reset logic
  useEffect(() => {
    const local = localStorage.getItem(USER_PETAL_KEY);
    const date = localStorage.getItem(USER_PETAL_DATE_KEY);
    if (local) setUserPetals(Number(local));
    if (date) setLastCollectDate(date);
    const today = new Date().toISOString().slice(0, 10);
    if (date !== today) {
      localStorage.setItem(USER_PETAL_KEY, '0');
      localStorage.setItem(USER_PETAL_DATE_KEY, today);
      setUserPetals(0);
      setLastCollectDate(today);
    }
  }, []);

  // WebSocket integration for real-time global petals
  useEffect(() => {
    // Connect to WebSocket
    communityWS.connect();

    // Subscribe to global petal updates
    const unsubscribe = communityWS.on('global-petals', (message) => {
      if (message.type === 'global-petals') {
        setGlobalPetals(message.count);
        setDailyCollectors(message.dailyCollectors);
        // Cache for fallback
        localStorage.setItem(GLOBAL_PETAL_KEY, String(message.count));
      }
    });

    // Initial fetch from API as fallback
    const fetchGlobal = async () => {
      try {
        const response = await fetch('/api/v1/petals/global');
        const data = await response.json();

        if (data?.ok && typeof data.data?.count === 'number') {
          setGlobalPetals(data.data.count);
        } else {
          // Fallback to localStorage for global count
          const cachedGlobal = localStorage.getItem(GLOBAL_PETAL_KEY);
          if (cachedGlobal) setGlobalPetals(Number(cachedGlobal));
        }
      } catch (err) {
        console.error('Error fetching global petals:', err);
        // Use cached value on error
        const cachedGlobal = localStorage.getItem(GLOBAL_PETAL_KEY);
        if (cachedGlobal) setGlobalPetals(Number(cachedGlobal));
      }
    };
    fetchGlobal();

    return () => {
      unsubscribe();
      communityWS.disconnect();
    };
  }, []);

  // Particle click handler
  const handlePetalClick = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      // Prevent default for keyboard events
      if ('key' in event && event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      if (userPetals >= effectiveLimit) {
        setLimitReached(true);
        return;
      }

      // Trigger particle burst animation
      setParticleTrigger((prev) => prev + 1);

      setUserPetals((count) => {
        const newCount = count + 1;
        localStorage.setItem(USER_PETAL_KEY, String(newCount));

        // Update global count
        setGlobalPetals((global) => {
          const newGlobal = global + 1;
          localStorage.setItem(GLOBAL_PETAL_KEY, String(newGlobal));

          // Sync to backend
          fetch('/api/v1/petals/increment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 1 }),
          }).catch((err) => console.error('Failed to sync global petal:', err));

          return newGlobal;
        });

        if (ACHIEVEMENTS.includes(newCount)) {
          setAchievement(`Achievement unlocked: ${newCount} petals!`);
          setTimeout(() => setAchievement(null), 2500);
        }
        return newCount;
      });
    },
    [userPetals, effectiveLimit],
  );

  return (
    <div
      ref={containerRef}
      className="relative aspect-[2/1] w-full overflow-hidden rounded-none shadow-xl md:rounded-3xl"
      style={{ minHeight: '320px', background: '#1a1a1a' }}
    >
      <div
        role="button"
        tabIndex={0}
        className="absolute inset-0 h-full w-full cursor-pointer"
        onClick={handlePetalClick}
        onKeyDown={handlePetalClick}
        aria-label="Click to collect petals"
      >
        <img
          src="/assets/cherry.jpg"
          alt="Cherry Blossom Animated Tree"
          className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover object-center"
          draggable={false}
        />
      </div>

      {/* Particle burst animation */}
      <PetalParticleBurst trigger={particleTrigger} className="z-10" />

      {/* User petal counter */}
      <div className="pointer-events-none absolute right-4 top-2 z-20 rounded-full bg-pink-900/80 px-4 py-1 text-lg font-bold text-white shadow-lg">
        Your Petals: {userPetals} / {effectiveLimit}
      </div>

      {/* Global petal counter with daily collectors */}
      <div className="pointer-events-none absolute left-4 top-2 z-20 flex flex-col gap-1">
        <div className="rounded-full bg-pink-700/80 px-4 py-1 text-lg font-bold text-white shadow-lg">
          Community Petals: {globalPetals.toLocaleString()}
        </div>
        {dailyCollectors > 0 && (
          <div className="animate-pulse rounded-full bg-pink-600/70 px-3 py-0.5 text-sm text-white shadow-md">
            {dailyCollectors.toLocaleString()} travelers collected today
          </div>
        )}
      </div>
      {/* Limit reached error */}
      {limitReached && (
        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <div className="animate-bounce rounded-2xl bg-pink-800/90 px-8 py-4 text-xl font-bold text-white shadow-xl">
            Daily petal limit reached!
          </div>
        </div>
      )}
      {/* Achievement popup */}
      {achievement && (
        <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 animate-pulse rounded-xl bg-pink-600/90 px-6 py-3 text-lg font-bold text-white shadow-lg">
          {achievement}
        </div>
      )}
    </div>
  );
}
