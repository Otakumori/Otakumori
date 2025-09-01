 
 
import Head from 'next/head';
import { appUrl } from '@/lib/canonical';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  product?: {
    name: string;
    description: string;
    price: string;
    currency: string;
    image: string;
    availability: 'in stock' | 'out of stock';
  };
}

export function SEO({
  title = 'Otakumori - Small-batch anime-inspired apparel, accessories & home decor',
  description = 'Discover unique anime-inspired merchandise crafted with passion. From apparel to accessories and home decor, join our vibrant otaku community.',
  image = '/assets/images/og-default.jpg',
  url = appUrl(),
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  product,
}: SEOProps) {
  const fullTitle = title === 'Otakumori' ? title : `${title} | Otakumori`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Otakumori" />
      <meta name="theme-color" content="#ec4899" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Otakumori" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@otakumori" />

      {/* Article specific meta tags */}
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Product specific meta tags */}
      {type === 'product' && product && (
        <>
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content={product.currency} />
          <meta property="product:availability" content={product.availability} />
        </>
      )}

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

      {/* Preload critical resources */}
      <link rel="preload" href="/assets/tree.png" as="image" />
      <link rel="preload" href="/assets/circlelogo.png" as="image" />

      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Structured Data */}
      {product && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Product',
              name: product.name,
              description: product.description,
              image: product.image,
              offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: product.currency,
                availability: `https://schema.org/${product.availability.replace(' ', '')}`,
                seller: {
                  '@type': 'Organization',
                  name: 'Otakumori',
                },
              },
            }),
          }}
        />
      )}

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Otakumori',
            url: appUrl(),
            logo: `${appUrl()}/assets/circlelogo.png`,
            description: 'Small-batch anime-inspired apparel, accessories & home decor',
            sameAs: [
              'https://twitter.com/otakumori',
              'https://instagram.com/otakumori',
              'https://discord.gg/otakumori',
            ],
          }),
        }}
      />
    </Head>
  );
}
