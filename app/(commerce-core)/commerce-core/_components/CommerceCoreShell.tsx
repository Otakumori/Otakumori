'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { commerceCoreConfig } from './config';

type Mode = 'shop' | 'cart' | 'account' | 'checkout' | 'orders' | 'success';

type Product = {
  id: string;
  variantId: string;
  name: string;
  description: string;
  imageUrl?: string;
  priceCents: number;
  category: string;
};

type CartItem = Product & { quantity: number };

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

const products: Product[] = [
  {
    id: 'core-tee-001',
    variantId: 'core-tee-black-m',
    name: 'Core Graphic Tee',
    description: 'Launch-ready hero tee placeholder for original Otaku-mori artwork.',
    imageUrl: '/assets/commerce-core/core-tee.svg',
    priceCents: 2800,
    category: 'Apparel',
  },
  {
    id: 'core-hoodie-001',
    variantId: 'core-hoodie-black-m',
    name: 'Core Hoodie',
    description: 'Premium hoodie placeholder with room for provider variant sync.',
    imageUrl: '/assets/commerce-core/core-hoodie.svg',
    priceCents: 6400,
    category: 'Apparel',
  },
  {
    id: 'core-sticker-001',
    variantId: 'core-sticker-3x3',
    name: 'Sigil Sticker',
    description: 'Small add-on product for testing low-ticket order behavior.',
    imageUrl: '/assets/commerce-core/core-sticker.svg',
    priceCents: 450,
    category: 'Accessories',
  },
];

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

function formatMoney(cents: number) {
  return money.format(cents / 100);
}

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(commerceCoreConfig.localCartKey) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readCustomer(): CustomerDraft {
  if (typeof window === 'undefined') return emptyCustomer;
  try {
    return { ...emptyCustomer, ...JSON.parse(window.localStorage.getItem(commerceCoreConfig.localCustomerKey) ?? '{}') };
  } catch {
    return emptyCustomer;
  }
}

export function CommerceCoreShell({ mode }: { mode: Mode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<CustomerDraft>(emptyCustomer);
  const [notice, setNotice] = useState('Stable commerce shell loaded.');

  useEffect(() => {
    setCart(readCart());
    setCustomer(readCustomer());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(commerceCoreConfig.localCartKey, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(commerceCoreConfig.localCustomerKey, JSON.stringify(customer));
  }, [customer]);

  const subtotalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [cart],
  );

  function add(product: Product) {
    setCart((items) => {
      const current = items.find((item) => item.variantId === product.variantId);
      if (current) {
        return items.map((item) =>
          item.variantId === product.variantId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...items, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} added. Cart and checkout now share the same local state.`);
  }

  function updateQuantity(variantId: string, quantity: number) {
    setCart((items) =>
      items
        .map((item) => (item.variantId === variantId ? { ...item, quantity: Math.max(0, quantity) } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  function clearCart() {
    setCart([]);
    setNotice('Cart cleared.');
  }

  function saveCustomer(key: keyof CustomerDraft, value: string) {
    setCustomer((current) => ({ ...current, [key]: value }));
  }

  function buildCheckoutPayload() {
    return {
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
  }

  function exportAuditJson() {
    const payload = {
      generatedAt: new Date().toISOString(),
      source: 'commerce-core-local-audit-export',
      subtotalCents,
      subtotal: formatMoney(subtotalCents),
      cart,
      customer: { ...customer, email: customer.email ? customer.email : 'not provided' },
      taxStatus: 'Tax calculation is deferred until Stripe Tax/provider configuration is finalized.',
      shippingStatus: 'Calculated at payment. No hardcoded storefront shipping rate is presented.',
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `otakumori-commerce-audit-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Audit JSON exported from the current checkout state.');
  }

  function prepareCheckout() {
    if (cart.length === 0) {
      setNotice('Add at least one item before checkout.');
      return;
    }

    const required = ['email', 'firstName', 'lastName', 'address1', 'city', 'state', 'postalCode'] as const;
    const missing = required.filter((key) => !customer[key]);
    if (missing.length > 0) {
      setNotice(`Missing checkout fields: ${missing.join(', ')}.`);
      return;
    }

    window.sessionStorage.setItem('otakumori-commerce-core-checkout-payload', JSON.stringify(buildCheckoutPayload(), null, 2));
    setNotice('Checkout payload prepared. Stripe handoff can now be wired without changing the cart/account shell.');
  }

  const active = {
    shop: mode === 'shop',
    cart: mode === 'cart',
    account: mode === 'account',
    checkout: mode === 'checkout',
    orders: mode === 'orders',
    success: mode === 'success',
  };

  return (
    <main className="min-h-screen bg-[#120f14] px-5 py-8 text-zinc-100">
      <section className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-3xl border border-pink-300/20 bg-zinc-950/80 p-6 shadow-2xl shadow-pink-950/20">
          <p className="text-sm uppercase tracking-[0.35em] text-pink-200">{commerceCoreConfig.label}</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold md:text-5xl">{commerceCoreConfig.headline}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">{commerceCoreConfig.description}</p>
            </div>
            <div className="rounded-2xl bg-pink-200/10 px-4 py-3 text-sm text-pink-100">
              Cart total: <strong>{formatMoney(subtotalCents)}</strong>
            </div>
          </div>
          <nav className="mt-6 flex flex-wrap gap-3 text-sm">
            {Object.entries(commerceCoreConfig.routes).map(([key, href]) => (
              <Link
                key={key}
                href={href}
                className="rounded-full border border-zinc-700 px-4 py-2 text-zinc-200 hover:border-pink-200 hover:text-pink-100"
              >
                {key}
              </Link>
            ))}
          </nav>
        </header>

        <p className="rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-200">{notice}</p>

        {(active.account || active.checkout) && <CommerceCoreAuthState mode={mode} />}

        {active.shop && (
          <section className="grid gap-4 md:grid-cols-3">
            {products.map((product) => (
              <article key={product.variantId} className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-pink-200">{product.category}</p>
                <h2 className="mt-3 text-xl font-semibold">{product.name}</h2>
                <p className="mt-2 min-h-16 text-sm leading-6 text-zinc-400">{product.description}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="font-semibold">{formatMoney(product.priceCents)}</span>
                  <button className="rounded-full bg-pink-200 px-4 py-2 text-sm font-semibold text-zinc-950" onClick={() => add(product)}>
                    Add to cart
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {(active.cart || active.checkout) && (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="text-2xl font-semibold">Cart</h2>
              <div className="mt-4 space-y-3">
                {cart.length === 0 ? (
                  <p className="text-sm text-zinc-400">Your local commerce-core cart is empty.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.variantId} className="flex flex-col gap-3 rounded-2xl bg-zinc-900 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-zinc-400">{formatMoney(item.priceCents)} each</p>
                      </div>
                      <input
                        className="w-24 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2"
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item.variantId, Number(event.target.value))}
                        aria-label={`Quantity for ${item.name}`}
                      />
                    </div>
                  ))
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-950" href={commerceCoreConfig.routes.checkout}>
                  Continue to checkout
                </Link>
                <button className="rounded-full border border-zinc-700 px-4 py-2 text-sm" onClick={clearCart}>
                  Clear cart
                </button>
              </div>
            </div>

            <Summary subtotalCents={subtotalCents} exportAuditJson={exportAuditJson} />
          </section>
        )}

        {(active.account || active.checkout) && (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-2xl font-semibold">Customer and shipping profile</h2>
            <p className="mt-2 text-sm text-zinc-400">
              This profile is local and stable for the skeleton. Clerk user sync can attach to the same fields later.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {(Object.keys(emptyCustomer) as (keyof CustomerDraft)[]).map((key) => (
                <label key={key} className="text-sm text-zinc-300">
                  {key}
                  <input
                    className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100"
                    value={customer[key]}
                    onChange={(event) => saveCustomer(key, event.target.value)}
                  />
                </label>
              ))}
            </div>
          </section>
        )}

        {active.checkout && (
          <section className="rounded-3xl border border-pink-300/20 bg-zinc-950 p-5">
            <h2 className="text-2xl font-semibold">Checkout handoff</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Shipping is shown as calculated at payment. The next backend patch should submit this payload to Stripe Checkout with a safe JSON response and idempotency key.
            </p>
            <pre className="mt-4 max-h-80 overflow-auto rounded-2xl bg-black/50 p-4 text-xs text-zinc-300">
              {JSON.stringify({ subtotalCents, cart, customer }, null, 2)}
            </pre>
            <button className="mt-4 rounded-full bg-pink-200 px-5 py-3 text-sm font-semibold text-zinc-950" onClick={prepareCheckout}>
              Prepare checkout payload
            </button>
          </section>
        )}

        {active.orders && (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="text-2xl font-semibold">Order history surface</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              This placeholder is intentionally safe. It gives the route a stable UI while the database-backed order history endpoint is finalized.
            </p>
          </section>
        )}

        {active.success && (
          <section className="rounded-3xl border border-pink-300/20 bg-zinc-950 p-5">
            <h2 className="text-2xl font-semibold">Checkout success surface</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              After Stripe Checkout is wired, this page should verify the session server-side, clear the cart, and show the stored order number.
            </p>
          </section>
        )}
      </section>
    </main>
  );
}

function CommerceCoreAuthState({ mode }: { mode: Mode }) {
  const redirectPath = mode === 'checkout' ? commerceCoreConfig.routes.checkout : commerceCoreConfig.routes.home;
  const buttonText = mode === 'checkout' ? 'Sign in to checkout' : 'Sign in';
  const signInHref = `/sign-in?redirect_url=${encodeURIComponent(redirectPath)}`;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Sign-in state</h2>
          <p className="mt-2 text-sm text-zinc-400">Sign in only when you are ready to attach checkout details to an account.</p>
        </div>
        <Link className="rounded-full bg-pink-200 px-5 py-3 text-sm font-semibold text-zinc-950" href={signInHref}>
          {buttonText}
        </Link>
      </div>
    </section>
  );
}

function Summary({ subtotalCents, exportAuditJson }: { subtotalCents: number; exportAuditJson: () => void }) {
  return (
    <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-5">
      <h2 className="text-2xl font-semibold">Summary</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMoney(subtotalCents)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd>Calculated at payment</dd></div>
        <div className="flex justify-between"><dt>Estimated tax</dt><dd>Calculated by Stripe/provider</dd></div>
      </dl>
      <button className="mt-5 w-full rounded-full border border-pink-200 px-4 py-2 text-sm text-pink-100" onClick={exportAuditJson}>
        Export audit JSON
      </button>
    </aside>
  );
}
