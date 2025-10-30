// components/sections/HomeShopGrid.tsx
import Image from 'next/image';

type PrintifyItem = {
  id: string;
  title: string;
  image: string;
  priceUsd?: number;
};

async function fetchPrintify(): Promise<PrintifyItem[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const res = await fetch(`${base}/api/v1/printify/products`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('printify');
  const data = await res.json();
  return (data.items ?? []).map((it: any) => ({
    id: String(it.id),
    title: it.title,
    image: it.images?.[0]?.src ?? it.image ?? '',
    priceUsd: it.priceUsd ?? it.variants?.[0]?.priceUsd ?? undefined,
  }));
}

async function fetchInternal(): Promise<PrintifyItem[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const res = await fetch(`${base}/api/products?limit=12`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('internal');
  const data = await res.json();
  return (data.items ?? []).map((it: any) => ({
    id: String(it.id),
    title: it.title,
    image: it.image ?? it.images?.[0] ?? '',
    priceUsd: it.priceUsd ?? it.price ?? undefined,
  }));
}

export default async function HomeShopGrid() {
  let items: PrintifyItem[] = [];
  try {
    items = await fetchPrintify();
    if (!items.length) items = await fetchInternal();
  } catch {
    try {
      items = await fetchInternal();
    } catch {}
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-pink-200">
        No featured products yet.
        <a href="/shop" className="ml-2 underline decoration-pink-400 hover:opacity-90">
          Explore Shop
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.slice(0, 9).map((it) => (
        <a
          key={it.id}
          href={`/shop/${it.id}`}
          className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition
                     overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <div className="relative aspect-[4/3]">
            {it.image && (
              <Image
                src={it.image}
                alt={it.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="p-4">
            <div className="line-clamp-2 font-semibold text-pink-100">{it.title}</div>
            {typeof it.priceUsd === 'number' && (
              <div className="mt-2 text-sm text-pink-200/80">${(it.priceUsd / 100).toFixed(2)}</div>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
