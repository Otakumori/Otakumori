/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/lib/shop';

const CATS = {
  apparel: ['tops', 'bottoms', 'unmentionables', 'kicks'],
  accessories: ['pins', 'hats', 'bows'],
  'home-decor': ['cups', 'pillows', 'stickers'],
} as const;

export async function generateStaticParams() {
  return Object.entries(CATS).flatMap(([category, subs]) =>
    subs.map((subcategory) => ({ category, subcategory })),
  );
}

export default async function CategoryPage({ params, searchParams }: any) {
  const { category, subcategory } = params as { category: string; subcategory: string };
  const page = Number(searchParams?.page ?? 1);
  const { data, count, pageSize } = await getProducts({ category, subcategory, page });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-xl font-semibold capitalize">
          {category.replace('-', ' ')} • {subcategory}
        </h1>
        <p className="text-neutral-400 text-sm mb-4">{count} items</p>

        <ul className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {data.map((p: any) => (
            <li
              key={p.id}
              className="rounded-xl border border-white/10 hover:border-pink-400/30 p-3"
            >
              <Link href={`/shop/product/${p.id}`}>
                <div className="aspect-square relative mb-2 overflow-hidden rounded-lg bg-neutral-900">
                  {p.image_url && (
                    <Image src={p.image_url} alt={p.title} fill className="object-cover" />
                  )}
                </div>
                <div className="text-sm font-medium line-clamp-2">{p.title}</div>
                {p.price_cents != null && (
                  <div className="text-sm text-neutral-400 mt-0.5">
                    ${(p.price_cents / 100).toFixed(2)}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* simple pager */}
        {count > pageSize && (
          <div className="flex gap-2 mt-6">
            {page > 1 && (
              <Link className="underline" href={`?page=${page - 1}`}>
                Prev
              </Link>
            )}
            {page * pageSize < count && (
              <Link className="underline" href={`?page=${page + 1}`}>
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
