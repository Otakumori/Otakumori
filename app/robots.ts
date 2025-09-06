import { type MetadataRoute } from 'next';
import { env } from '@/env';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://www.otaku-mori.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop', '/mini-games', '/blog', '/about', '/search'],
        disallow: [
          '/sign-in',
          '/sign-up',
          '/account',
          '/admin',
          '/api/admin',
          '/api/clerk',
          '/api/stripe',
          '/api/debug',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
