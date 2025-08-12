import Link from 'next/link';
import Image from 'next/image';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const metadata = { title: 'Blog • Otaku-Mori' };

export default async function BlogIndex() {
  const sb = supabaseAdmin();
  const { data: posts } = await sb
    .from('posts')
    .select('slug,title,excerpt,cover_url,published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Blog</h1>
        <ul className="grid gap-6">
          {(posts ?? []).map((p) => (
            <li key={p.slug} className="rounded-xl border border-white/10 hover:border-pink-400/30 transition">
              <Link href={`/blog/${p.slug}`} className="flex gap-4 p-4">
                {p.cover_url ? (
                  <Image src={p.cover_url} alt="" width={120} height={80} className="rounded-md object-cover" />
                ) : null}
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-sm text-neutral-400">{p.excerpt}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}