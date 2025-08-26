/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { getProducts } from '@/lib/shop';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: any) {
  const q = String(searchParams?.q || '').trim();
  const all = await getProducts({ pageSize: 60 }); // simple demo; optimize later
  const data = q ? all.data.filter(p => p.title.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-xl font-semibold">Search</h1>
        {q ? <p className="text-neutral-400 text-sm">Results for "{q}"</p>
            : <p className="text-neutral-400 text-sm">Type in the header search "What're ya buyin?"</p>}
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {data.map((p: any) => (
            <li key={p.id} className="rounded-xl border border-white/10 p-3">
              <Link href={`/product/${p.id}`} className="underline">{p.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
