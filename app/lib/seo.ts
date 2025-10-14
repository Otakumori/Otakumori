import type { Metadata } from 'next';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  price?: number;
  currency?: string;
}

export function generateSEO({
  title,
  description,
  image = '/assets/images/og-default.png',
  url,
  type = 'website',
  price,
  currency = 'USD',
}: SEOProps): Metadata {
  const siteName = 'Otaku-mori';
  const fullTitle = `${title} | ${siteName}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://otakumori.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: type === 'product' ? 'website' : type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      creator: '@otakumori',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };

  // Product metadata handled above (OpenGraph doesn't have product type, so we use website)

  return metadata;
}

export const defaultSEO: Metadata = generateSEO({
  title: 'Welcome Home, Traveler',
  description: 'Anime x gaming shop + play — petals, runes, rewards.',
});
