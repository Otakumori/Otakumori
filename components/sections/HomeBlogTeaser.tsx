// components/sections/HomeBlogTeaser.tsx
import Image from 'next/image';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  image?: string;
  date?: string;
};

export default async function HomeBlogTeaser() {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const res = await fetch(`${base}/api/blog/latest?limit=3`, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const data = await res.json();
  const posts: Post[] = (data.posts ?? []).slice(0, 3).map((p: any) => ({
    id: String(p.id ?? p.slug),
    slug: p.slug ?? String(p.id),
    title: p.title,
    excerpt: p.excerpt ?? p.summary ?? '',
    image: p.image ?? p.cover ?? '',
    date: p.date ?? p.publishedAt ?? '',
  }));
  if (!posts.length) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => (
        <a
          key={p.id}
          href={`/blog/${p.slug}`}
          className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition
                     overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <div className="relative aspect-[4/3]">
            {p.image && (
              <Image
                src={p.image}
                alt={p.title}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
            )}
          </div>
          <div className="p-4">
            <div className="font-semibold text-pink-100 line-clamp-2">{p.title}</div>
            {p.date && (
              <div className="mt-1 text-xs text-pink-200/60">
                {new Date(p.date).toLocaleDateString()}
              </div>
            )}
            {p.excerpt && <p className="mt-2 text-sm text-pink-200/80 line-clamp-2">{p.excerpt}</p>}
          </div>
        </a>
      ))}
    </div>
  );
}
