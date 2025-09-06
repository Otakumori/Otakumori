'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  const [showPopup, setShowPopup] = useState(true);

  // auto-close after a short moment if you want
  useEffect(() => {
    const t = setTimeout(() => setShowPopup(false), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="relative min-h-screen bg-[#080611] text-zinc-100">
      {/* background can reuse your starfield if desired */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(1200px_circle_at_50%_35%,#1a0f2a,#120b1f_40%,#080611_100%)]" />

      {/* Pre-popup */}
      {showPopup && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[0_0_60px_-15px_rgba(200,120,255,0.25)]">
            <div className="relative h-56 w-56 overflow-hidden rounded-xl">
              <Image
                src="/assets/images/download.jpg" // your "cute guy" image
                alt="Surprised traveler"
                fill
                sizes="224px"
                className="object-cover"
                priority
              />
            </div>
            <p className="mt-3 text-center text-sm text-zinc-200/90">
              You wandered off the path.
            </p>
            <div className="mt-3 flex justify-center gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10"
              >
                Continue
              </button>
              <Link
                href="/games/404"
                className="rounded-xl bg-fuchsia-500/90 px-3 py-1.5 text-sm text-white hover:bg-fuchsia-500"
              >
                Start 404 Game
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 404 body (when popup hides) */}
      {!showPopup && (
        <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h1 className="text-3xl font-bold md:text-5xl">Lost in the Abyss</h1>
          <p className="mt-3 text-zinc-300/90">
            The page you're seeking isn't here.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              Return Home
            </Link>
            <Link href="/games/404" className="rounded-xl bg-fuchsia-500/90 px-4 py-2 text-sm text-white hover:bg-fuchsia-500">
              Start 404 Game
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}