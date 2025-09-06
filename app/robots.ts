import { type MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://otaku-mori.com'; // eslint-disable-line no-restricted-syntax

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
