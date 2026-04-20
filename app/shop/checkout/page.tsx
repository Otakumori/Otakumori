'use client';

export const dynamic = 'force-dynamic';

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../../components/cart/CartProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatedInput } from '@/app/components/ui/AnimatedInput';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs';
import { PetalBalanceDisplay } from '@/app/components/shop/PetalBalanceDisplay';
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
  image: string;
  selectedVariant?: {
    id: string;
    title: string;
  };
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

export default function CheckoutPage() {
  const { items: cart, total } = useCart();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
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

    if (!shippingInfo.country) {
      setError('Please select a country.');
      return;
    }

    const missingVariantItem = cart.find((item) => !item.selectedVariant?.id);
    if (missingVariantItem) {
      setError(`A valid variant is required before checkout for: ${missingVariantItem.name}. Please return to the product page and re-add it.`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const orderItems = cart.map((item) => ({
        lineKey: getLineKey(item),
        productId: item.id,
        variantId: item.selectedVariant!.id,
        name: item.name,
        quantity: item.quantity,
        priceCents: Math.round(item.price * 100),
        sku: `SKU-${item.id}`,
        description: item.name,
        images: item.image ? [item.image] : [],
        printifyProductId: item.id,
        printifyVariantId: item.selectedVariant!.id,
      }));

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

      const data = await response.json();

      if (data.ok && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        console.error('Checkout session error:', data);
        if (response.status === 503) {
          setError('Checkout is temporarily unavailable. Please contact support or try again later.');
        } else {
          setError(`${data.error || 'Failed to create checkout session.'}${data.requestId ? ` Request ID: ${data.requestId}` : ''}`);
        }
      }
    } catch (err) {
      setError(`An error occurred while processing your order${err instanceof Error ? `: ${err.message}` : ''}`);
      getLogger().then((logger) => {
        logger.error('Checkout error:', undefined, undefined, err instanceof Error ? err : new Error(String(err)));
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isSignedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
        <div className="container mx-auto px-4 py-16">
          <Card className="border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <h1 className="mb-4 text-2xl font-bold text-white">Sign In Required</h1>
            <p className="mb-8 text-pink-200">Please sign in to complete your purchase</p>
            <Link href="/sign-in">
              <Button className="bg-pink-500 hover:bg-pink-600">Sign In</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
        <div className="container mx-auto px-4 py-16">
          <Card className="border-pink-500/30 bg-white/10 p-8 text-center backdrop-blur-lg">
            <h1 className="mb-4 text-2xl font-bold text-white">Your Cart is Empty</h1>
            <p className="mb-8 text-pink-200">Add some items to your cart to proceed to checkout</p>
            <Link href={paths.shop()}>
              <Button className="bg-pink-500 hover:bg-pink-600">Continue Shopping</Button>
            </Link>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-800 to-red-900 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center">
          <Link href={paths.cart()} className="flex items-center text-pink-200 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <Card className="border-pink-500/30 bg-white/10 p-6 backdrop-blur-lg">
              <h2 className="mb-6 text-2xl font-bold text-white">Shipping Information</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <AnimatedInput id="firstName" name="firstName" label="First Name" value={shippingInfo.firstName} onChange={handleInputChange} required className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50" />
                  <AnimatedInput id="lastName" name="lastName" label="Last Name" value={shippingInfo.lastName} onChange={handleInputChange} required className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50" />
                </div>
                <AnimatedInput id="email" name="email" label="Email" type="email" value={shippingInfo.email} onChange={handleInputChange} required className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50" />
                <AnimatedInput id="address" name="address" label="Address" value={shippingInfo.address} onChange={handleInputChange} required className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50" placeholder="Street Address" />

                <div className="space-y-2">
                  <label htmlFor="country" className="block text-sm font-medium text-pink-100">Country</label>
                  <select id="country" name="country" value={shippingInfo.country} onChange={handleInputChange} required className="w-full rounded-xl border border-pink-500/30 bg-white/10 px-4 py-3 text-white outline-none focus:border-pink-400">
                    {COUNTRY_OPTIONS.map((country) => (
                      <option key={country.value} value={country.value} className="bg-[#2b1738] text-white">{country.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <AnimatedInput id="city" name="city" label="City" value={shippingInfo.city} onChange={handleInputChange} required className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50" />
                  <div className="space-y-2">
                    <label htmlFor="state" className="block text-sm font-medium text-pink-100">{isUS ? 'State' : 'State / Province / Region'}</label>
                    {isUS ? (
                      <select id="state" name="state" value={shippingInfo.state} onChange={handleInputChange} required className="w-full rounded-xl border border-pink-500/30 bg-white/10 px-4 py-3 text-white outline-none focus:border-pink-400">
                        <option value="" className="bg-[#2b1738] text-white">Select state</option>
                        {US_STATE_OPTIONS.map((state) => (
                          <option key={state} value={state} className="bg-[#2b1738] text-white">{state}</option>
                        ))}
                      </select>
                    ) : (
                      <input id="state" name="state" value={shippingInfo.state} onChange={handleInputChange} required className="w-full rounded-xl border border-pink-500/30 bg-white/10 px-4 py-3 text-white outline-none focus:border-pink-400" placeholder="Province / Region" />
                    )}
                  </div>
                  <AnimatedInput id="zipCode" name="zipCode" label={zipPlaceholder} value={shippingInfo.zipCode} onChange={handleInputChange} required className="border-pink-500/30 bg-white/10 text-white placeholder:text-pink-200/50" placeholder={zipPlaceholder} />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/20 p-3 whitespace-pre-wrap">
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <Button type="submit" disabled={isProcessing} className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50">
                  {isProcessing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>) : (<><Lock className="mr-2 h-4 w-4" />Proceed to Payment</>)}
                </Button>
              </form>
            </Card>
          </div>

          <div>
            <Card className="border-pink-500/30 bg-white/10 p-6 backdrop-blur-lg">
              <PetalBalanceDisplay />
              <h2 className="mb-6 text-2xl font-bold text-white">Order Summary</h2>
              <div className="space-y-4">
                {cart.map((item: CartItem) => (
                  <div key={getLineKey(item)} className="flex items-center gap-4">
                    <div className="relative h-16 w-16">
                      <Image src={item.image} alt={item.name} fill className="rounded-lg object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      {item.selectedVariant && <p className="text-sm text-pink-200">{item.selectedVariant.title}</p>}
                      <p className="text-pink-200">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-pink-200">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-pink-500/30 pt-4 space-y-2">
                  <div className="flex justify-between text-pink-200"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
                  <div className="flex justify-between text-pink-200"><span>Shipping</span><span>Calculated at payment</span></div>
                  <div className="flex justify-between text-pink-200"><span>Tax</span><span>Calculated at payment</span></div>
                  <div className="flex justify-between border-t border-pink-500/30 pt-2 font-semibold text-white"><span>Total</span><span>${total.toFixed(2)} + shipping</span></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
