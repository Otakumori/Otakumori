/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useEffect, useMemo, useState } from 'react';
import { useQuests } from '@/app/hooks/useQuests';

type CartItem = {
  id: string;
  name: string;
  priceCents: number;
  qty: number;
  imageId?: string;
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  traits?: string[];
  flavor?: string;
  tags?: string[];
};

const LABELS = {
  stages: [
    'Bottomless Bag',
    'Examine Your Haul',
    'Just a few of your simoleons…',
    'Confirm Your Arsenal',
  ],
  shipping: 'Delivery Coordinates',
  billing: 'Coin Source',
  coupon: 'Use Item?',
  confirm: 'Confirm Your Arsenal',
  gacha: 'Lucky Draw',
  recsTitle: 'Recommended Quests',
  bundlesTitle: 'Companion Items',
};

const THANKS = [
  'Your purchase has strengthened your arsenal! Prepare for your next adventure!',
  'New relics acquired. The journey grows brighter.',
  'You gained +1 Style, +2 Vibe, +∞ Drip.',
];

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n / 100);

// stub items—replace with your cart state
const initial: CartItem[] = [
  {
    id: 'btn-psx-neon-start',
    name: 'Neon Start Button (PSX)',
    priceCents: 1200,
    qty: 1,
    imageId: 'minigame.arcade.neon.start',
    rarity: 'Rare',
    traits: ['PS1-lofi', 'Neon'],
    flavor: 'A switch forged in arcade glow.',
  },
  {
    id: 'hud-runes-ember',
    name: 'Ember Rune HUD Set',
    priceCents: 1800,
    qty: 1,
    imageId: 'hud.soulslike.runes.fire',
    rarity: 'Epic',
    traits: ['Runic', 'High-contrast'],
    flavor: 'Glyphs smoldering with ancient promise.',
  },
];

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [cart, setCart] = useState<CartItem[]>(initial);
  const [coupon, setCoupon] = useState<string>('');
  const [couponPct, setCouponPct] = useState(0);
  const [thanks, setThanks] = useState(THANKS[0]);
  const { trackQuest } = useQuests();

  const sub = useMemo(() => cart.reduce((s, i) => s + i.priceCents * i.qty, 0), [cart]);
  const discount = Math.round(sub * couponPct);
  const total = Math.max(0, sub - discount);

  useEffect(() => {
    setThanks(THANKS[Math.floor(Math.random() * THANKS.length)]);

    // Track checkout visit for quests
    if (step === 0) {
      trackQuest('visit-checkout');
    }
  }, [step, trackQuest]);

  async function luckyDraw() {
    // Track gacha roll for quests
    await trackQuest('gacha-roll');

    const r = await fetch('/api/gacha', { method: 'POST' });
    if (!r.ok) return;
    const data = await r.json();
    if (data.type === 'coupon') setCouponPct(data.amount || 0);
    if (data.type === 'item' && data.item) setCart(prev => [...prev, data.item]);
  }

  async function createSession() {
    const r = await fetch('/api/checkout/session', {
      method: 'POST',
      body: JSON.stringify({ cart, coupon }),
    });
    const { url } = await r.json();
    if (url) window.location.href = url;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold text-slatey-200">Checkout Quest</h1>
        <p className="text-slatey-400">Traverse the path. Claim your loot.</p>
      </header>

      <XPBar stages={LABELS.stages} current={step} />

      {/* Stage 1: Cart */}
      {step === 0 && (
        <section className="grid gap-4">
          {cart.map(it => (
            <article
              key={it.id}
              className="grid grid-cols-[96px_1fr_auto] gap-3 rounded-2xl border border-slate-700 bg-cube-900/90 p-3 shadow-glow"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-cube-800 bg-cube-900">
                <AssetImage id={it.imageId} alt={it.name} />
              </div>
              <div>
                <h3 className="font-medium text-slatey-200">{it.name}</h3>
                <p className="mt-1 text-xs italic text-slatey-400">"{it.flavor}"</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(it.traits || []).map(t => (
                    <span
                      key={t}
                      className="rounded-full border border-slate-700 bg-cube-900 px-2 py-0.5 text-[11px] text-slatey-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid justify-items-end gap-2">
                <div className="font-semibold">{fmt(it.priceCents * it.qty)}</div>
                <div className="flex items-center gap-2">
                  <button
                    className="btn"
                    onClick={() =>
                      setCart(prev =>
                        prev.map(p => (p.id === it.id ? { ...p, qty: Math.max(1, p.qty - 1) } : p))
                      )
                    }
                  >
                    -
                  </button>
                  <span aria-live="polite">{it.qty}</span>
                  <button
                    className="btn"
                    onClick={() =>
                      setCart(prev =>
                        prev.map(p => (p.id === it.id ? { ...p, qty: p.qty + 1 } : p))
                      )
                    }
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn"
                  onClick={() => setCart(prev => prev.filter(p => p.id !== it.id))}
                >
                  Drop
                </button>
              </div>
            </article>
          ))}
          <div className="rounded-2xl border border-slate-700 bg-cube-900 p-4">
            <div className="flex items-center justify-between">
              <strong className="text-slatey-200">Bag Value</strong>
              <span>{fmt(sub)}</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="btn-primary" onClick={luckyDraw}>
                🎰 Lucky Draw
              </button>
              <span className="text-xs text-slatey-400">Roll for a voucher or Bonus Loot.</span>
            </div>
            <div className="mt-3 flex items-center justify-end">
              <button className="btn-primary" onClick={() => setStep(1)}>
                Proceed → Examine Your Haul
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Stage 2: Review + Recs */}
      {step === 1 && (
        <section className="grid gap-4">
          <div className="rounded-2xl border border-slate-700 bg-cube-900 p-4">
            <h2 className="mb-2 text-lg text-slatey-200">Examine Your Haul</h2>
            <ul className="divide-y divide-slate-800">
              {cart.map(it => (
                <li key={it.id} className="flex items-center justify-between py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 overflow-hidden rounded border border-cube-800 bg-cube-900">
                      <AssetImage id={it.imageId} alt={it.name} />
                    </div>
                    <div>
                      {it.name} <span className="text-slatey-400">× {it.qty}</span>
                    </div>
                  </div>
                  <div className="font-medium">{fmt(it.priceCents * it.qty)}</div>
                </li>
              ))}
            </ul>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <strong>{fmt(sub)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <strong className={couponPct ? 'text-green-400' : 'text-slatey-400'}>
                  {couponPct ? `−${fmt(discount)} (${Math.round(couponPct * 100)}%)` : '—'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Total</span>
                <strong>{fmt(total)}</strong>
              </div>
            </div>
          </div>

          <Recommended onAdd={item => setCart(prev => [...prev, item])} />

          <div className="flex justify-between">
            <button className="btn" onClick={() => setStep(0)}>
              ← Back
            </button>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Proceed → Coin Source
            </button>
          </div>
        </section>
      )}

      {/* Stage 3: Payment */}
      {step === 2 && (
        <section className="grid gap-4">
          <div className="rounded-2xl border border-slate-700 bg-cube-900 p-4">
            <h2 className="mb-2 text-lg text-slatey-200">{LABELS.shipping}</h2>
            <div className="grid gap-2">
              <input className="input" placeholder="Hero Alias" />
              <input className="input" placeholder="Realm (City, Region)" />
              <input className="input" placeholder="Delivery Coordinates (Address)" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-cube-900 p-4">
            <h2 className="mb-2 text-lg text-slatey-200">{LABELS.billing}</h2>
            <div className="grid gap-2">
              <input className="input" placeholder="Coin Source (Name on Card)" />
              <div className="grid grid-cols-3 gap-2">
                <input className="input" placeholder="Card Number" />
                <input className="input" placeholder="MM/YY" />
                <input className="input" placeholder="CVC" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-cube-900 p-4">
            <h2 className="mb-2 text-lg text-slatey-200">{LABELS.coupon}</h2>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                placeholder="use-potion / limit-break / god-roll"
              />
              <button
                className="btn"
                onClick={() =>
                  setCouponPct(
                    coupon === 'limit-break'
                      ? 0.12
                      : coupon === 'god-roll'
                        ? 0.2
                        : coupon === 'use-potion'
                          ? 0.05
                          : 0
                  )
                }
              >
                Apply
              </button>
            </div>
          </div>

          <div className="flex justify-between">
            <button className="btn" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              {LABELS.confirm}
            </button>
          </div>
        </section>
      )}

      {/* Stage 4: Confirm → Stripe */}
      {step === 3 && (
        <section className="rounded-2xl border border-slate-700 bg-cube-900 p-6">
          <h2 className="mb-2 text-lg text-slatey-200">{LABELS.confirm}</h2>
          <p className="text-slatey-400">
            Final checkpoint. Once you confirm, your caravan departs.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <strong>Total Tribute</strong>
            <span className="text-lg font-semibold">{fmt(total)}</span>
          </div>
          <div className="mt-4 flex justify-between">
            <button className="btn" onClick={() => setStep(2)}>
              ← Back
            </button>
            <button className="btn-primary" onClick={createSession}>
              Seal the Pact
            </button>
          </div>
          <p className="mt-6 text-slatey-200">✨ {thanks}</p>
        </section>
      )}

      <style jsx>{`
        .btn {
          @apply rounded-xl border border-slate-700 bg-cube-900 px-3 py-2 text-slatey-200;
        }
        .btn-primary {
          @apply rounded-xl border border-pink-400 bg-sakura-500/20 px-3 py-2 text-slatey-200 shadow-glow hover:bg-sakura-500/30;
        }
        .input {
          @apply rounded-xl border border-slate-700 bg-cube-900 px-3 py-2 text-slatey-200;
        }
      `}</style>
    </main>
  );
}

function XPBar({ stages, current }: { stages: string[]; current: number }) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-3">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className={`h-3 w-3 rounded-full border ${i <= current ? 'border-sakura-500 bg-sakura-500 shadow-glow' : 'border-slate-700 bg-cube-800'}`}
          />
          <span className={`text-xs ${i <= current ? 'text-slatey-200' : 'text-slatey-400'}`}>
            {s}
          </span>
          {i < stages.length - 1 && (
            <span className="mx-1 h-px w-12 bg-gradient-to-r from-cube-800 to-slate-700" />
          )}
        </div>
      ))}
    </div>
  );
}

function AssetImage({ id, alt }: { id?: string; alt: string }) {
  // Simplified to avoid dynamic import complexity
  return (
    <span aria-hidden className="text-2xl">
      🧿
    </span>
  );
}

function Recommended({ onAdd }: { onAdd: (i: CartItem) => void }) {
  const items: CartItem[] = [
    {
      id: 'icons-kawaii-pack',
      name: 'Kawaii Icon Bundle',
      priceCents: 900,
      qty: 1,
      imageId: 'hud.kawaii.icons.rank',
      flavor: 'Tiny sigils bursting with charm.',
      traits: ['Kawaii', 'Pixel'],
    },
    {
      id: 'tex-psx-frames-soft',
      name: 'Soft PSX Frame Atlas',
      priceCents: 1400,
      qty: 1,
      imageId: 'tex.psx.frames.soft.ui-atlas',
      flavor: 'Frames that whisper "retro".',
      traits: ['PS1-lofi', 'Dithered'],
    },
  ];
  return (
    <div className="rounded-2xl border border-slate-700 bg-cube-900 p-4">
      <h2 className="mb-2 text-lg text-slatey-200">Recommended Quests & Companion Items</h2>
      <div className="grid gap-3">
        {items.map(it => (
          <article
            key={it.id}
            className="grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-xl border border-slate-700 bg-cube-900 p-3"
          >
            <div className="h-12 w-12 overflow-hidden rounded border border-cube-800 bg-cube-900">
              <AssetImage id={it.imageId} alt={it.name} />
            </div>
            <div>
              <div className="text-slatey-200">{it.name}</div>
              <div className="text-xs text-slatey-400">"{it.flavor}"</div>
            </div>
            <div className="grid justify-items-end gap-1">
              <div className="font-medium">{fmt(it.priceCents)}</div>
              <button className="btn" onClick={() => onAdd(it)}>
                Accept Quest
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
