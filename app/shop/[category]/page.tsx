/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';

const SUBS = {
  apparel: ['tops', 'bottoms', 'unmentionables', 'kicks'],
  accessories: ['pins', 'hats', 'bows'],
  'home-decor': ['cups', 'pillows', 'stickers'],
} as const;

export default function CategoryIndex({ params }: any) {
  const { category } = params as { category: keyof typeof SUBS };
  const subs = SUBS[category] ?? [];
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-xl font-semibold capitalize">{category.replace('-', ' ')}</h1>
        <ul className="mt-4 grid gap-3 grid-cols-2 md:grid-cols-3">
          {subs.map((s) => (
            <li key={s}>
              <Link className="underline" href={`/shop/${category}/${s}`}>
                {s}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
