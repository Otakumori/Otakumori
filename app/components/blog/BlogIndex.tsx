import Link from 'next/link';
import Image from 'next/image';
import { MoriSystemState } from '../mori/MoriProduction';

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
      <MoriSystemState
        state="empty"
        title="No stories have been posted yet"
        description="The archive will open when the first entry is published."
      />
    );
  }

  const [lead, ...rest] = posts;

  return (
    <div className="discovery-stories">
      {lead && (
        <article className="discovery-story discovery-story--lead">
          <Link href={`/blog/${lead.slug}`} className="discovery-story__link discovery-story__link--lead">
            <div className="discovery-story__copy">
              <p className="discovery-story__index">Latest record</p>
              <h2>
                {lead.title}
              </h2>
              {lead.excerpt && <p className="discovery-story__excerpt">{lead.excerpt}</p>}
              <div className="discovery-story__meta">
                {lead.publishedAt && <span>{new Date(lead.publishedAt).toLocaleDateString()}</span>}
                {lead.readTime && <span>{lead.readTime} min read</span>}
                {lead.author && <span>by {lead.author}</span>}
              </div>
            </div>
            <div className="discovery-story__media">
              {lead.image ? (
                <Image src={lead.image} alt={lead.title} fill sizes="(max-width:1024px) 100vw, 45vw" className="object-cover" priority />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(220,160,179,0.11),transparent_34%),radial-gradient(circle_at_70%_70%,rgba(169,133,95,0.08),transparent_30%),linear-gradient(145deg,#120d12,#070608)]" aria-hidden="true" />
              )}
            </div>
          </Link>
        </article>
      )}

      {rest.length > 0 && (
        <div className="discovery-stories__index">
          {rest.map((post) => (
            <article key={post.id} className="discovery-story">
              <Link href={`/blog/${post.slug}`} className="discovery-story__link">
                <div className="discovery-story__media discovery-story__media--index">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                      className="object-cover discovery-story__image"
                      loading="lazy"
                      quality={85}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(169,133,95,0.08),transparent_35%),linear-gradient(145deg,#100b10,#080708)]" aria-hidden="true" />
                  )}
                </div>

                <div className="discovery-story__copy discovery-story__copy--index">
                  <h3>{post.title}</h3>
                  {post.excerpt && <p className="discovery-story__excerpt">{post.excerpt}</p>}
                  <div className="discovery-story__meta">
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
