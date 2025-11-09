import groq from 'groq';

export type SanityDocumentType = 'blogPost' | 'communityPost';

export interface RawSanityStory {
  id: string;
  type: SanityDocumentType;
  title: string;
  slug: string;
  excerpt?: string | null;
  bodyText?: string | null;
  publishedAt?: string | null;
  coverImage?: {
    url?: string | null;
    alt?: string | null;
  } | null;
}

export interface SanityStory {
  id: string;
  type: SanityDocumentType;
  title: string;
  slug: string;
  excerpt?: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
  publishedAt: string;
}

const commonFilters = `[_type in ["blogPost","communityPost"] && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**"))]`;

export const latestStoriesQuery = groq`
*${commonFilters}
| order(publishedAt desc)[$offset...$rangeEnd]{
  "id": _id,
  "type": _type,
  title,
  "slug": slug.current,
  excerpt,
  "bodyText": select(defined(body) => pt::text(body), defined(content) => pt::text(content), ""),
  publishedAt,
  "coverImage": select(
    defined(coverImage.asset) => {
      "url": coverImage.asset->url,
      "alt": coalesce(coverImage.alt, title)
    },
    defined(mainImage.asset) => {
      "url": mainImage.asset->url,
      "alt": coalesce(mainImage.alt, title)
    },
    null
  )
}
`;

export const latestStoriesCountQuery = groq`count(*${commonFilters})`;

export const blogPostsQuery = groq`
*[_type == "blogPost" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**"))]
| order(publishedAt desc)[$offset...$rangeEnd]{
  "id": _id,
  "type": _type,
  title,
  "slug": slug.current,
  excerpt,
  "bodyText": select(defined(body) => pt::text(body), defined(content) => pt::text(content), ""),
  publishedAt,
  "coverImage": select(
    defined(coverImage.asset) => {
      "url": coverImage.asset->url,
      "alt": coalesce(coverImage.alt, title)
    },
    defined(mainImage.asset) => {
      "url": mainImage.asset->url,
      "alt": coalesce(mainImage.alt, title)
    },
    null
  )
}
`;

export const blogPostsCountQuery = groq`
count(*[_type == "blogPost" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**"))])
`;

export const communityPostsQuery = groq`
*[_type == "communityPost" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**"))]
| order(publishedAt desc)[$offset...$rangeEnd]{
  "id": _id,
  "type": _type,
  title,
  "slug": slug.current,
  excerpt,
  "bodyText": select(defined(body) => pt::text(body), defined(content) => pt::text(content), ""),
  publishedAt,
  "coverImage": select(
    defined(coverImage.asset) => {
      "url": coverImage.asset->url,
      "alt": coalesce(coverImage.alt, title)
    },
    defined(mainImage.asset) => {
      "url": mainImage.asset->url,
      "alt": coalesce(mainImage.alt, title)
    },
    null
  )
}
`;

export const communityPostsCountQuery = groq`
count(*[_type == "communityPost" && defined(slug.current) && defined(publishedAt) && !(_id in path("drafts.**"))])
`;

export function mapSanityStory(doc: RawSanityStory): SanityStory | null {
  if (!doc?.id || !doc?.slug || !doc?.title || !doc?.publishedAt || !doc?.type) {
    return null;
  }

  const excerpt =
    (doc.excerpt ?? undefined)?.trim() || (doc.bodyText ?? undefined)?.trim() || undefined;

  return {
    id: doc.id,
    type: doc.type,
    title: doc.title,
    slug: doc.slug,
    excerpt,
    coverImageUrl: doc.coverImage?.url ?? undefined,
    coverImageAlt: doc.coverImage?.alt ?? undefined,
    publishedAt: doc.publishedAt,
  };
}

