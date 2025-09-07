// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { appUrl } from '@/lib/canonical';
import { headers } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type CollectionConfig = {
  title: string;
  description: string;
  hero: string;
  products: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    imageId: string;
    tags: string[];
  }>;
  ogImage: string;
};

const COLLECTIONS: Record<string, CollectionConfig> = {
  'gamecube-nostalgia': {
    title: 'GameCube Nostalgia Collection',
    description:
      'Relive the magic of the early 2000s with our GameCube-inspired UI elements, character portraits, and atmospheric assets.',
    hero: 'Step into a world of vibrant colors, smooth gradients, and that unmistakable GameCube charm. Perfect for games that capture the spirit of Mario Sunshine, Wind Waker, and Pikmin.',
    products: [
      {
        id: 'gc-ui-bundle',
        name: 'GameCube UI Bundle',
        description: 'Complete set of GameCube-style interface elements',
        price: 2499,
        imageId: 'ui.gamecube.bundle',
        tags: ['GameCube', 'UI', 'Bundle', '2000s'],
      },
      {
        id: 'gc-portraits',
        name: 'GameCube Character Portraits',
        description: 'Charming character busts in GameCube aesthetic',
        price: 1899,
        imageId: 'portraits.gamecube.chars',
        tags: ['GameCube', 'Characters', 'Portraits'],
      },
    ],
    ogImage: '/og/gamecube-nostalgia.jpg',
  },
  'ps1-lofi-portraits': {
    title: 'PS1 Lofi Portraits Collection',
    description:
      'Capture the raw, emotional essence of PlayStation 1 era with our lofi character portraits and atmospheric assets.',
    hero: 'Embrace the beauty of low-poly aesthetics, moody lighting, and that distinctive PS1 atmosphere. Ideal for games that channel the spirit of Silent Hill, Resident Evil, and Final Fantasy VII.',
    products: [
      {
        id: 'ps1-lofi-bundle',
        name: 'PS1 Lofi Bundle',
        description: 'Complete collection of PS1-style lofi assets',
        price: 2999,
        imageId: 'ps1.lofi.bundle',
        tags: ['PS1', 'Lofi', 'Bundle', 'Atmospheric'],
      },
      {
        id: 'ps1-portraits',
        name: 'PS1 Character Portraits',
        description: 'Moody character portraits in PS1 style',
        price: 2199,
        imageId: 'portraits.ps1.chars',
        tags: ['PS1', 'Characters', 'Moody'],
      },
    ],
    ogImage: '/og/ps1-lofi-portraits.jpg',
  },
  'kawaii-hud': {
    title: 'Kawaii HUD Collection',
    description:
      'Adorable and charming HUD elements perfect for cute games, visual novels, and wholesome experiences.',
    hero: 'Bring sweetness to your game with our kawaii HUD collection. Soft pastels, rounded corners, and delightful animations that make players smile.',
    products: [
      {
        id: 'kawaii-hud-bundle',
        name: 'Kawaii HUD Bundle',
        description: 'Complete set of adorable interface elements',
        price: 2299,
        imageId: 'hud.kawaii.bundle',
        tags: ['Kawaii', 'HUD', 'Cute', 'Pastel'],
      },
      {
        id: 'kawaii-icons',
        name: 'Kawaii Icon Pack',
        description: 'Sweet and charming icon collection',
        price: 1699,
        imageId: 'icons.kawaii.pack',
        tags: ['Kawaii', 'Icons', 'Sweet'],
      },
    ],
    ogImage: '/og/kawaii-hud.jpg',
  },
  'soulslike-runes': {
    title: 'Soulslike Runes Collection',
    description:
      'Dark, mystical runes and symbols perfect for challenging action RPGs and atmospheric horror games.',
    hero: "Channel the dark energy of soulslike games with our runic collection. Ancient symbols, glowing effects, and mysterious aesthetics that enhance your game's atmosphere.",
    products: [
      {
        id: 'soulslike-runes-bundle',
        name: 'Soulslike Runes Bundle',
        description: 'Complete collection of dark mystical symbols',
        price: 2799,
        imageId: 'runes.soulslike.bundle',
        tags: ['Soulslike', 'Runes', 'Dark', 'Mystical'],
      },
      {
        id: 'soulslike-hud',
        name: 'Soulslike HUD Elements',
        description: 'Dark and atmospheric interface components',
        price: 1999,
        imageId: 'hud.soulslike.elements',
        tags: ['Soulslike', 'HUD', 'Dark', 'Atmospheric'],
      },
    ],
    ogImage: '/og/soulslike-runes.jpg',
  },
};

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = COLLECTIONS[params.slug];

  if (!collection) {
    return {
      title: 'Collection Not Found',
      description: 'The requested collection could not be found.',
    };
  }

  return {
    title: `${collection.title} - Otakumori`,
    description: collection.description,
    openGraph: {
      title: collection.title,
      description: collection.description,
      images: [collection.ogImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: collection.title,
      description: collection.description,
      images: [collection.ogImage],
    },
  };
}

export default function CollectionPage({ params }: Props) {
  const collection = COLLECTIONS[params.slug];
  const nonce = headers().get('x-nonce') ?? undefined;

  if (!collection) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.title,
    description: collection.description,
    url: `${appUrl()}/collections/${params.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: collection.products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          description: product.description,
          offers: {
            '@type': 'Offer',
            price: product.price / 100,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gradient-to-br from-cube-900 via-cube-800 to-slate-900">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slatey-200 mb-6">
              {collection.title}
            </h1>
            <p className="text-xl text-slatey-300 max-w-3xl mx-auto leading-relaxed">
              {collection.hero}
            </p>
          </div>

          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-r from-sakura-500 to-transparent" />
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-slatey-200 mb-12 text-center">
              Featured Assets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collection.products.map((product) => (
                <div
                  key={product.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 hover:border-sakura-400 hover:shadow-glow transition-all duration-300 group"
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-slate-700 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                      <span className="text-6xl text-slatey-300 group-hover:text-sakura-300 transition-colors">
                        🎨
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <h3 className="text-xl font-semibold text-slatey-200 mb-2 group-hover:text-sakura-300 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-slatey-400 mb-4">{product.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-slate-700 text-slatey-300 px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-sakura-400">
                      ${(product.price / 100).toFixed(2)}
                    </span>
                    <button className="bg-sakura-500/20 border border-sakura-400 text-slatey-200 px-4 py-2 rounded-lg hover:bg-sakura-500/30 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-slatey-200 mb-4">
                Ready to Transform Your Game?
              </h2>
              <p className="text-slatey-300 mb-6 text-lg">
                All assets come with multiple resolutions, source files, and are ready to drop into
                your favorite game engine. No attribution required for commercial use.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/play"
                  className="bg-sakura-500/20 border border-sakura-400 text-slatey-200 px-6 py-3 rounded-xl hover:bg-sakura-500/30 transition-colors font-medium"
                >
                  Try the Playground
                </a>
                <a
                  href="/starter-pack"
                  className="bg-slate-700 border border-slate-600 text-slatey-200 px-6 py-3 rounded-xl hover:bg-slate-600 transition-colors font-medium"
                >
                  Get Free Starter Pack
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export async function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((slug) => ({
    slug,
  }));
}
