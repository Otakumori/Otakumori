'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { commerceCoreConfig } from './config';

type CartItem = {
  id: string;
  variantId: string;
  name: string;
  priceCents: number;
  quantity: number;
};

type CustomerDraft = {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
};

const emptyCustomer: CustomerDraft = {
  email: '',
  firstName: '',
  lastName: '',
  country: 'US',
  address1: '',
  city: '',
  state: '',
  postalCode: '',
};

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const maxStoredValueLength = 64_000;
const maxCartItems = 25;

function formatMoney(cents: number) {
  return money.format(cents / 100);
}

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw || raw.length > maxStoredValueLength) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readCart(): CartItem[] {
  const parsed = readLocalJson<unknown>(commerceCoreConfig.localCartKey, []);
  if (!Array.isArray(parsed)) return [];

  return parsed.slice(0, maxCartItems).flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const candidate = item as Partial<CartItem>;
    if (
      typeof candidate.id !== 'string' ||
      typeof candidate.variantId !== 'string' ||
      typeof candidate.name !== 'string' ||
      typeof candidate.priceCents !== 'number' ||
      typeof candidate.quantity !== 'number'
    ) {
      return [];
    }

    return [
      {
        id: candidate.id,
        variantId: candidate.variantId,
        name: candidate.name,
        priceCents: Math.max(0, candidate.priceCents),
        quantity: Math.min(99, Math.max(1, candidate.quantity)),
      },
    ];
  });
}

function readCustomer(): CustomerDraft {
  const parsed = readLocalJson<Partial<CustomerDraft>>(commerceCoreConfig.localCustomerKey, {});
  return {
    ...emptyCustomer,
    ...Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [key, typeof value === 'string' ? value.slice(0, 160) : '']),
    ),
  };
}

export default function CommerceCoreCheckoutClient() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerDraft>(emptyCustomer);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState('Stable commerce checkout loaded.');

  useEffect(() => {
    setCart(readCart());
    setCustomer(readCustomer());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(commerceCoreConfig.localCustomerKey, JSON.stringify(customer));
  }, [customer, hydrated]);

  const subtotalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [cart],
  );

  function saveCustomer(key: keyof CustomerDraft, value: string) {
    setCustomer((current) => ({ ...current, [key]: value.slice(0, 160) }));
  }

  function prepareCheckout() {
    if (cart.length === 0) {
      setNotice('Add at least one item before checkout.');
      return;
    }

    const required = ['email', 'firstName', 'lastName', 'address1', 'city', 'state', 'postalCode'] as const;
    const missing = required.filter((key) => !customer[key].trim());
    if (missing.length > 0) {
      setNotice(`Missing checkout fields: ${missing.join(', ')}.`);
      return;
    }

    const payload = {
      items: cart.map((item) => ({
        productId: item.id,
        variantId: item.variantId,
        name: item.name,
        quantity: item.quantity,
        priceCents: item.priceCents,
      })),
      shippingInfo: customer,
      shipping: { status: 'calculated_at_payment' },
      successUrl: `${window.location.origin}${commerceCoreConfig.routes.success}`,
      cancelUrl: `${window.location.origin}${commerceCoreConfig.routes.cart}`,
    };

    window.sessionStorage.setItem('otakumori-commerce-core-checkout-payload', JSON.stringify(payload));
    setNotice('Checkout payload prepared. Stripe handoff can now be wired without changing this checkout shell.');
  }

  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(commerceCoreConfig.routes.checkout)}`;

  return (
    <main className="min-h-screen bg-[#120f14] px-5 py-8 text-zinc-100">
      <section className="mx-auto max-w-4xl space-y-6">
        <header className="border-b border-zinc-800 pb-5">
          <p className="text-sm uppercase tracking-[0.35em] text-pink-200">{commerceCoreConfig.label}</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold md:text-4xl">Checkout</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
                Local checkout skeleton. Stripe handoff only runs after the explicit checkout action.
              </p>
            </div>
            <div className="text-sm text-pink-100">
              Subtotal: <strong>{formatMoney(subtotalCents)}</strong>
            </div>
          </div>
          <nav className="mt-5 flex flex-wrap gap-3 text-sm">
            <Link className="rounded-full border border-zinc-700 px-4 py-2 text-zinc-200" href={commerceCoreConfig.routes.home}>
              home
            </Link>
            <Link className="rounded-full border border-zinc-700 px-4 py-2 text-zinc-200" href={commerceCoreConfig.routes.cart}>
              cart
            </Link>
            <Link className="rounded-full border border-zinc-700 px-4 py-2 text-zinc-200" href={commerceCoreConfig.routes.account}>
              account
            </Link>
          </nav>
        </header>

        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-200">{notice}</p>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Sign-in state</h2>
              <p className="mt-1 text-sm text-zinc-400">Sign in only when you are ready to attach checkout details to an account.</p>
            </div>
            <Link className="rounded-full bg-pink-200 px-5 py-3 text-sm font-semibold text-zinc-950" href={signInHref}>
              Sign in to checkout
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_18rem]">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-xl font-semibold">Cart</h2>
            <div className="mt-4 space-y-3">
              {cart.length === 0 ? (
                <p className="text-sm text-zinc-400">Your local commerce-core cart is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item.variantId} className="flex items-center justify-between rounded-xl bg-zinc-900 p-3 text-sm">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-zinc-400">Qty {item.quantity}</p>
                    </div>
                    <p>{formatMoney(item.priceCents * item.quantity)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <aside className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-xl font-semibold">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd>{formatMoney(subtotalCents)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd>Calculated at payment</dd>
              </div>
              <div className="flex justify-between">
                <dt>Estimated tax</dt>
                <dd>Calculated at payment</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="text-xl font-semibold">Customer and shipping profile</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {(Object.keys(emptyCustomer) as (keyof CustomerDraft)[]).map((key) => (
              <label key={key} className="text-sm text-zinc-300">
                {key}
                <input
                  autoComplete={key === 'postalCode' ? 'postal-code' : key}
                  className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                  value={customer[key]}
                  onChange={(event) => saveCustomer(key, event.target.value)}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-pink-300/20 bg-zinc-950 p-5">
          <h2 className="text-xl font-semibold">Checkout handoff</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Shipping and tax read as calculated at payment. This page does not call Stripe on load.
          </p>
          <button className="mt-4 rounded-full bg-pink-200 px-5 py-3 text-sm font-semibold text-zinc-950" onClick={prepareCheckout}>
            Prepare checkout payload
          </button>
        </section>
      </section>
    </main>
  );
}
