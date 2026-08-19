import Link from 'next/link';
import Image from 'next/image';
import GlassPanel from '../GlassPanel';

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  publishedAt?: string;
  image?: string;
  author?: string;
  readTime?: number;
};

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`/api/v1/content/blog?limit=12`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return [];
    const json = await response.json();
    if (json.ok && json.data?.posts && Array.isArray(json.data.posts)) return json.data.posts;
    return [];
  } catch {
    return [];
  }
}

export default async function BlogIndex() {
  const posts = await getBlogPosts();

  if (posts.length === 0) {
    return (
      <div className="mori-panel-soft py-12 text-center">
        <h2 className="font-display text-xl font-semibold text-[#fff1e4]">No stories have been posted yet.</h2>
        <p className="mt-2 text-sm text-[#8f7f7d]">The archive will open when the first entry is published.</p>
      </div>
    );
  }

  const [lead, ...rest] = posts;

  return (
    <div className="space-y-8">
      {lead && (
        <GlassPanel className="overflow-hidden">
          <Link href={`/blog/${lead.slug}`} className="grid min-h-64 gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col justify-end p-6 sm:p-8 lg:p-10">
              <h2 className="font-display max-w-2xl text-3xl font-semibold leading-tight text-[#fff1e4] sm:text-4xl">
                {lead.title}
              </h2>
              {lead.excerpt && <p className="mt-4 max-w-2xl text-base leading-7 text-[#cdbbb7]">{lead.excerpt}</p>}
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#8f7f7d]">
                {lead.publishedAt && <span>{new Date(lead.publishedAt).toLocaleDateString()}</span>}
                {lead.readTime && <span>{lead.readTime} min read</span>}
                {lead.author && <span>by {lead.author}</span>}
              </div>
            </div>
            <div className="relative min-h-48 border-t border-white/[0.07] lg:border-l lg:border-t-0">
              {lead.image ? (
                <Image src={lead.image} alt={lead.title} fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover" priority />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(220,160,179,0.11),transparent_34%),radial-gradient(circle_at_70%_70%,rgba(169,133,95,0.08),transparent_30%),linear-gradient(145deg,#120d12,#070608)]" aria-hidden="true" />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09070a]/30 via-transparent to-transparent" aria-hidden="true" />
            </div>
          </Link>
        </GlassPanel>
      )}

      {rest.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <article key={post.id} className="mori-panel-soft group overflow-hidden transition-colors hover:border-white/[0.14]">
              <Link href={`/blog/${post.slug}`} className="flex h-full flex-col">
                <div className="relative aspect-[16/9] overflow-hidden border-b border-white/[0.07]">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                      loading="lazy"
                      quality={85}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(169,133,95,0.08),transparent_35%),linear-gradient(145deg,#100b10,#080708)]" aria-hidden="true" />
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold leading-snug text-[#fff1e4]">{post.title}</h3>
                  {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#cdbbb7]/82">{post.excerpt}</p>}
                  <div className="mt-auto flex flex-wrap justify-between gap-3 border-t border-white/[0.07] pt-5 text-xs text-[#8f7f7d]">
                    <div className="flex items-center gap-2">
                      {post.publishedAt && <span>{new Date(post.publishedAt).toLocaleDateString()}</span>}
                      {post.readTime && <span>· {post.readTime} min</span>}
                    </div>
                    {post.author && <span>{post.author}</span>}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
