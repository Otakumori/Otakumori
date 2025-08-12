import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.otaku-mori.com';
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile',
          '/checkout/',
          '/cart/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile',
          '/checkout/',
          '/cart/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/profile',
          '/checkout/',
          '/cart/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
