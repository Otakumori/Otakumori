'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import GlassPanel from '../GlassPanel';
import { t } from '@/lib/microcopy';
import { useCart } from '@/app/components/cart/CartProvider';
import { PetalBalanceDisplay } from './PetalBalanceDisplay';
import { EmptyCart } from '@/app/components/empty-states';

export default function CartContent() {
  const { items, updateQuantity, removeItem } = useCart();
  const isUpdating = false;
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const baseShipping = subtotal > 50 ? 0 : 9.99; // legacy heuristic
  const [couponInput, setCouponInput] = useState('');
  const [codes, setCodes] = useState<string[]>([]);
  const [preview, setPreview] = useState<{
    discountTotal?: number;
    shippingDiscount?: number;
    codesApplied?: { code: string; type: string; amount: number }[];
    messages?: string[];
  } | null>(null);
  const [busyPreview, setBusyPreview] = useState(false);

  // Compute shipping after FREESHIP
  const shipping = useMemo(() => {
    const d = preview?.shippingDiscount ?? 0;
    const fee = baseShipping;
    if (d >= fee && fee > 0) return 0;
    return fee;
  }, [preview, baseShipping]);
  const discount = preview?.discountTotal ?? 0;
  const tax = subtotal * 0.08; // display only; Stripe computes real tax
  const total = Math.max(0, subtotal - discount) + tax + shipping;

  // Debounced preview
  useEffect(() => {
    let cancelled = false;
    const fn = async () => {
      if (codes.length === 0) {
        setPreview(null);
        return;
      }
      setBusyPreview(true);
      try {
        const res = await fetch('/api/coupons/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            codes,
            cart: {
              items: items.map((i) => ({
                id: i.id,
                productId: i.id,
                collectionIds: [],
                quantity: i.quantity,
                unitPrice: i.price,
              })),
              shipping: { provider: 'stripe', fee: baseShipping },
            },
          }),
        });
        const j = await res.json();
        if (!cancelled && j?.ok) setPreview(j.data);
      } catch {
        if (!cancelled) setPreview(null);
      } finally {
        if (!cancelled) setBusyPreview(false);
      }
    };
    const t = setTimeout(fn, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [codes, items, baseShipping]);

  const addCode = () => {
    const c = couponInput.trim().toUpperCase();
    if (!c) return;
    if (!/^[A-Z0-9\-]+$/.test(c)) return;
    if (codes.includes(c)) return;
    setCodes((prev) => [...prev, c]);
    setCouponInput('');
  };
  const removeCode = (c: string) => setCodes((prev) => prev.filter((x) => x !== c));

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
    <EmptyCart />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <PetalBalanceDisplay />
        {items.map((item) => (
          <GlassPanel key={item.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-white truncate">{item.name}</h3>
                {item.selectedVariant?.title && (
                  <p className="text-sm text-zinc-400">{item.selectedVariant.title}</p>
                )}
                <p className="text-fuchsia-300 font-semibold">${item.price}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-8 text-center text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={isUpdating}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                disabled={isUpdating}
                className="rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Remove
              </button>
            </div>
          </GlassPanel>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <GlassPanel className="p-6 sticky top-8">
          <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>

          <div className="space-y-3">
            <div className="flex justify-between text-zinc-300">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {/* Coupons */}
            <div className="mt-2">
              <label htmlFor="couponCode" className="block text-sm text-zinc-300 mb-1">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  id="couponCode"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none"
                  aria-label="Coupon code"
                />
                <button
                  onClick={addCode}
                  className="rounded-xl bg-fuchsia-500/90 px-3 py-2 text-white hover:bg-fuchsia-500"
                  aria-label="Apply coupon"
                >
                  Apply
                </button>
              </div>
              {codes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {codes.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-white"
                    >
                      {c}
                      <button
                        aria-label={`Remove ${c}`}
                        onClick={() => removeCode(c)}
                        className="ml-1 text-zinc-300 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {preview?.codesApplied && preview.codesApplied.length > 0 && (
                <div className="mt-2 space-y-1 text-xs text-zinc-300">
                  {preview.codesApplied.map((ap) => (
                    <div key={ap.code} className="flex justify-between">
                      <span>
                        {ap.code} — {ap.type}
                      </span>
                      <span>- ${ap.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              {busyPreview && <div className="mt-1 text-xs text-zinc-400">Checking…</div>}
              {preview?.messages && preview.messages.length > 0 && (
                <div className="mt-2 text-xs text-amber-300">{preview.messages.join(', ')}</div>
              )}
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-zinc-300">
                <span>Discounts</span>
                <span className="text-emerald-300">- ${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between text-lg font-semibold text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Link
            href={
              {
                pathname: '/checkout',
                query: codes.length ? { coupons: codes.join(',') } : undefined,
              } as any
            }
            className="mt-6 block w-full rounded-xl bg-fuchsia-500/90 px-6 py-4 text-center font-semibold text-white hover:bg-fuchsia-500 transition-colors"
          >
            {t('cart', 'checkoutClarity')}
          </Link>

          <p className="mt-2 text-center text-xs text-zinc-400">{t('cart', 'checkoutFlavor')}</p>
        </GlassPanel>
      </div>
    </div>
  );
}
