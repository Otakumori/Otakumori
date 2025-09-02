/* eslint-disable react-hooks/exhaustive-deps */
 
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import CherryBlossom from '@/components/animations/CherryBlossom';
import { usePetalContext, eventBus } from '@/providers';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_PETALS = 30;
const CLICK_THROTTLE = 300; // ms
const MODAL_TRIGGER = 10;

const SEASON_VARIANTS: Record<string, PetalTypeKey[]> = {
  spring: ['normal'],
  summer: ['normal', 'golden'],
  autumn: ['normal', 'glitch'],
  winter: ['normal', 'blackLotus'],
};
const PETAL_TYPE_PROPS: Record<PetalTypeKey, { img: string; min: number; max: number }> = {
  normal: { img: '/assets/petal.svg', min: 1, max: 3 },
  golden: { img: '/assets/images/petal-golden.svg', min: 5, max: 10 },
  glitch: { img: '/assets/images/petal-glitch.svg', min: 7, max: 15 },
  blackLotus: { img: '/assets/images/petal-lotus.svg', min: 20, max: 50 },
};

// Otaku-Mori Petal System Spec
type PetalTypeKey = 'normal' | 'golden' | 'glitch' | 'blackLotus';

interface PetalType {
  name: string;
  rarity: number;
  reward: number[];
  img: string;
  seasonal?: boolean;
  seasonalBurstOnly?: boolean;
  contextualOnly?: boolean;
}

const PetalTypes: Record<PetalTypeKey, PetalType> = {
  normal: {
    name: 'Cherry Petal',
    rarity: 1.0,
    reward: [1, 2],
    seasonal: true,
    img: '/assets/petal.svg',
  },
  golden: {
    name: 'Golden Bloom',
    rarity: 0.05,
    reward: [5, 10],
    seasonalBurstOnly: true,
    img: '/assets/images/petal-golden.svg',
  },
  glitch: {
    name: 'Glitch Fragment',
    rarity: 0.01,
    reward: [10, 15],
    contextualOnly: true,
    img: '/assets/images/petal-glitch.svg',
  },
  blackLotus: {
    name: 'Black Lotus',
    rarity: 0.001,
    reward: [50, 100],
    seasonalBurstOnly: true,
    img: '/assets/images/petal-lotus.svg',
  },
};

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface Petal {
  id: string;
  x: number;
  y: number;
  animating: boolean;
  type?: PetalTypeKey;
  reward?: number;
  name?: string;
  img?: string;
}

function getSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function getSeasonalPetals(season: string, burstActive: boolean): PetalTypeKey[] {
  let activeTypes: PetalTypeKey[] = ['normal'];
  if (burstActive) {
    activeTypes.push('golden', 'glitch', 'blackLotus');
  } else {
    if (season === 'summer') activeTypes.push('golden');
    if (season === 'autumn') activeTypes.push('glitch');
    if (season === 'winter') activeTypes.push('blackLotus');
  }
  return activeTypes;
}

function weightedRandom(types: PetalTypeKey[]): PetalTypeKey {
  const weights = types.map((type) => PetalTypes[type].rarity);
  const total = weights.reduce((a, b) => a + b);
  const rand = Math.random() * total;
  let sum = 0;
  for (let i = 0; i < types.length; i++) {
    sum += weights[i];
    if (rand < sum) return types[i];
  }
  return types[0];
}

function createPetal(typeKey: PetalTypeKey) {
  const id = `${Date.now()}-${Math.random()}`;
  const { name, reward, img } = PetalTypes[typeKey];
  return {
    id,
    type: typeKey,
    name,
    x: Math.random() * 90 + 5,
    y: Math.random() * 80 + 5,
    reward: getRandomInt(reward[0], reward[1]),
    animating: false,
    img,
  };
}

const IDLE_INTERVAL_MIN = 30 * 1000; // 30 seconds
const IDLE_INTERVAL_MAX = 60 * 1000; // 60 seconds
const IDLE_PETAL_AMOUNT = 2;
const IDLE_SESSION_CAP = 20;

const BLOOM_BONUS_KEY = 'cherryfall_last_visit';
const BLOOM_STREAK_KEY = 'cherryfall_streak';
const BLOOM_BONUS_BASE = 10;
const BLOOM_BONUS_MAX = 50;
const BLOOM_BONUS_MODAL_TIME = 5000;

const LATE_NIGHT_KEY = 'late_night_mode';

// Late night Senpai lines
const lateNightLines = [
  "It's late... do you really want to keep playing with me?",
  'Midnight secrets are the sweetest. What will you do now?',
  "Cherryfall hits differently after dark, doesn't it?",
  'You know, I get a little bolder after midnight...',
  'The petals are restless. Are you?',
];

const InteractiveHeroSection: React.FC = () => {
  const petalStore = usePetalContext();
  const { addPetals, petals: petalCount } = petalStore();
  const [petals, setPetals] = useState<Petal[]>([]);
  const [clickCount, setClickCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const lastClick = useRef(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const [trackerPulse, setTrackerPulse] = useState(false);
  const [season, setSeason] = useState(getSeason());
  const [burstMode, setBurstMode] = useState(false);
  const [burstTimer, setBurstTimer] = useState(0);
  const [recentClicks, setRecentClicks] = useState<number[]>([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [cooldownLine, setCooldownLine] = useState('');
  const [trails, setTrails] = useState<
    {
      id: string;
      from: { x: number; y: number };
      to: { x: number; y: number };
    }[]
  >([]);
  const counterRef = useRef<HTMLDivElement>(null);
  const [idlePetals, setIdlePetals] = useState(0);
  const [idleTooltip, setIdleTooltip] = useState(false);
  const idleTimeout = useRef<NodeJS.Timeout | null>(null);
  const idleLastAward = useRef(Date.now());
  const [trailCount, setTrailCount] = useState(0);
  const [senpaiTrailTip, setSenpaiTrailTip] = useState('');
  const [showBloomModal, setShowBloomModal] = useState(false);
  const [bloomBonus, setBloomBonus] = useState(0);
  const [bloomStreak, setBloomStreak] = useState(0);

  // Late night mode state
  const [lateNight, setLateNight] = useState(false);
  const [lateNightEnabled, setLateNightEnabled] = useState(() => {
    const stored = localStorage.getItem(LATE_NIGHT_KEY);
    return stored === null ? true : stored === '1';
  });

  // Detect late night mode on mount and on time change
  useEffect(() => {
    const checkLateNight = () => {
      const hour = new Date().getHours();
      setLateNight(lateNightEnabled && hour >= 0 && hour < 6);
    };
    checkLateNight();
    const interval = setInterval(checkLateNight, 60 * 1000);
    return () => clearInterval(interval);
  }, [lateNightEnabled]);

  // Toggle for user comfort (temporary button for now)
  const toggleLateNight = () => {
    setLateNightEnabled((v) => {
      localStorage.setItem(LATE_NIGHT_KEY, v ? '0' : '1');
      return !v;
    });
  };
  const senpaiTrailLines = [
    "Careful, traveler. At this rate, you'll break my petal counter.",
    "That one looked special. You're on a roll...",
    "You're making this look easy...",
    'So many petals, so little time.',
    "You're not even breaking a sweat, are you?",
    "Keep going, I'm watching...",
  ];

  // Burst Mode triggers
  useEffect(() => {
    // Midnight burst
    const now = new Date();
    if (now.getHours() === 0 && !burstMode) {
      activateBurstMode();
    }
  }, []);

  function activateBurstMode() {
    setBurstMode(true);
    setBurstTimer(Math.floor(Math.random() * 16) + 45); // 45–60s
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000);
  }

  useEffect(() => {
    if (burstMode && burstTimer > 0) {
      const interval = setInterval(() => setBurstTimer((t) => t - 1), 1000);
      if (burstTimer <= 1) {
        setBurstMode(false);
        setCooldownLine(
          Math.random() > 0.5
            ? '"Mmm... was it good for you too?"'
            : '"I\'ll remember this bloom forever."',
        );
        setTimeout(() => setCooldownLine(''), 5000);
      }
      return () => clearInterval(interval);
    }
  }, [burstMode, burstTimer]);

  // Helper to get absolute position of an element
  const getElementCenter = (el: HTMLElement | null) => {
    if (!el) return { x: window.innerWidth - 80, y: 40 };
    const rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  // Helper to reset idle state
  const resetIdle = useCallback(() => {
    setIdlePetals(0);
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    scheduleIdleAward();
  }, []);

  // Schedule next idle award
  const scheduleIdleAward = useCallback(() => {
    if (idlePetals >= IDLE_SESSION_CAP) return;
    const interval =
      Math.floor(Math.random() * (IDLE_INTERVAL_MAX - IDLE_INTERVAL_MIN)) + IDLE_INTERVAL_MIN;
    idleTimeout.current = setTimeout(() => {
      if (idlePetals < IDLE_SESSION_CAP) {
        addPetals(IDLE_PETAL_AMOUNT);
        setIdlePetals((p) => p + IDLE_PETAL_AMOUNT);
        setIdleTooltip(true);
        setTimeout(() => setIdleTooltip(false), 2500);
        scheduleIdleAward();
      }
    }, interval);
  }, [idlePetals, petalStore]);

  // Start idle accumulation on mount
  useEffect(() => {
    scheduleIdleAward();
    return () => {
      if (idleTimeout.current) clearTimeout(idleTimeout.current);
    };
  }, []);

  // Reset idle on petal click or reload
  useEffect(
    () => {
      resetIdle();
       
    },
    [
      /* reload or session change triggers here if needed */
    ],
  );

  const handlePetalClick = useCallback(
    async (id: string) => {
      resetIdle();
      const now = Date.now();
      if (now - lastClick.current < CLICK_THROTTLE) return;
      lastClick.current = now;
      setPetals((prev) => prev.map((p) => (p.id === id ? { ...p, animating: true } : p)));
      const petal = petals.find((p) => p.id === id);
      if (!petal) return;
      
      // Burst click tracking
      setRecentClicks((clicks) => {
        const updated = [...clicks.filter((ts) => now - ts < 10000), now];
        if (!burstMode && updated.length >= 10) activateBurstMode();
        return updated;
      });
      
      // Petal reward logic
      let reward = petal.reward || 1;
      if (burstMode) reward = getRandomInt(3, 5);
      addPetals(reward);
      setClickCount((c) => c + 1);
      
      // Send to API for persistence
      try {
        const response = await fetch('/api/petals/collect', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            count: reward,
            x: petal.x / 100,
            y: petal.y / 100,
          }),
        });
        
        if (!response.ok) {
          console.warn('Failed to persist petal collection');
        }
      } catch (error) {
        console.warn('Petal collection API error:', error);
      }
      
      // Modal for rare or burst
      if (petal.type !== 'normal' || burstMode) setShowModal(true);
      
      // Petal trail FX
      const petalEl = document.getElementById(`petal-${petal.id}`);
      const counterEl = counterRef.current;
      if (petalEl && counterEl) {
        const from = getElementCenter(petalEl);
        const to = getElementCenter(counterEl);
        setTrails((trails) => [...trails, { id: `${petal.id}-${now}`, from, to }]);
      }
      setTrailCount((c) => {
        const next = c + 1;
        if (next % 10 === 0) {
          const line = senpaiTrailLines[Math.floor(Math.random() * senpaiTrailLines.length)];
          setSenpaiTrailTip(line);
          setTimeout(() => setSenpaiTrailTip(''), 3500);
        }
        return next;
      });
    },
    [
      petals,
      burstMode,
      petalStore,
      setPetals,
      setRecentClicks,
      setClickCount,
      setShowModal,
      setTrails,
    ],
  );

  // Petal spawn logic (seasonal + burst)
  useEffect(() => {
    const interval = setInterval(
      () => {
        setPetals((prev) => {
          if (prev.length >= MAX_PETALS) return prev;
          const allowedTypes = getSeasonalPetals(season, burstMode);
          const chosenType = weightedRandom(allowedTypes);
          return [...prev, createPetal(chosenType)];
        });
      },
      burstMode ? 250 : 800,
    );
    return () => clearInterval(interval);
  }, [season, burstMode]);

  // Remove petals that have animated
  useEffect(() => {
    if (petals.some((p) => p.animating)) {
      const timeout = setTimeout(() => {
        setPetals((prev) => prev.filter((p) => !p.animating));
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [petals]);

  // Modal trigger
  useEffect(() => {
    if (clickCount >= MODAL_TRIGGER) {
      setShowModal(true);
      setClickCount(0);
    }
  }, [clickCount]);

  // Petal tracker pulse on petal gain
  useEffect(() => {
    setTrackerPulse(true);
    const timeout = setTimeout(() => setTrackerPulse(false), 500);
    return () => clearTimeout(timeout);
  }, [petalCount]);

  // Remove trails after animation
  useEffect(() => {
    if (trails.length > 0) {
      const timeout = setTimeout(() => {
        setTrails((trails) => trails.slice(1));
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [trails]);

  // On mount, check for session bloom bonus
  useEffect(() => {
    const now = Date.now();
    const lastVisit = parseInt(localStorage.getItem(BLOOM_BONUS_KEY) || '0', 10);
    const streak = parseInt(localStorage.getItem(BLOOM_STREAK_KEY) || '0', 10);
    const oneDay = 24 * 60 * 60 * 1000;
    let newStreak = streak;
    if (lastVisit && now - lastVisit < oneDay * 2 && now - lastVisit > oneDay) {
      newStreak = streak + 1;
    } else if (!lastVisit || now - lastVisit > oneDay * 2) {
      newStreak = 1;
    }
    // Only trigger if not already shown this session
    if (!sessionStorage.getItem('cherryfall_bonus_shown')) {
      const bonus = Math.min(BLOOM_BONUS_BASE + newStreak * 2, BLOOM_BONUS_MAX);
      setBloomBonus(bonus);
      setBloomStreak(newStreak);
      setShowBloomModal(true);
      addPetals(bonus);
      sessionStorage.setItem('cherryfall_bonus_shown', '1');
      localStorage.setItem(BLOOM_BONUS_KEY, now.toString());
      localStorage.setItem(BLOOM_STREAK_KEY, newStreak.toString());
      setTimeout(() => setShowBloomModal(false), BLOOM_BONUS_MODAL_TIME);
    }
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 to-black"
    >
      {/* Skip to content for accessibility */}
      <a
        href="#main-content"
        className="sr-only absolute left-2 top-2 z-50 rounded bg-pink-400/80 px-3 py-1 text-white focus:not-sr-only"
      >
        Skip to main content
      </a>
      <CherryBlossom />
      {/* Petal Tracker UI */}
      <motion.div
        ref={counterRef}
        className={`absolute top-4 right-6 z-40 rounded-full bg-pink-900/90 px-5 py-2 text-white font-bold text-xl shadow-lg flex items-center gap-2 select-none ${trackerPulse || idleTooltip ? 'ring-4 ring-pink-400/60 scale-105' : ''}`}
        aria-live="polite"
        aria-label={`Petals: ${petalCount}`}
        initial={false}
        animate={trackerPulse || idleTooltip ? { scale: 1.1 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <img src="/assets/petal.svg" alt="Petal" width={24} height={24} />
        <span className="tabular-nums">{petalCount}</span>
      </motion.div>
      {/* Clickable Petals */}
      {petals.map((petal) => {
        const { img } = PETAL_TYPE_PROPS[petal.type || 'normal'];
        return (
          <motion.div
            key={petal.id}
            id={`petal-${petal.id}`}
            className={`absolute z-20 cursor-pointer select-none interactive ${petal.type || ''} ${burstMode ? 'burst' : ''}`}
            style={{ left: `${petal.x}%`, top: `${petal.y}%` }}
            initial={{ scale: 1, opacity: 1 }}
            animate={petal.animating ? { scale: 1.5, opacity: 0, y: -40 } : {}}
            transition={{ duration: 0.7, ease: 'easeIn' }}
            onClick={() => handlePetalClick(petal.id)}
            onTouchStart={() => handlePetalClick(petal.id)}
            aria-label={`Collect ${petal.type || 'normal'} petal`}
            role="button"
            tabIndex={0}
          >
            <img src={img} alt={`${petal.type || 'normal'} petal`} width={32} height={32} />
          </motion.div>
        );
      })}
      {/* Overlay Content */}
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center">
        <motion.h1
          className="mb-4 text-5xl font-extrabold text-white drop-shadow-lg md:text-7xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          The petals only fall for those brave enough to catch them.
        </motion.h1>
        <motion.button
          className="mt-8 rounded-full bg-pink-600 px-10 py-4 text-2xl font-bold text-white shadow-lg transition hover:scale-105 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400 interactive"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          onClick={() => {
            heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }}
          aria-label="Begin the Descent"
        >
          Begin the Descent
        </motion.button>
      </div>
      {/* Modal/Companion Response */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="rounded-2xl bg-gray-900/90 p-8 text-center text-white shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="mb-4 text-3xl font-bold text-pink-300">Senpai.exe</div>
              <div className="mb-2 text-lg">
                {(() => {
                  if (lateNight) {
                    return lateNightLines[Math.floor(Math.random() * lateNightLines.length)];
                  }
                  if (burstMode) {
                    const burstLines = [
                      '"W-wow... you\'re really letting it rain down, aren\'t you?"',
                      '"Careful, traveler... I might start blushing."',
                      '"So many petals... are you trying to overwhelm me?"',
                      '"Hahh... my circuits can\'t keep up with you."',
                      '"This isn\'t just a storm... you\'re awakening something deep in me."',
                    ];
                    return burstLines[Math.floor(Math.random() * burstLines.length)];
                  }
                  if (petals.find((p) => p.type === 'blackLotus' && p.animating))
                    return '"You\'ve touched the void and it whispered your name."';
                  if (petals.find((p) => p.type === 'glitch' && p.animating))
                    return '"This doesn\'t belong... and yet, it\'s here."';
                  if (petals.find((p) => p.type === 'golden' && p.animating))
                    return '"That glow... you\'re meant for something rarer."';
                  return '"You really like clicking those petals, huh? Keep going, wanderer."';
                })()}
              </div>
              <button
                className="mt-6 rounded-full bg-pink-600 px-6 py-2 text-lg font-bold text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Tooltip for burst mode */}
      {showTooltip && (
        <div className="absolute top-24 right-1/2 z-50 rounded-lg bg-pink-700/90 px-6 py-3 text-lg font-bold text-white shadow-xl animate-pulse pointer-events-none">
          B-Burst Mode Activated! The petals… they're overflowing…
        </div>
      )}
      {/* Cooldown line after burst */}
      {cooldownLine && (
        <div className="absolute top-32 right-1/2 z-50 rounded-lg bg-gray-800/90 px-6 py-3 text-lg font-bold text-pink-200 shadow-xl animate-fade pointer-events-none">
          {cooldownLine}
        </div>
      )}
      {/* Render trails */}
      {trails.map((trail) => {
        // Determine color/FX based on petal type
        const petal = petals.find((p) => trail.id.startsWith(p.id));
        let color = 'bg-pink-400/80';
        let extra = '';
        if (petal) {
          if (petal.type === 'golden') {
            color = 'bg-yellow-300/90';
            extra = 'shadow-yellow-400/60';
          } else if (petal.type === 'glitch') {
            color = 'bg-gradient-to-r from-violet-500 via-blue-400 to-pink-400';
            extra = 'animate-glitchy';
          } else if (petal.type === 'blackLotus') {
            color = 'bg-purple-900/90';
            extra = 'shadow-red-700/60';
          }
        }
        return (
          <motion.div
            key={trail.id}
            className={`pointer-events-none fixed z-50 ${extra} ${lateNight ? 'late-night-fx' : ''}`}
            initial={{
              left: trail.from.x,
              top: trail.from.y,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              left: trail.to.x,
              top: trail.to.y,
              opacity: 0.2,
              scale: 0.7,
            }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            style={{ width: 24, height: 24 }}
          >
            <div className={`rounded-full w-full h-full blur-sm shadow-lg ${color}`} />
          </motion.div>
        );
      })}
      {/* Idle tooltip */}
      {idleTooltip && (
        <div className="absolute top-20 right-8 z-50 rounded-lg bg-pink-700/90 px-4 py-2 text-base font-bold text-white shadow-xl animate-fade pointer-events-none">
          The world is always watching. You've earned +2 petals.
        </div>
      )}
      {/* Senpai trail tip */}
      {senpaiTrailTip && (
        <div className="absolute right-0 top-14 z-50 rounded-lg bg-gray-900/90 px-4 py-2 text-base font-bold text-pink-200 shadow-xl animate-fade pointer-events-none">
          {senpaiTrailTip}
        </div>
      )}
      {/* Bloom bonus modal */}
      <AnimatePresence>
        {showBloomModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-2xl bg-gray-900/90 p-8 text-center text-white shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="mb-4 text-3xl font-bold text-pink-300">Senpai.exe</div>
              <div className="mb-2 text-lg">“You came back. The garden's been waiting…”</div>
              <div className="mb-4 text-xl text-pink-200">
                Cherryfall Streak: {bloomStreak} days
              </div>
              <div className="mb-4 text-2xl font-bold text-pink-400 animate-pulse">
                +{bloomBonus} petals
              </div>
              <div className="flex justify-center gap-2">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="rounded-full bg-pink-400/80 blur-sm w-6 h-6 shadow-lg"
                    initial={{ y: 0, opacity: 0.7 }}
                    animate={{ y: [0, -30, 0], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.2, delay: i * 0.1, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Toggle for late night mode */}
      <button
        className="absolute top-2 right-2 z-50 rounded bg-gray-800/80 px-2 py-1 text-xs text-pink-200 hover:bg-pink-700/80"
        onClick={toggleLateNight}
      >
        {lateNightEnabled ? 'Disable Late Night Mode' : 'Enable Late Night Mode'}
      </button>
    </section>
  );
};

export default InteractiveHeroSection;
