'use client';
import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminNav';

type Item = {
  id?: string;
  sku: string;
  name: string;
  kind: string;
  pricePetals?: number | null;
  metadata?: any;
};

export default function AdminCouponsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/petal-shop/items', { cache: 'no-store' });
    const j = await r.json();
    if (j?.ok) setItems(j.data.items);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const coupons = useMemo(
    () => items.filter((i) => (i.kind || '').toUpperCase() === 'COUPON'),
    [items],
  );

  const onSave = async () => {
    if (!editing) return;
    setMsg(null);
    const r = await fetch('/api/admin/petal-shop/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    const j = await r.json();
    if (j?.ok) {
      setEditing(null);
      load();
      setMsg('Saved');
    } else setMsg(j?.error || 'Save failed');
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="mb-1 text-3xl font-bold text-white">Coupons</h1>
        <p className="mb-4 text-neutral-300">Define coupon SKUs and default templates.</p>

        <div className="mb-4 flex items-center gap-2">
          <button
            onClick={() =>
              setEditing({
                sku: '',
                name: '',
                kind: 'COUPON',
                pricePetals: 0,
                metadata: { coupon: { type: 'PERCENT', amount: 10, ttlDays: 30 } },
              })
            }
            className="rounded bg-pink-600 px-4 py-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            aria-label="Create new coupon template"
          >
            New Coupon SKU
          </button>
          <button
            onClick={load}
            className="rounded border border-white/20 px-3 py-2 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            aria-label="Refresh coupons"
          >
            Refresh
          </button>
          {msg && (
            <span className="text-xs text-neutral-300" role="status" aria-live="polite">
              {msg}
            </span>
          )}
        </div>

        {loading ? (
          <div className="text-neutral-400">Loading...</div>
        ) : coupons.length === 0 ? (
          <div className="rounded-lg border border-white/15 bg-white/5 p-3 text-sm text-zinc-300">
            No coupon items yet.
          </div>
        ) : (
          <div className="grid gap-3" role="list">
            {coupons.map((it) => (
              <div
                key={it.id}
                className="rounded-xl border border-white/10 bg-black/50 p-3"
                role="listitem"
              >
                <div className="flex items-center justify-between">
                  <div className="text-white/90">
                    <div className="font-semibold">
                      {it.name} <span className="text-xs text-neutral-400">({it.sku})</span>
                    </div>
                    <div className="text-xs text-neutral-400">
                      {it.pricePetals ?? 0} petals • {it.metadata?.coupon?.type || 'PERCENT'}{' '}
                      {it.metadata?.coupon?.amount ?? 10} • ttl {it.metadata?.coupon?.ttlDays ?? 30}{' '}
                      days
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(it)}
                      className="rounded border border-white/20 px-3 py-1 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                      aria-label={`Edit ${it.name}`}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="mt-6 max-w-2xl rounded-xl border border-white/10 bg-black/60 p-4">
            <h2 className="mb-3 text-lg font-semibold text-pink-200">
              {editing.id ? 'Edit' : 'New'} Coupon SKU
            </h2>
            <div className="grid gap-3">
              <label className="block text-sm text-neutral-300">
                SKU
                <input
                  value={editing.sku}
                  onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                  className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                  aria-label="Coupon SKU"
                />
              </label>
              <label className="block text-sm text-neutral-300">
                Name
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                  aria-label="Coupon name"
                />
              </label>
              <label className="block text-sm text-neutral-300">
                Price (petals)
                <input
                  type="number"
                  value={editing.pricePetals ?? 0}
                  onChange={(e) =>
                    setEditing({ ...editing, pricePetals: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                  aria-label="Price in petals"
                />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block text-sm text-neutral-300">
                  Type
                  <select
                    value={editing.metadata?.coupon?.type ?? 'PERCENT'}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        metadata: {
                          ...(editing.metadata || {}),
                          coupon: { ...(editing.metadata?.coupon || {}), type: e.target.value },
                        },
                      })
                    }
                    className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Coupon type"
                  >
                    <option value="PERCENT">PERCENT</option>
                    <option value="OFF_AMOUNT">OFF_AMOUNT</option>
                  </select>
                </label>
                <label className="block text-sm text-neutral-300">
                  Amount
                  <input
                    type="number"
                    value={editing.metadata?.coupon?.amount ?? 10}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        metadata: {
                          ...(editing.metadata || {}),
                          coupon: {
                            ...(editing.metadata?.coupon || {}),
                            amount: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Coupon amount"
                  />
                </label>
                <label className="block text-sm text-neutral-300">
                  TTL (days)
                  <input
                    type="number"
                    value={editing.metadata?.coupon?.ttlDays ?? 30}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        metadata: {
                          ...(editing.metadata || {}),
                          coupon: {
                            ...(editing.metadata?.coupon || {}),
                            ttlDays: parseInt(e.target.value) || 0,
                          },
                        },
                      })
                    }
                    className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15 focus-visible:ring-2 focus-visible:ring-pink-400"
                    aria-label="Coupon expiration days"
                  />
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onSave}
                  className="rounded bg-pink-600 px-4 py-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  aria-label="Save coupon"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded border border-white/20 px-4 py-2 text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
