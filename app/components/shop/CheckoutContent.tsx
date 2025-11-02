'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import GlassPanel from '../GlassPanel';
import { t } from '@/lib/microcopy';
import { useCart } from '@/app/components/cart/CartProvider';

export default function CheckoutContent() {
  const _router = useRouter();
  const { items } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [_couponInput, _setCouponInput] = useState('');
  const [codes, setCodes] = useState<string[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });

  // init codes from query (when navigating from cart)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const param = url.searchParams.get('coupons');
      if (param)
        setCodes(
          param
            .split(',')
            .map((c) => c.trim().toUpperCase())
            .filter(Boolean),
        );
    }
  }, []);

  // preview engine output
  useEffect(() => {
    let cancelled = false;
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const baseShipping = subtotal > 50 ? 0 : 9.99;
    const run = async () => {
      if (codes.length === 0) {
        setPreview(null);
        return;
      }
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
      }
    };
    const t = setTimeout(run, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [codes, items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      // Build CheckoutRequest items
      const checkoutItems = items.map((i) => ({
        productId: i.id,
        variantId: i.selectedVariant?.id || 'default',
        name: i.name,
        description: undefined,
        images: i.image ? [i.image] : [],
        quantity: i.quantity,
        priceCents: Math.round(i.price * 100),
        sku: undefined,
        printifyProductId: undefined,
        printifyVariantId: undefined,
      }));

      // Attach redemptions (best effort)
      try {
        const clientReferenceId = (typeof window !== 'undefined' &&
          (localStorage.getItem('cart_id') ||
            (() => {
              const id = `cart_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
              localStorage.setItem('cart_id', id);
              return id;
            })())) as string;
        if (codes.length) {
          await fetch('/api/coupons/attach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codes, clientReferenceId }),
          });
        }
      } catch {}

      const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const baseShipping = subtotal > 50 ? 0 : 9.99;
      const response = await fetch('/api/v1/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          shippingInfo: formData,
          couponCodes: codes,
          shipping: { provider: 'stripe', fee: baseShipping },
        }),
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Preview Mode Banner */}
      {preview && (
        <div className="lg:col-span-2 bg-amber-500/20 border border-amber-500/40 rounded-xl p-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/30 flex items-center justify-center">
            <span className="text-amber-400 text-sm font-semibold">PM</span>
          </div>
          <div className="flex-1">
            <p className="text-amber-200 font-medium">Preview Mode</p>
            <p className="text-amber-300/80 text-sm">
              Viewing coupon discount preview - changes not yet applied
            </p>
          </div>
        </div>
      )}

      {/* Checkout Form */}
      <div className="space-y-6">
        <GlassPanel className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Shipping Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-zinc-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none"
                placeholder="Enter your first name"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-zinc-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none"
                placeholder="Enter your last name"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-zinc-300 mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none"
                placeholder="Enter your address"
                required
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-zinc-300 mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none"
                placeholder="Enter your city"
                required
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-zinc-300 mb-2">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none"
                placeholder="Enter your state"
                required
              />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-zinc-300 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none"
                placeholder="Enter your ZIP code"
                required
              />
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-zinc-300 mb-2">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-fuchsia-400 focus:outline-none"
                required
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Payment</h2>
          <p className="text-zinc-400 mb-4">
            You'll be redirected to Stripe for secure payment processing.
          </p>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span></span>
            <span>Secure payment powered by Stripe</span>
          </div>
        </GlassPanel>
      </div>

      {/* Order Summary */}
      <div className="space-y-6">
        <GlassPanel className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Order Summary</h2>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{item.name}</h3>
                  {item.selectedVariant?.title && (
                    <p className="text-sm text-zinc-400">{item.selectedVariant.title}</p>
                  )}
                  <p className="text-sm text-zinc-400">Qty: {item.quantity}</p>
                </div>
                <div className="text-fuchsia-300 font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex justify-between text-zinc-300">
              <span>Subtotal</span>
              <span>
                $
                {useMemo(
                  () => items.reduce((s, i) => s + i.price * i.quantity, 0),
                  [items],
                ).toFixed(2)}
              </span>
            </div>
            {preview && preview.discount > 0 && (
              <div className="flex justify-between text-green-400">
                <span>Coupon Discount ({codes.join(', ')})</span>
                <span>-${preview.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-300">
              <span>Tax</span>
              <span>
                $
                {useMemo(
                  () => items.reduce((s, i) => s + i.price * i.quantity, 0) * 0.08,
                  [items],
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Shipping</span>
              <span>
                {useMemo(
                  () => (items.reduce((s, i) => s + i.price * i.quantity, 0) > 50 ? 0 : 9.99),
                  [items],
                ) === 0
                  ? 'Free'
                  : `$${useMemo(() => (items.reduce((s, i) => s + i.price * i.quantity, 0) > 50 ? 0 : 9.99), [items]).toFixed(2)}`}
              </span>
            </div>
            {preview && preview.freeShipping && (
              <div className="text-sm text-green-400">✓ Free shipping applied from coupon</div>
            )}
            <div className="border-t border-white/10 pt-2">
              <div className="flex justify-between text-lg font-semibold text-white">
                <span>Total</span>
                <span>
                  $
                  {useMemo(() => {
                    const sub = items.reduce((s, i) => s + i.price * i.quantity, 0);
                    const tax = sub * 0.08;
                    const ship = sub > 50 ? 0 : 9.99;
                    return sub + tax + ship;
                  }, [items]).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className="mt-6 w-full rounded-xl bg-fuchsia-500/90 px-6 py-4 font-semibold text-white hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing...' : 'Proceed to Payment'}
          </button>

          <p className="mt-4 text-center text-xs text-zinc-400">{t('cart', 'purchaseJoke')}</p>
        </GlassPanel>
      </div>
    </div>
  );
}


