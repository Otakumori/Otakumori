'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { t } from '@/lib/microcopy';
import { useCart } from '@/app/components/cart/CartProvider';
import { PetalBalanceDisplay } from './PetalBalanceDisplay';
import { EmptyCart } from '@/app/components/empty-states';
import { MoriButton, MoriInput, MoriPanel, MoriPrice } from '@/app/components/mori';

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
      <div className="lg:col-span-2 space-y-4" data-testid="cart-items">
        <PetalBalanceDisplay />
        {items.map((item) => (
          <MoriPanel key={item.id} className="p-4" data-testid="cart-item">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden border border-[var(--mori-border-muted)]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-display text-lg font-semibold text-[var(--mori-ivory)] truncate">
                  {item.name}
                </h3>
                {item.selectedVariant?.title && (
                  <p className="text-sm text-[var(--mori-taupe)]">{item.selectedVariant.title}</p>
                )}
                <MoriPrice className="text-lg">${item.price}</MoriPrice>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={isUpdating || item.quantity <= 1}
                  className="mori-button mori-button--secondary px-3 py-2"
                >
                  -
                </button>
                <span className="w-8 text-center text-[var(--mori-ivory)]">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={isUpdating}
                  className="mori-button mori-button--secondary px-3 py-2"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                disabled={isUpdating}
                className="mori-button mori-button--danger px-3 py-2 text-xs"
              >
                Remove
              </button>
            </div>
          </MoriPanel>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <MoriPanel className="p-6 sticky top-8">
          <h2 className="font-display text-xl font-semibold text-[var(--mori-ivory)] mb-4">
            Order Summary
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between text-[var(--mori-parchment-muted)]">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {/* Coupons */}
            <div className="mt-2">
              <label htmlFor="couponCode" className="mori-label mb-1">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <MoriInput
                  id="couponCode"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1"
                  aria-label="Coupon code"
                />
                <MoriButton
                  type="button"
                  onClick={addCode}
                  className="px-3 py-2"
                  aria-label="Apply coupon"
                >
                  Apply
                </MoriButton>
              </div>
              {codes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {codes.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 border border-[var(--mori-border-muted)] bg-black/20 px-2 py-1 text-xs text-[var(--mori-ivory)]"
                    >
                      {c}
                      <button
                        aria-label={`Remove ${c}`}
                        onClick={() => removeCode(c)}
                        className="ml-1 text-[var(--mori-taupe)] hover:text-[var(--mori-ivory)]"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {preview?.codesApplied && preview.codesApplied.length > 0 && (
                <div className="mt-2 space-y-1 text-xs text-[var(--mori-parchment-muted)]">
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
              {busyPreview && (
                <div className="mt-1 text-xs text-[var(--mori-taupe)]">Checking...</div>
              )}
              {preview?.messages && preview.messages.length > 0 && (
                <div className="mt-2 text-xs text-amber-300">{preview.messages.join(', ')}</div>
              )}
            </div>
            <div className="flex justify-between text-[var(--mori-parchment-muted)]">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[var(--mori-parchment-muted)]">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[var(--mori-parchment-muted)]">
                <span>Discounts</span>
                <span className="text-emerald-300">- ${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-[var(--mori-border-muted)] pt-3">
              <div className="flex justify-between text-lg font-semibold text-[var(--mori-ivory)]">
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
            className="mori-button mori-button--primary mt-6 flex w-full px-6 py-4"
            data-testid="checkout-button"
          >
            {t('cart', 'checkoutClarity')}
          </Link>

          <p className="mt-2 text-center text-xs text-[var(--mori-taupe)]">
            {t('cart', 'checkoutFlavor')}
          </p>
        </MoriPanel>
      </div>
    </div>
  );
}
