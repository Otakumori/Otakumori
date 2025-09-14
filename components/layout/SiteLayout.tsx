'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FriendsButton from '@/app/components/FriendsButton';
import NotificationBell from '@/app/components/NotificationBell';
import CharacterReaction from '@/app/components/CharacterReaction';

// ---- Experience flags (could be fed by proxy) ----
const experience = {
  season: 'spring',
  motd: 'Cherry blossoms drift across the abyss. Limited pin perk today only.',
  perk: { name: 'Sakura Drop', desc: '5% off Pins — Pin‑thusiast Center', ends: 'Tonight' },
  petalsIntensity: 0.7,
  dsTip: "Visions of deal… try exploring 'Pins'.",
  eventCTA: {
    title: 'Enter AI Overlord Mode',
    subtitle: 'A playful, lore‑tied control room. Completionists welcome.',
  },
};

function classNames(...xs: (string | undefined | false | null)[]): string {
  return xs.filter(Boolean).join(' ');
}

// ---- Petals overlay ----
function Petals({
  intensity = 0.5,
  gameMode = false,
  onCollect,
}: {
  intensity?: number;
  gameMode?: boolean;
  onCollect?: () => void;
}) {
  const count = Math.round(10 + intensity * 30);
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 7,
        delay: Math.random() * 4,
        duration: 9 + Math.random() * 12,
        drift: -30 + Math.random() * 60,
        rotate: -25 + Math.random() * 50,
      })),
    [count],
  );

  const PetalTag = gameMode ? motion.button : motion.span;

  return (
    <div className="fixed inset-0 overflow-hidden z-20" aria-hidden={!gameMode ? true : undefined}>
      {petals.map((p) => (
        <PetalTag
          key={p.id}
          initial={{ y: -40, x: p.left + '%', rotate: 0 }}
          animate={{ y: '110vh', x: `calc(${p.left}vw + ${p.drift}px)`, rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
          className={classNames('absolute', gameMode && 'cursor-pointer')}
          aria-label={gameMode ? 'petal' : undefined}
          onClick={
            gameMode
              ? (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCollect?.();
                }
              : undefined
          }
          style={{
            width: p.size,
            height: p.size * 0.9,
            backgroundImage:
              'radial-gradient(circle at 35% 35%, rgba(255,192,203,0.95), rgba(255,192,203,0.25))',
            borderRadius: '60% 60% 60% 0 / 60% 60% 60% 0',
            boxShadow: '0 0 8px rgba(255,182,193,0.35)',
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
}

// ---- Login modal ----
function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="mx-4 w-full max-w-md rounded-3xl bg-neutral-900/95 border border-pink-400/40 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-pink-200">Message Received, Commander!</h3>
            <p className="mt-2 text-neutral-300">Log in to sync perks, petals, and progress.</p>
            <div className="mt-4 grid gap-3">
              <input
                placeholder="Email"
                className="rounded-xl bg-neutral-800/80 p-3 outline-none ring-1 ring-neutral-700 focus:ring-pink-400"
                name="email"
                type="email"
                aria-label="Email"
              />
              <input
                placeholder="Password"
                type="password"
                className="rounded-xl bg-neutral-800/80 p-3 outline-none ring-1 ring-neutral-700 focus:ring-pink-400"
                name="password"
                aria-label="Password"
              />
              <button className="rounded-2xl p-3 font-medium bg-pink-500/90 hover:bg-pink-500 text-white transition">
                Log In
              </button>
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              By continuing, you accept seasonal shenanigans and randomized perks.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SiteLayout({
  children,
  showPetals = true,
}: {
  children: React.ReactNode;
  showPetals?: boolean;
}) {
  const [showLogin, setShowLogin] = useState(false);
  const [collected, setCollected] = useState(0);

  const seasonBg = {
    spring: 'from-neutral-950 via-neutral-950 to-neutral-900',
    summer: 'from-neutral-950 via-neutral-900 to-neutral-800',
    spooky: 'from-neutral-950 via-black to-neutral-900',
    holiday: 'from-neutral-950 via-neutral-900 to-neutral-950',
  }[experience.season];

  return (
    <div className={classNames('min-h-screen text-neutral-100', 'bg-gradient-to-b', seasonBg)}>
      {/* Petals decorative */}
      {showPetals && (
        <Petals
          intensity={experience.petalsIntensity}
          onCollect={() => setCollected((c) => c + 1)}
        />
      )}

      {/* MOTD */}
      <div className="sticky top-0 z-30 w-full bg-neutral-900/70 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-2 text-center text-xs text-neutral-300">
          {experience.motd}
          {experience.perk && (
            <span className="ml-2 rounded-full border border-pink-400/40 bg-pink-500/10 px-2 py-[2px] text-pink-200">
              {experience.perk.name}
            </span>
          )}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-20">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-pink-500/90 grid place-items-center shadow-lg select-none">
              <span role="img" aria-label="Crossed swords">⚔️</span>
            </div>
            <a href="/" className="text-lg font-semibold tracking-wide hover:text-pink-200">
              Otakumori
            </a>
          </div>

          {/* Nav */}
          <nav className="ml-6 hidden md:flex gap-4 text-sm text-neutral-300">
            <div className="relative group">
              <a className="hover:text-pink-200 inline-flex items-center gap-1" href="/shop">
                Shop
              </a>
              <div className="absolute left-0 mt-2 hidden group-hover:block bg-neutral-900/95 border border-white/10 rounded-2xl shadow-lg p-2 min-w-[200px]">
                <a
                  href="/shop?category=pins"
                  className="block px-3 py-2 rounded-xl text-neutral-300 hover:bg-pink-500/10 hover:text-pink-200"
                >
                  Pins
                </a>
                <a
                  href="/shop?category=kicks"
                  className="block px-3 py-2 rounded-xl text-neutral-300 hover:bg-pink-500/10 hover:text-pink-200"
                >
                  Kicks
                </a>
                <a
                  href="/shop?category=bottoms"
                  className="block px-3 py-2 rounded-xl text-neutral-300 hover:bg-pink-500/10 hover:text-pink-200"
                >
                  Bottoms
                </a>
                <a
                  href="/shop?category=unmentionables"
                  className="block px-3 py-2 rounded-xl text-neutral-300 hover:bg-pink-500/10 hover:text-pink-200"
                >
                  Unmentionables
                </a>
              </div>
            </div>
            <a className="hover:text-pink-200" href="/blog">
              Blog
            </a>
            <a className="hover:text-pink-200" href="/mini-games">
              Mini-Games
            </a>
            <a className="hover:text-pink-200" href="/about">
              About me
            </a>
            <a className="hover:text-pink-200" href="/settings">
              Settings
            </a>
          </nav>

          {/* Search + Auth + Cart */}
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/search"
              className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-sm text-neutral-300 hover:border-pink-400/50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span>Search</span>
            </a>

            {/* Friends Button */}
            <FriendsButton />

            {/* Notification Bell */}
            <NotificationBell />

            <div className="relative group">
              <button
                onClick={() => setShowLogin(true)}
                className="rounded-2xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-sm hover:border-pink-400/50"
              >
                Log in
              </button>
            </div>

            <a
              href="/cart"
              className="relative rounded-2xl border border-white/10 bg-neutral-900/70 px-3 py-2 text-sm hover:border-pink-400/50"
            >
              Cart
              {collected > 0 && (
                <span className="ml-2 rounded-full bg-pink-500/80 px-2 py-[2px] text-[10px] text-white">
                  +{collected} petals
                </span>
              )}
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20">{children}</main>

      {/* Footer */}
      <footer className="relative z-20 border-t border-white/10 bg-neutral-950/70">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-10 grid md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-pink-500/90 grid place-items-center"><span role="img" aria-label="Crossed swords">⚔️</span></div>
              <span className="font-semibold">Otakumori</span>
            </div>
            <p className="mt-3 text-neutral-400 text-sm max-w-xs">
              Dark‑cute commerce. Minimal on fabric, maximal in lore. Built for fans, by a fan.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-200">Explore</h4>
            <ul className="mt-2 text-sm text-neutral-400 space-y-1">
              <li>
                <a className="hover:text-pink-200" href="/shop?category=pins">
                  Pins
                </a>
              </li>
              <li>
                <a className="hover:text-pink-200" href="/shop?category=kicks">
                  Kicks
                </a>
              </li>
              <li>
                <a className="hover:text-pink-200" href="/shop?category=unmentionables">
                  Unmentionables
                </a>
              </li>
              <li>
                <a className="hover:text-pink-200" href="/about">
                  Otakumori Insiders
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-neutral-200">Stay in the loop</h4>
            <div className="mt-2 flex gap-2">
              <input
                placeholder="Email"
                className="w-full rounded-xl bg-neutral-900/80 p-3 text-sm outline-none ring-1 ring-neutral-700 focus:ring-pink-400"
                name="newsletterEmail"
                type="email"
                aria-label="Email"
              />
              <button className="rounded-xl bg-pink-500/90 hover:bg-pink-500 px-4 text-sm">
                Join
              </button>
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              We send low‑volume, high‑signal drops only.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} Otakumori
        </div>
      </footer>

      {/* Overlays */}
      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />

      {/* Character Reactions */}
      <CharacterReaction />
    </div>
  );
}
