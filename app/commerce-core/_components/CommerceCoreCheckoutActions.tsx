'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { commerceCoreConfig } from './config';

type CartItem = {
  id: string;
  variantId: string;
  name: string;
  imageUrl?: string;
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

const productImages: Record<string, string> = {
  'core-tee-black-m': '/assets/commerce-core/core-tee.svg',
  'core-hoodie-black-m': '/assets/commerce-core/core-hoodie.svg',
  'core-sticker-3x3': '/assets/commerce-core/core-sticker.svg',
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
        imageUrl: typeof candidate.imageUrl === 'string' ? candidate.imageUrl : undefined,
        priceCents: Math.max(0, candidate.priceCents),
        quantity: Math.min(99, Math.max(1, candidate.quantity)),
      },
    ];
  });
}

function getFormCustomer(form: HTMLFormElement): CustomerDraft {
  const formData = new FormData(form);
  return {
    email: String(formData.get('email') ?? '').slice(0, 160),
    firstName: String(formData.get('firstName') ?? '').slice(0, 160),
    lastName: String(formData.get('lastName') ?? '').slice(0, 160),
    country: String(formData.get('country') ?? 'US').slice(0, 160),
    address1: String(formData.get('address1') ?? '').slice(0, 160),
    city: String(formData.get('city') ?? '').slice(0, 160),
    state: String(formData.get('state') ?? '').slice(0, 160),
    postalCode: String(formData.get('postalCode') ?? '').slice(0, 160),
  };
}

export default function CommerceCoreCheckoutActions() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notice, setNotice] = useState('Review your items and shipping details.');

  useEffect(() => {
    const hydratedCart = readCart();
    setCart(hydratedCart);

    const savedCustomer = readLocalJson<Partial<CustomerDraft>>(commerceCoreConfig.localCustomerKey, {});
    const form = document.querySelector<HTMLFormElement>('[data-commerce-checkout-form]');
    if (!form) return;

    Object.entries({ ...emptyCustomer, ...savedCustomer }).forEach(([key, value]) => {
      const field = form.elements.namedItem(key);
      if (field instanceof HTMLInputElement && typeof value === 'string') {
        field.value = value.slice(0, 160);
      }
    });
  }, []);

  const subtotalCents = useMemo(
    () => cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0),
    [cart],
  );

  function prepareCheckout() {
    const form = document.querySelector<HTMLFormElement>('[data-commerce-checkout-form]');
    if (!form) {
      setNotice('Checkout form is unavailable. Refresh and try again.');
      return;
    }

    const customer = getFormCustomer(form);
    window.localStorage.setItem(commerceCoreConfig.localCustomerKey, JSON.stringify(customer));

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
        imageUrl: item.imageUrl,
        quantity: item.quantity,
        priceCents: item.priceCents,
      })),
      shippingInfo: customer,
      shipping: { status: 'calculated_at_payment' },
      successUrl: `${window.location.origin}${commerceCoreConfig.routes.success}`,
      cancelUrl: `${window.location.origin}${commerceCoreConfig.routes.cart}`,
    };

    window.sessionStorage.setItem('otakumori-commerce-core-checkout-payload', JSON.stringify(payload));
    setNotice('Checkout payload prepared. Payment handoff can be wired after this skeleton is merged.');
  }

  return (
    <>
      <section className="rounded-lg border border-zinc-800 bg-zinc-950">
        <div className="border-b border-zinc-800 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-100">Items in this order</h2>
          <p className="mt-1 text-sm text-zinc-400">Prices are locked for this local checkout review.</p>
        </div>
        <div className="divide-y divide-zinc-800">
          {cart.length === 0 ? (
            <div className="px-5 py-6 text-sm text-zinc-400">Your local commerce-core cart is empty.</div>
          ) : (
            cart.map((item) => (
              <div key={item.variantId} className="grid grid-cols-[72px_1fr_auto] gap-4 px-5 py-4">
                <div className="relative h-20 w-18 overflow-hidden rounded-md border border-zinc-800 bg-zinc-900">
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="72px"
                    src={item.imageUrl ?? productImages[item.variantId] ?? '/assets/commerce-core/core-sticker.svg'}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-zinc-100">{item.name}</h3>
                  <p className="mt-1 text-sm text-zinc-400">Qty {item.quantity}</p>
                  <p className="mt-2 text-xs text-emerald-300">Ships after payment confirmation</p>
                </div>
                <div className="text-right text-sm font-semibold text-zinc-100">{formatMoney(item.priceCents * item.quantity)}</div>
              </div>
            ))
          )}
        </div>
      </section>

      <aside className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-base font-semibold text-zinc-100">Order summary</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-400">Items</dt>
            <dd className="font-medium text-zinc-100">{formatMoney(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-400">Shipping</dt>
            <dd className="font-medium text-zinc-100">Calculated at payment</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-400">Estimated tax</dt>
            <dd className="font-medium text-zinc-100">Calculated at payment</dd>
          </div>
        </dl>
        <div className="mt-4 border-t border-zinc-800 pt-4">
          <div className="flex justify-between gap-4 text-base font-semibold">
            <span>Subtotal</span>
            <span>{formatMoney(subtotalCents)}</span>
          </div>
        </div>
        <button
          className="mt-5 w-full rounded-md bg-pink-200 px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-pink-100"
          onClick={prepareCheckout}
          type="button"
        >
          Prepare checkout payload
        </button>
        <p className="mt-3 min-h-10 text-sm leading-5 text-zinc-300" role="status">
          {notice}
        </p>
      </aside>
    </>
  );
}
