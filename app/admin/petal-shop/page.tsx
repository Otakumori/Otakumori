"use client";
import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminNav';

type Item = {
  id?: string;
  sku: string;
  name: string;
  kind: string;
  pricePetals?: number | null;
  eventTag?: string | null;
  visibleFrom?: string | null;
  visibleTo?: string | null;
  metadata?: any;
};

export default function AdminPetalShopPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/admin/petal-shop/items');
    const j = await r.json();
    if (j?.ok) setItems(j.data.items);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const onSave = async () => {
    if (!editing) return;
    setMsg(null);
    const r = await fetch('/api/admin/petal-shop/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing),
    });
    const j = await r.json();
    if (j?.ok) { setEditing(null); load(); setMsg('Saved'); } else setMsg(j?.error || 'Save failed');
  };
  const onDelete = async (id?: string) => {
    if (!id) return;
    if (!confirm('Delete this item?')) return;
    await fetch(`/api/admin/petal-shop/items?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="mb-4 text-3xl font-bold text-white">Petal Shop Manager</h1>
        <p className="mb-6 text-neutral-300">Create and edit digital unlockables and coupons.</p>
        <div className="mb-4 flex items-center gap-2">
          <button onClick={() => setEditing({ sku: '', name: '', kind: 'COSMETIC', pricePetals: 0, metadata: {} })} className="rounded bg-pink-600 px-4 py-2 text-white">New Item</button>
          <button onClick={load} className="rounded border border-white/20 px-3 py-2 text-white/80">Refresh</button>
          {msg && <span className="text-xs text-neutral-300">{msg}</span>}
        </div>

        {loading ? (
          <div className="text-neutral-400">Loading…</div>
        ) : (
          <div className="grid gap-3">
            {items.map((it) => (
              <div key={it.id} className="rounded-xl border border-white/10 bg-black/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-white/90">
                    <div className="font-semibold">{it.name} <span className="text-xs text-neutral-400">({it.sku})</span></div>
                    <div className="text-xs text-neutral-400">{it.kind} • {it.pricePetals ?? 0} petals</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setEditing(it)} className="rounded border border-white/20 px-3 py-1 text-white/80">Edit</button>
                    <button onClick={() => onDelete(it.id)} className="rounded border border-red-400/40 px-3 py-1 text-red-300">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="mt-6 max-w-2xl rounded-xl border border-white/10 bg-black/60 p-4">
            <h2 className="mb-3 text-lg font-semibold text-pink-200">{editing.id ? 'Edit' : 'New'} Item</h2>
            <div className="grid gap-3">
              <label className="block text-sm text-neutral-300">SKU
                <input value={editing.sku} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15" />
              </label>
              <label className="block text-sm text-neutral-300">Name
                <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15" />
              </label>
              <label className="block text-sm text-neutral-300">Kind
                <select value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value })} className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15">
                  {['COSMETIC','OVERLAY','TEXT','CURSOR','COUPON'].map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </label>
              <label className="block text-sm text-neutral-300">Price (petals)
                <input type="number" value={editing.pricePetals ?? 0} onChange={(e) => setEditing({ ...editing, pricePetals: parseInt(e.target.value) || 0 })} className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15" />
              </label>
              <label className="block text-sm text-neutral-300">Event Tag
                <input value={editing.eventTag ?? ''} onChange={(e) => setEditing({ ...editing, eventTag: e.target.value })} className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm text-neutral-300">Visible From
                  <input type="datetime-local" value={editing.visibleFrom ?? ''} onChange={(e) => setEditing({ ...editing, visibleFrom: e.target.value })} className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15" />
                </label>
                <label className="block text-sm text-neutral-300">Visible To
                  <input type="datetime-local" value={editing.visibleTo ?? ''} onChange={(e) => setEditing({ ...editing, visibleTo: e.target.value })} className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15" />
                </label>
              </div>
              <label className="block text-sm text-neutral-300">Preview URL
                <input value={editing.metadata?.previewUrl ?? ''} onChange={(e) => setEditing({ ...editing, metadata: { ...(editing.metadata || {}), previewUrl: e.target.value } })} className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15" />
              </label>
              <label className="block text-sm text-neutral-300">Description
                <textarea value={editing.metadata?.description ?? ''} onChange={(e) => setEditing({ ...editing, metadata: { ...(editing.metadata || {}), description: e.target.value } })} className="mt-1 w-full min-h-[80px] rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15" />
              </label>
              {editing.kind === 'COUPON' && (
                <div className="grid grid-cols-3 gap-3">
                  <label className="block text-sm text-neutral-300">Coupon Type
                    <select value={editing.metadata?.coupon?.type ?? 'PERCENT'} onChange={(e) => setEditing({ ...editing, metadata: { ...(editing.metadata || {}), coupon: { ...(editing.metadata?.coupon || {}), type: e.target.value } } })} className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15">
                      <option value="PERCENT">PERCENT</option>
                      <option value="OFF_AMOUNT">OFF_AMOUNT</option>
                    </select>
                  </label>
                  <label className="block text-sm text-neutral-300">Amount
                    <input type="number" value={editing.metadata?.coupon?.amount ?? 10} onChange={(e) => setEditing({ ...editing, metadata: { ...(editing.metadata || {}), coupon: { ...(editing.metadata?.coupon || {}), amount: parseInt(e.target.value) || 0 } } })} className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15" />
                  </label>
                  <label className="block text-sm text-neutral-300">Expires (days)
                    <input type="number" value={editing.metadata?.coupon?.ttlDays ?? 30} onChange={(e) => setEditing({ ...editing, metadata: { ...(editing.metadata || {}), coupon: { ...(editing.metadata?.coupon || {}), ttlDays: parseInt(e.target.value) || 0 } } })} className="mt-1 w-full rounded bg-black/40 px-2 py-1 text-white outline-none ring-1 ring-white/15" />
                  </label>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button onClick={onSave} className="rounded bg-pink-600 px-4 py-2 text-white">Save</button>
                <button onClick={() => setEditing(null)} className="rounded border border-white/20 px-4 py-2 text-white/80">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

