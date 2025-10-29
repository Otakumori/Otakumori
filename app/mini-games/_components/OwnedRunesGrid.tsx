'use client';

import RuneGlyph from '@/components/runes/RuneGlyph';
import { type CanonicalRuneId } from '@/types/runes';
import { motion } from 'framer-motion';
import useSWR from 'swr';

type InventoryItem = {
  id: string;
  canonicalId: CanonicalRuneId;
  displayName?: string | null;
  glyph?: string | null;
  lore?: string | null;
  quantity: number;
};

type InventoryResponse = { ok: boolean; items?: InventoryItem[]; code?: string; message?: string };

export default function OwnedRunesGrid() {
  const { data, error } = useSWR<InventoryResponse>('/api/trade/inventory', (u) =>
    fetch(u, { headers: { 'x-request-id': `req_${Date.now()}` } }).then((r) => r.json()),
  );
  const isLoading = !data && !error;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-lg border border-white/10 bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error || !data?.ok) {
    return (
      <div className="text-sm text-red-300" role="alert">
        Failed to load runes.
      </div>
    );
  }

  const items = data.items ?? [];
  if (items.length === 0) {
    return <div className="text-sm text-zinc-300">You have not discovered any runes yet.</div>;
  }

  return (
    <div>
      <div className="mb-2 text-xs text-zinc-400">
        Tip: fuse 2+ runes in Trade Center to discover new ones.
      </div>
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
        data-testid="runes-grid"
      >
        {items.map((it) => (
          <motion.div
            key={it.canonicalId}
            className="group rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition-colors"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="text-2xl">
                <RuneGlyph
                  canonicalId={it.canonicalId}
                  {...(it.glyph != null ? { glyph: it.glyph } : {})}
                  {...(it.displayName != null ? { displayName: it.displayName } : {})}
                  size="sm"
                  animated={true}
                />
              </div>
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-200">
                Ã—{it.quantity}
              </span>
            </div>
            <div
              className="mt-1 truncate text-xs text-zinc-300"
              title={it.displayName ?? it.canonicalId}
            >
              {it.displayName ?? it.canonicalId}
            </div>
            {it.lore && (
              <div
                className="mt-1 hidden text-[10px] text-zinc-400 group-hover:block"
                aria-live="polite"
              >
                {it.lore}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
