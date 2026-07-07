'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Archive, Eye, EyeOff, RefreshCw, Search, type LucideIcon } from 'lucide-react';

type ProductStatus = 'visible' | 'hidden' | 'archived';
type ProductAction = 'hide' | 'restore' | 'archive';

type ManagedProduct = {
  id: string;
  title: string;
  image: string | null;
  provider: 'printify' | 'merchize' | 'internal';
  status: ProductStatus;
  active: boolean;
  visible: boolean;
  available: boolean;
  sellableVariantCount: number;
  historicalOrderCount: number;
  printifyProductId: string | null;
  integrationRef: string | null;
  updatedAt: string;
  lastSyncedAt: string | null;
};

type ProductsResponse = {
  ok: boolean;
  error?: string;
  requestId?: string;
  data?: { products: ManagedProduct[] };
};

const actionCopy: Record<ProductAction, { label: string; detail: string; icon: LucideIcon }> = {
  hide: {
    label: 'Hide from shop',
    detail:
      'Removes the selected products from public catalog and product detail responses. Provider products are not changed.',
    icon: EyeOff,
  },
  restore: {
    label: 'Restore to shop',
    detail:
      'Makes the selected products public again. This only changes the Otaku-mori storefront state.',
    icon: Eye,
  },
  archive: {
    label: 'Archive locally',
    detail:
      'Keeps products and order references in the database, but removes them from storefront visibility. This does not delete provider products.',
    icon: Archive,
  },
};

function statusBadge(status: ProductStatus) {
  switch (status) {
    case 'visible':
      return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200';
    case 'hidden':
      return 'border-amber-400/30 bg-amber-500/15 text-amber-100';
    case 'archived':
      return 'border-zinc-400/30 bg-zinc-500/15 text-zinc-200';
  }
}

export default function ProductManagementClient() {
  const [products, setProducts] = useState<ManagedProduct[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [provider, setProvider] = useState('all');
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState<ProductAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (status !== 'all') params.set('status', status);
    if (provider !== 'all') params.set('provider', provider);

    try {
      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const body = (await response.json()) as ProductsResponse;
      if (!response.ok || !body.ok) {
        throw new Error(body.error || `Failed to load products (${response.status})`);
      }
      setProducts(body.data?.products ?? []);
      setSelectedIds(new Set());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [provider, query, status]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function toggleProduct(productId: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((current) =>
      current.size === products.length ? new Set() : new Set(products.map((product) => product.id)),
    );
  }

  async function runAction(action: ProductAction) {
    if (selectedIds.size === 0 || mutating) return;
    setMutating(action);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, productIds: Array.from(selectedIds) }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body.error || `Action failed (${response.status})`);
      }
      setMessage(
        `${actionCopy[action].label}: ${body.data.updatedCount} product(s) updated locally.`,
      );
      await loadProducts();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Product action failed');
    } finally {
      setMutating(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-pink-300/20 bg-black/40 p-5 text-sm text-pink-50/80">
        <h2 className="text-lg font-semibold text-pink-100">Safe storefront controls</h2>
        <p className="mt-2 max-w-3xl">
          These actions only change Otaku-mori database visibility. They do not delete, update,
          publish, unpublish, or otherwise mutate Printify or future Merchize provider records.
          Historical order references remain intact.
        </p>
      </section>

      <section className="grid gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 lg:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pink-200/50" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void loadProducts();
            }}
            placeholder="Search title or provider ID"
            className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none focus:border-pink-300/60"
          />
        </label>
        <select
          value={provider}
          onChange={(event) => setProvider(event.target.value)}
          className="h-11 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-white"
        >
          <option value="all">All providers</option>
          <option value="printify">Printify</option>
          <option value="merchize">Merchize</option>
          <option value="internal">Internal</option>
        </select>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-11 rounded-xl border border-white/10 bg-zinc-950 px-3 text-sm text-white"
        >
          <option value="all">All statuses</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
          <option value="archived">Archived</option>
        </select>
        <button
          type="button"
          onClick={() => void loadProducts()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-pink-300/30 px-4 text-sm font-medium text-pink-100 hover:bg-pink-300/10"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </section>

      {error ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/15 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/15 p-4 text-sm text-emerald-100">
          {message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-black/35">
        <div className="flex flex-col gap-4 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-white/70">
            {loading ? 'Loading products...' : `${products.length} product(s) loaded`}
            {selectedIds.size > 0 ? ` - ${selectedIds.size} selected` : ''}
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(actionCopy) as ProductAction[]).map((action) => {
              const Icon = actionCopy[action].icon;
              return (
                <button
                  key={action}
                  type="button"
                  disabled={selectedIds.size === 0 || Boolean(mutating)}
                  onClick={() => void runAction(action)}
                  title={actionCopy[action].detail}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/85 transition hover:border-pink-300/40 hover:bg-pink-300/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Icon className="h-4 w-4" />
                  {mutating === action ? 'Working...' : actionCopy[action].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.16em] text-pink-100/70">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.size === products.length}
                    onChange={toggleAll}
                    aria-label="Select all products"
                  />
                </th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Public status</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Last sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {products.map((product) => (
                <tr key={product.id} className="text-white/80">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleProduct(product.id)}
                      aria-label={`Select ${product.title}`}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex min-w-[260px] items-center gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium text-white">{product.title}</p>
                        <p className="mt-1 max-w-xs truncate text-xs text-white/45">
                          {product.printifyProductId ?? product.integrationRef ?? product.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 capitalize">{product.provider}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs ${statusBadge(product.status)}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {product.available
                      ? `${product.sellableVariantCount} sellable`
                      : 'No sellable variants'}
                  </td>
                  <td className="px-4 py-4">
                    {product.historicalOrderCount > 0
                      ? `${product.historicalOrderCount} historical`
                      : 'none'}
                  </td>
                  <td className="px-4 py-4 text-white/60">
                    {product.lastSyncedAt ? new Date(product.lastSyncedAt).toLocaleString() : 'n/a'}
                  </td>
                </tr>
              ))}
              {!loading && products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-white/60">
                    No products match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
