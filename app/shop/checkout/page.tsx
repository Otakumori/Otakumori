'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Lock } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useCart } from '../../components/cart/CartProvider';
import { paths } from '@/lib/paths';

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariant?: {
    id: string;
    title: string;
  };
}

interface InvalidCheckoutItem {
  productId?: string;
  variantId?: string;
  name?: string;
}

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
] as const;

const US_STATE_OPTIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY',
];

function getLineKey(item: CartItem) {
  return `${item.id}::${item.selectedVariant?.id ?? 'default'}`;
}

function formatServerError(data: any): string {
  const parts = [data?.error || 'Failed to create checkout session.'];
  if (data?.stage) parts.push(`Stage: ${data.stage}`);
  if (data?.requestId) parts.push(`Request ID: ${data.requestId}`);
  return parts.join('\n');
}

function buildInvalidItemsMessage(invalidItems: InvalidCheckoutItem[]): string {
  const names = invalidItems
    .map((item) => item.name?.trim())
    .filter((name): name is string => Boolean(name));

  if (names.length === 0) {
    return 'Some items in your cart are no longer available and were removed. Please review your cart and try again.';
  }

  return `Some items in your cart are no longer available and were removed: ${names.join(', ')}. Please review your cart and try again.`;
}

export default function CheckoutPage() {
  const { items: cart, total, removeItem } = useCart();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(paths.checkout())}`;
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cartNeedsReview, setCartNeedsReview] = useState(false);

  const isUS = shippingInfo.country === 'US';
  const zipPlaceholder = useMemo(() => (isUS ? 'ZIP Code' : 'Postal Code'), [isUS]);

  useEffect(() => {
    if (!user) return;
    setShippingInfo((prev) => ({
      ...prev,
      firstName: prev.firstName || user.firstName || '',
      lastName: prev.lastName || user.lastName || '',
      email: prev.email || user.primaryEmailAddress?.emailAddress || '',
    }));
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'zipCode') {
      const cleaned = shippingInfo.country === 'US'
        ? value.replace(/[^0-9-]/g, '').slice(0, 10)
        : value.slice(0, 12);
      setShippingInfo((prev) => ({ ...prev, zipCode: cleaned }));
      return;
    }
    if (name === 'state' && shippingInfo.country === 'US') {
      setShippingInfo((prev) => ({ ...prev, state: value.toUpperCase() }));
      return;
    }
    if (name === 'country') {
      setShippingInfo((prev) => ({ ...prev, country: value, state: value === 'US' ? prev.state : '' }));
      return;
    }
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      setError('Please sign in to complete your purchase');
      return;
    }

    if (shippingInfo.country === 'US' && !US_STATE_OPTIONS.includes(shippingInfo.state.toUpperCase())) {
      setError('Please select a valid U.S. state.');
      return;
    }

    const missingVariantItem = cart.find((item) => !item.selectedVariant?.id);
    if (missingVariantItem) {
      setError(`A valid variant is required before checkout for: ${missingVariantItem.name}. Please return to the product page and re-add it.`);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCartNeedsReview(false);

    try {
      const orderItems = cart.map((item) => ({
        productId: String(item.id),
        variantId: String(item.selectedVariant!.id),
        name: String(item.name),
        quantity: Number(item.quantity),
        priceCents: Number(Math.round(item.price * 100)),
        sku: `SKU-${item.id}`,
      }));

      try {
        const serialized = JSON.stringify({ items: orderItems, shippingInfo });
        console.log('Checkout payload size:', serialized.length);
      } catch (serializationError) {
        console.error('Checkout payload serialization failed:', serializationError);
        setError('Payload serialization failed before request.');
        setIsProcessing(false);
        return;
      }

      const idempotencyKey = `checkout_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const response = await fetch('/api/v1/checkout/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-idempotency-key': idempotencyKey,
        },
        body: JSON.stringify({
          items: orderItems,
          shippingInfo,
          successUrl: `${window.location.origin}${paths.checkoutSuccess()}`,
          cancelUrl: `${window.location.origin}${paths.cart()}`,
        }),
      });

      const raw = await response.text();
      let data: any = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (parseError) {
        console.error('Checkout returned non-JSON response:', {
          status: response.status,
          statusText: response.statusText,
          raw,
          parseError,
        });
        const preview = raw ? raw.slice(0, 240) : '(empty response body)';
        setError(`Checkout returned a non-JSON response. HTTP ${response.status} ${response.statusText}.\n\nResponse preview:\n${preview}`);
        return;
      }

      if (data?.ok && data.data?.url) {
        window.location.href = data.data.url;
      } else if (Array.isArray(data?.invalidItems) && data.invalidItems.length > 0) {
        const invalidItems = data.invalidItems as InvalidCheckoutItem[];
        invalidItems.forEach((item) => {
          if (!item.productId || !item.variantId) return;
          removeItem(`${item.productId}::${item.variantId}`);
        });
        setCartNeedsReview(true);
        setError(buildInvalidItemsMessage(invalidItems));
      } else {
        console.error('Checkout session error:', data);
        setError(formatServerError(data));
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Checkout submit crash:', err);
      setError(`Checkout crashed before redirect: ${message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-[#120917] text-white pt-20">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-2xl font-semibold">Sign In Required</h1>
          <p className="mt-3 text-pink-200">Please sign in to complete your purchase.</p>
          <Link href={signInHref} className="mt-6 inline-block rounded-lg bg-pink-500 px-4 py-2 text-white">Sign In</Link>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#120917] text-white pt-20">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="text-2xl font-semibold">Your Cart is Empty</h1>
          <p className="mt-3 text-pink-200">Add an item to continue.</p>
          <Link href={paths.shop()} className="mt-6 inline-block rounded-lg bg-pink-500 px-4 py-2 text-white">Continue Shopping</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#120917] text-white pt-20">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8">
          <Link href={paths.cart()} className="inline-flex items-center text-pink-200 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-pink-500/20 bg-white/5 p-6">
            <h2 className="mb-6 text-2xl font-semibold">Checkout</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input name="firstName" value={shippingInfo.firstName} onChange={handleInputChange} placeholder="First name" className="rounded-xl border border-pink-500/20 bg-white/5 px-4 py-3 text-white" required />
                <input name="lastName" value={shippingInfo.lastName} onChange={handleInputChange} placeholder="Last name" className="rounded-xl border border-pink-500/20 bg-white/5 px-4 py-3 text-white" required />
              </div>
              <input name="email" type="email" value={shippingInfo.email} onChange={handleInputChange} placeholder="Email" className="w-full rounded-xl border border-pink-500/20 bg-white/5 px-4 py-3 text-white" required />
              <input name="address" value={shippingInfo.address} onChange={handleInputChange} placeholder="Street address" className="w-full rounded-xl border border-pink-500/20 bg-white/5 px-4 py-3 text-white" required />
              <select name="country" value={shippingInfo.country} onChange={handleInputChange} className="w-full rounded-xl border border-pink-500/20 bg-white/5 px-4 py-3 text-white" required>
                {COUNTRY_OPTIONS.map((country) => (
                  <option key={country.value} value={country.value} className="bg-[#2b1738] text-white">{country.label}</option>
                ))}
              </select>
              <div className="grid grid-cols-3 gap-4">
                <input name="city" value={shippingInfo.city} onChange={handleInputChange} placeholder="City" className="rounded-xl border border-pink-500/20 bg-white/5 px-4 py-3 text-white" required />
                {isUS ? (
                  <select name="state" value={shippingInfo.state} onChange={handleInputChange} className="rounded-xl border border-pink-500/20 bg-white/5 px-4 py-3 text-white" required>
                    <option value="" className="bg-[#2b1738] text-white">State</option>
                    {US_STATE_OPTIONS.map((state) => (
                      <option key={state} value={state} className="bg-[#2b1738] text-white">{state}</option>
                    ))}
                  </select>
                ) : (
                  <input name="state" value={shippingInfo.state} onChange={handleInputChange} placeholder="Region" className="rounded-xl border border-pink-500/20 bg-white/5 px-4 py-3 text-white" required />
                )}
                <input name="zipCode" value={shippingInfo.zipCode} onChange={handleInputChange} placeholder={zipPlaceholder} className="rounded-xl border border-pink-500/20 bg-white/5 px-4 py-3 text-white" required />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 whitespace-pre-wrap">
                  <div>{error}</div>
                  {cartNeedsReview && (
                    <Link href={paths.cart()} className="mt-3 inline-block rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/20">
                      Review cart
                    </Link>
                  )}
                </div>
              )}

              <button type="submit" disabled={isProcessing} className="inline-flex w-full items-center justify-center rounded-xl bg-pink-500 px-4 py-3 font-medium text-white disabled:opacity-50">
                {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</> : <><Lock className="mr-2 h-4 w-4" />Proceed to Payment</>}
              </button>
            </form>
          </section>

          <section className="rounded-2xl border border-pink-500/20 bg-white/5 p-6">
            <h2 className="mb-6 text-2xl font-semibold">Order Summary</h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={getLineKey(item)} className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <p className="font-medium text-white">{item.name}</p>
                    {item.selectedVariant && <p className="text-sm text-pink-200">{item.selectedVariant.title}</p>}
                    <p className="text-sm text-pink-200">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right text-pink-100">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
              <div className="space-y-2 pt-2 text-pink-100">
                <div className="flex justify-between"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>Calculated at payment</span></div>
                <div className="flex justify-between"><span>Tax</span><span>Calculated at payment</span></div>
                <div className="flex justify-between border-t border-white/10 pt-3 font-semibold text-white"><span>Total</span><span>${total.toFixed(2)} + shipping</span></div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
