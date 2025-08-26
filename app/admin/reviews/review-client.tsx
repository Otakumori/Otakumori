/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { appUrl } from "@/lib/canonical";

type Review = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title: string | null;
  body: string;
  imageUrls: string[];
  createdAt: string;
};

export default function AdminReviewsClient() {
  const [items, setItems] = useState<Review[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const take = 20;

  async function loadPage(next?: string | null) {
    setLoading(true);
    const url = new URL("/api/admin/reviews", appUrl());
    url.searchParams.set("take", String(take));
    if (next) url.searchParams.set("cursor", next);

    const res = await fetch(url.toString(), { cache: "no-store" });
    const json = await res.json();
    if (json.ok) {
      if (!next) setItems(json.items);
      else setItems((prev) => [...prev, ...json.items]);
      setCursor(json.nextCursor);
    }
    setLoading(false);
  }

  useEffect(() => { loadPage(null); }, [null]);

  async function approve(id: string) {
    const res = await fetch(`/api/admin/reviews/${id}/approve`, { method: "POST" });
    if (res.ok) setItems(prev => prev.filter(r => r.id !== id));
  }

  async function remove(id: string) {
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) setItems(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div className="space-y-4">
      {items.length === 0 && !loading && (
        <p className="text-sm text-zinc-500">No pending reviews 🎉</p>
      )}

      <ul className="space-y-4">
        {items.map((r) => (
          <li key={r.id} className="rounded-2xl border border-zinc-800/60 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-zinc-400">
                  <span className="font-mono text-xs">#{r.id.slice(0, 8)}</span>
                  {" · "}product:
                  <span className="ml-1 font-mono text-xs">{r.productId}</span>
                  {" · "}user:
                  <span className="ml-1 font-mono text-xs">{r.userId}</span>
                </div>
                <div className="mt-1 text-yellow-400">{r.rating} ★</div>
                {r.title && <div className="mt-1 font-medium">{r.title}</div>}
                <p className="mt-2 whitespace-pre-wrap text-sm">{r.body}</p>
                {r.imageUrls?.length > 0 && (
                  <div className="mt-3 flex gap-3">
                    {r.imageUrls.map((u) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={u}
                        src={u}
                        alt="review"
                        className="h-20 w-20 rounded-lg border border-zinc-700 object-cover"
                      />
                    ))}
                  </div>
                )}
                <div className="mt-2 text-xs text-zinc-500">
                  {new Date(r.createdAt).toLocaleString()}
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-2">
                <button
                  onClick={() => approve(r.id)}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium hover:bg-emerald-500"
                >
                  Approve
                </button>
                <button
                  onClick={() => remove(r.id)}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {cursor && (
        <button
          disabled={loading}
          onClick={() => loadPage(cursor)}
          className="rounded-md border border-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-900"
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      )}
    </div>
  );
}
