'use client';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('om_cart') ?? '[]');
    setItems(cart);
  }, []);

  const checkout = async () => {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    const { url } = await res.json();
    window.location.href = url;
  };

  const totalQty = items.reduce((a, b) => a + b.quantity, 0);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold">Cart</h1>
        {items.length === 0 ? <p className="text-neutral-400 mt-2">Your cart is empty.</p> : (
          <>
            <ul className="mt-4 grid gap-2">
              {items.map((i, idx) => (
                <li key={idx} className="flex justify-between text-sm border-b border-white/10 py-2">
                  <div>Variant {i.variant_id}</div>
                  <div>× {i.quantity}</div>
                </li>
              ))}
            </ul>
            <button onClick={checkout} className="mt-6 rounded-xl bg-pink-500/90 hover:bg-pink-500 px-4 py-2">
              Checkout ({totalQty})
            </button>
          </>
        )}
      </div>
    </main>
  );
}
