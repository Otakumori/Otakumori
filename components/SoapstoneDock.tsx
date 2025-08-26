/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const fetcher = (u: string) => fetch(u).then(r => r.json());

export default function SoapstoneDock() {
  const { data, mutate } = useSWR("/api/soapstones", fetcher, {
    refreshInterval: 15_000
  });

  const list = data?.list ?? [];
  const meLikes: Record<string, true> = data?.meLikes ?? {};

  // Masonry-ish: 3 columns with gentle random rotation (from server)
  const cols = 3;
  const buckets: typeof list[] = Array.from({ length: cols }, () => []);

  list.forEach((m: any, i: number) => buckets[i % cols].push(m));

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 -translate-x-1/2 w-[min(1100px,95vw)]">
      <div className="grid grid-cols-3 gap-3">
        {buckets.map((items, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {items.map((m: any) => (
                <motion.div
                  key={m.id}
                  initial={{ y: 40, opacity: 0, rotate: m.rotation }}
                  animate={{ y: 0, opacity: 1, rotate: m.rotation }}
                  exit={{ y: 40, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className="pointer-events-auto relative rounded-2xl border border-pink-300/30 bg-[#121016]/90 p-3 text-pink-100 shadow-lg"
                  style={{ transformOrigin: "50% 100%" }}
                >
                  {/* overlay filter for rune look (optional) */}
                  <Image
                    src="/assets/ui/soapstonefilter.svg"
                    alt=""
                    width={512}
                    height={256}
                    className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen rounded-2xl"
                  />
                  <div className="relative pr-10">
                    {m.content}
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const prev = data;
                        mutate("/api/soapstones", { 
                          ...prev, 
                          list: prev.list.map((x: any) => 
                            x.id === m.id ? { ...x, upvotes: (x.upvotes || 0) + 1 } : x
                          ),
                          meLikes: { ...prev.meLikes, [m.id]: true }
                        });
                        const res = await fetch(`/api/soapstones/${m.id}/like`, { method: "POST" });
                        if (!res.ok) mutate("/api/soapstones");
                      }}
                      className={`absolute right-2 top-2 rounded-lg border px-2 py-1 text-xs ${meLikes[m.id] ? "border-pink-400 bg-pink-400/20" : "border-pink-300/30 bg-pink-300/10 hover:bg-pink-300/20"}`}
                      aria-label="Upvote"
                      title="Upvote"
                    >
                      ▲ {m.upvotes ?? 0}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
