import Link from 'next/link';
import type { CSSProperties } from 'react';

const containSectionStyle: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '1px 640px',
};

type HomeSectionCard = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

const HOME_SECTION_CARDS: HomeSectionCard[] = [
  {
    eyebrow: 'Relics',
    title: 'Shop the collection',
    description:
      'Apparel, pins, charms, and limited-run relics curated for travelers who linger in the grove.',
    href: '/shop',
    cta: 'Browse the catalog',
  },
  {
    eyebrow: 'Play',
    title: 'Enter the game realm',
    description:
      'Mini-games, petal rewards, and small rituals await in the cube beyond the blossoms.',
    href: '/mini-games',
    cta: 'Play mini-games',
  },
  {
    eyebrow: 'Community',
    title: 'Fellow travelers',
    description:
      'Leave a sign for fellow wanderers, send praise, and gather at the community shrine.',
    href: '/community',
    cta: 'Join the community',
  },
  {
    eyebrow: 'Petals',
    title: 'The petals remember you',
    description:
      'Gather petals, unlock small pieces of the world, and carry your grove progress forward.',
    href: '/profile',
    cta: 'Open your grove',
  },
];

function SectionHeader() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="mori-ui text-sm">Beyond the blossoms</p>
      <h2 className="mori-display mt-4 text-balance text-3xl md:text-5xl">
        Relics, games, and small rituals await
      </h2>
      <p className="mori-body mx-auto mt-5 max-w-2xl text-base leading-8 md:text-lg">
        Step deeper into Otaku-mori — a dark storybook catalog where commerce, play, and community
        share the same quiet shrine mood.
      </p>
    </div>
  );
}

function ShopCtaBand() {
  return (
    <div className="mori-frame mori-paper-texture mx-auto mt-14 max-w-3xl rounded-sm px-6 py-8 text-center md:px-10">
      <p className="mori-ui text-xs">Featured path</p>
      <h2 className="mori-display mt-3 text-3xl md:text-4xl">Shop the collection</h2>
      <p className="mori-body mx-auto mt-4 max-w-xl text-base">
        Relics and apparel from the Mori — framed for travelers, not for architects.
      </p>
      <Link href="/shop" className="mori-cta-primary mt-6 inline-flex rounded-sm">
        Enter the shop
      </Link>
    </div>
  );
}

function HomeSectionCard({ card }: { card: HomeSectionCard }) {
  return (
    <article className="mori-card group relative overflow-hidden rounded-sm p-6 md:p-7">
      <div className="relative z-10 flex h-full flex-col">
        <p className="mori-ui text-xs">{card.eyebrow}</p>

        <h3 className="mori-display mt-4 text-2xl">{card.title}</h3>
        <p className="mori-body mt-4 flex-1 text-sm leading-7">{card.description}</p>

        <Link href={card.href} className="mori-ui focus-ring mt-7 inline-flex w-fit text-sm">
          {card.cta} →
        </Link>
      </div>
    </article>
  );
}

function WorldTeasers() {
  return (
    <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-2">
      <article className="mori-card rounded-sm p-6">
        <p className="mori-ui text-xs">Petal rewards</p>
        <h3 className="mori-display mt-3 text-2xl">Gather petals. Unlock the world.</h3>
        <p className="mori-body mt-3 text-sm leading-7">
          Click blossoms as they drift from the tree. Small rewards and shrine progress follow the
          patient traveler.
        </p>
      </article>
      <article className="mori-card rounded-sm p-6">
        <p className="mori-ui text-xs">World lore</p>
        <h3 className="mori-display mt-3 text-2xl">Community chronicles</h3>
        <p className="mori-body mt-3 text-sm leading-7">
          Read tales from the grove — dev logs, traveler notes, and the quiet history of Otaku-mori.
        </p>
        <Link href="/blog" className="mori-ui focus-ring mt-5 inline-flex text-sm">
          Read the blog →
        </Link>
      </article>
    </div>
  );
}

export default function HomeMain() {
  return (
    <main className="mori-surface mori-paper-texture relative z-20 px-4 py-20 sm:px-6 lg:px-8">
      <section aria-labelledby="home-sections-title" className="mx-auto max-w-7xl" style={containSectionStyle}>
        <SectionHeader />
        <h2 id="home-sections-title" className="sr-only">
          Otaku-mori site sections
        </h2>

        <ShopCtaBand />

        <div className="mori-divider mx-auto mt-14 max-w-4xl" aria-hidden="true" />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {HOME_SECTION_CARDS.map((card) => (
            <HomeSectionCard key={card.href} card={card} />
          ))}
        </div>

        <WorldTeasers />
      </section>
    </main>
  );
}
