"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SoapstoneMessage from "./community/SoapstoneMessage";
import SoapstoneFooterMini from "./soapstone/SoapstoneFooterMini";

/** A tiny on-brand footer with:
 *  - Brand + mini-nav
 *  - Soapstone CTA (modal)
 *  - Daily Rune teaser (rotates per-day, deterministic, no placeholders)
 *  - Mini-game quick links
 *  - Printify status ping (no spinner; quietly disappears if offline)
 */
export default function Footer() {
  // --- Daily Rune (deterministic by date, no external calls)
  const rune = useDailyRune();

  // --- Printify status ping (kept very quiet; no UI if not ok)
  const [printifyOK, setPrintifyOK] = useState<boolean | null>(null);
  useEffect(() => {
    let gone = false;
    // Head request would be ideal; Next/API default rejects HEAD here, so use GET but no heavy UI either way.
    fetch("/api/printify/products", { method: "GET", cache: "no-store" })
      .then((r) => (!gone ? setPrintifyOK(r.ok) : void 0))
      .catch(() => !gone && setPrintifyOK(false));
    return () => {
      gone = true;
    };
  }, []);

  return (
    <footer className="relative z-20 w-full border-t border-white/10 bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Top: brand + nav + actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: brand & mini nav */}
          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold tracking-wide text-zinc-200">
              Otaku-mori
            </div>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400">
              <SmartLink href="/shop">Shop</SmartLink>
              <SmartLink href="/blog">Blog</SmartLink>
              <SmartLink href="/games">Mini-Games</SmartLink>
              <SmartLink href="/community">Community</SmartLink>
              <SmartLink href="/about">About</SmartLink>
            </nav>
          </div>

          {/* Right: Soapstone + mini games quickies */}
          <div className="flex items-center gap-3">
            {/* Subtle mini-game quick links (small chips) */}
            <div className="hidden sm:flex items-center gap-2">
              <Chip href="/games/petal-collection" label="Petal Run" />
              <Chip href="/games/memory-match" label="Memory" />
              <Chip href="/games/rhythm-beat" label="Rhythm" />
            </div>

            {/* Soapstone CTA */}
            <SoapstoneMessage
              preview="A soft whisper in the grove…"
              full="Welcome home, Traveler. Leave a note, earn runes, share a smile."
            />
          </div>
        </div>

        {/* Divider */}
        <div className="my-4 h-px w-full bg-white/10" />

        {/* Bottom: legal + daily rune + status */}
        <div className="flex flex-col-reverse items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <p className="text-xs text-zinc-400">
              © {new Date().getFullYear()} Otaku-mori. Made with ♥
            </p>
            <SoapstoneFooterMini />
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            {/* Daily Rune (fun teaser) */}
            <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-2 py-0.5 text-[11px] text-fuchsia-200">
              Today's Rune: <strong className="ml-1 text-fuchsia-300">{rune.label}</strong>
            </span>

            {/* Printify reachability (only show when OK to avoid noise) */}
            {printifyOK ? (
              <span
                className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300"
                title="Shop backend healthy"
              >
                <Dot ok /> Shop link
              </span>
            ) : null}

            {/* Legal / support */}
            <SmartLink href="/terms">Terms</SmartLink>
            <SmartLink href="/privacy">Privacy</SmartLink>
            <SmartLink href="/contact">Contact</SmartLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SmartLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      className="relative transition hover:text-zinc-200 after:absolute after:left-0 after:-bottom-1 after:h-[1.5px] after:w-0 after:bg-fuchsia-400 after:transition-[width] hover:after:w-full"
      href={href}
      prefetch
    >
      {children}
    </Link>
  );
}

function Chip({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300 shadow-sm transition hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10 hover:text-fuchsia-200"
      prefetch
    >
      {label}
    </Link>
  );
}

function Dot({ ok }: { ok?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-1.5 w-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-zinc-500"}`}
    />
  );
}

function useDailyRune() {
  const runes = useMemo(
    () =>
      [
        { key: "🌸", label: "Bloom" },
        { key: "🌑", label: "Abyss" },
        { key: "🗡️", label: "Valor" },
        { key: "🌀", label: "Drift" },
        { key: "🔥", label: "Ember" },
        { key: "💫", label: "Starlight" },
        { key: "🌿", label: "Verdant" },
      ] as const,
    []
  );
  const d = new Date();
  const idx = ((d.getFullYear() * 1000 + (d.getMonth() + 1) * 50 + d.getDate()) % runes.length + runes.length) % runes.length;
  return runes[idx];
}