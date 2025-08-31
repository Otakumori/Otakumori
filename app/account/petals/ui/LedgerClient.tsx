/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';

type Row = {
  id: string;
  type: 'EARN' | 'SPEND' | 'ADJUST';
  amount: number;
  balance: number;
  reason: string;
  metadata?: any;
  createdAt: string;
};

export default function LedgerClient() {
  const [rows, setRows] = useState<Row[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [type, setType] = useState<'ALL' | 'EARN' | 'SPEND' | 'ADJUST'>('ALL');
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function load(next?: boolean) {
    if (loading) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', '25');
    params.set('type', type);
    if (next && cursor) params.set('cursor', cursor);
    const res = await fetch(`/api/petals/ledger?${params.toString()}`, { cache: 'no-store' });
    const data = await res.json();
    if (res.ok && data.ok) {
      setRows((prev) => (next ? [...prev, ...data.items] : data.items));
      setCursor(data.nextCursor);
      setHasMore(Boolean(data.nextCursor));
    }
    setLoading(false);
  }

  useEffect(() => {
    load(false);
  }, [type]);

  return (
    <div className="rounded-2xl ring-1 ring-neutral-200 bg-white">
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="font-medium">History</div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600">Filter</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="text-sm rounded-lg border border-neutral-300 px-2 py-1"
          >
            <option value="ALL">All</option>
            <option value="EARN">Earn</option>
            <option value="SPEND">Spend</option>
            <option value="ADJUST">Adjust</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-neutral-100">
        {rows.length === 0 && <div className="p-6 text-neutral-500 text-sm">No activity yet.</div>}
        {rows.map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">
                {labelForReason(r.reason)} {r.metadata?.sku ? `• ${r.metadata.sku}` : ''}
              </div>
              <div className="text-xs text-neutral-500">
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
            <div
              className={`text-sm font-semibold ${r.type === 'SPEND' ? 'text-rose-600' : r.type === 'EARN' ? 'text-green-700' : 'text-neutral-700'}`}
            >
              {r.type === 'SPEND' ? `−${r.amount}` : `+${r.amount}`}
              <span className="ml-3 text-xs text-neutral-500">→ {r.balance}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-neutral-200 flex justify-center">
        {hasMore ? (
          <button
            onClick={() => load(true)}
            disabled={loading}
            className="rounded-xl bg-pink-600 text-white px-4 py-1.5 text-sm hover:bg-pink-500 disabled:opacity-50"
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        ) : (
          <div className="text-xs text-neutral-500">End of history</div>
        )}
      </div>
    </div>
  );
}

function labelForReason(reason: string) {
  switch (reason) {
    case 'PETAL_CLICK':
      return 'Petal click';
    case 'CRIT_DROP':
      return 'Critical drop';
    case 'SHOP_PURCHASE':
      return 'Shop purchase';
    case 'REFUND':
      return 'Refund';
    case 'ADMIN_ADJUST':
      return 'Admin adjustment';
    case 'ACHIEVEMENT':
      return 'Achievement';
    case 'BONUS_EVENT':
      return 'Bonus event';
    default:
      return reason
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/(^|\s)\S/g, (s) => s.toUpperCase());
  }
}
