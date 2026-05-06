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
  status: string;
};

const HOME_SECTION_CARDS: HomeSectionCard[] = [
  {
    eyebrow: 'Commerce',
    title: 'Shop the grove',
    description:
      'A fast path into Otaku-mori merch without mixing catalog, cart, or checkout ownership into the homepage.',
    href: '/shop',
    cta: 'Visit the shop',
    status: 'Route-owned',
  },
  {
    eyebrow: 'Play',
    title: 'Mini-games',
    description:
      'A light entry point for games, rewards, and future petal loops while keeping the homepage bundle calm.',
    href: '/mini-games',
    cta: 'Play mini-games',
    status: 'Preview-safe',
  },
  {
    eyebrow: 'Community',
    title: 'Community shrine',
    description:
      'A landing surface for social features and soapstone-style messages, gated before any live posting path opens.',
    href: '/community',
    cta: 'Join the community',
    status: 'Live-data gated',
  },
  {
    eyebrow: 'Identity',
    title: 'Traveler profile',
    description:
      'The future personal grove for petals, runes, shrine progress, and Petal Pouch state after the homepage stabilizes.',
    href: '/profile',
    cta: 'Open profile',
    status: 'Follow-up surface',
  },
];

function SectionHeader() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="font-ui text-sm font-medium uppercase tracking-[0.32em] text-sakura-50/70">
        The path through the grove
      </p>
      <h2 className="font-display mt-4 text-balance text-3xl font-semibold tracking-tight text-white md:text-5xl">
        A clear, fast skeleton for shop, play, community, and profile.
      </h2>
      <p className="font-body mt-5 text-base leading-8 text-white/70 md:text-lg">
        The Sakura tree is the emotional entry point. The sections below it stay server-rendered,
        low-motion, and route-owned so the site feels intentional without adding memory-heavy client
        behavior.
      </p>
    </div>
  );
}

function HomeSectionCard({ card }: { card: HomeSectionCard }) {
  return (
    <article className="glass-card card-stroke group relative overflow-hidden rounded-3xl p-6 transition-transform duration-200 hover:-translate-y-1 focus-within:border-sakura-300/50 md:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,126,179,0.18),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_48%)] opacity-75 transition-opacity duration-200 group-hover:opacity-100" />
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between gap-4">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.26em] text-sakura-50/70">
            {card.eyebrow}
          </p>
          <span className="font-ui rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60">
            {card.status}
          </span>
        </div>

        <h3 className="font-display text-2xl font-semibold text-white">{card.title}</h3>
        <p className="font-body mt-4 flex-1 text-sm leading-7 text-white/68">{card.description}</p>

        <Link
          href={card.href}
          className="font-ui focus-ring mt-7 inline-flex w-fit items-center rounded-full border border-sakura-300/25 bg-sakura-300/10 px-4 py-2 text-sm font-medium text-sakura-50 transition hover:border-sakura-50/50 hover:bg-sakura-300/18"
        >
          {card.cta}
        </Link>
      </div>
    </article>
  );
}

function PerformanceGuardrails() {
  return (
    <section
      aria-labelledby="home-guardrails-title"
      className="glass-panel card-stroke mx-auto mt-24 max-w-5xl rounded-3xl p-6 text-white/75 md:p-8"
      style={containSectionStyle}
    >
      <p className="font-ui text-xs font-semibold uppercase tracking-[0.28em] text-sakura-50/70">
        Build standard
      </p>
      <h2 id="home-guardrails-title" className="font-display mt-3 text-2xl font-semibold text-white">
        UI, UX, performance, memory, and data safety carry equal weight.
      </h2>
      <div className="font-body mt-6 grid gap-4 text-sm leading-7 md:grid-cols-2">
        <p>
          This skeleton is server-first and static by default. It does not add timers, observers,
          third-party scripts, external fetches, or arbitrary client-trusted grant calls to the
          homepage path.
        </p>
        <p>
          Homepage tree petals may use a thin authenticated collection session later. Full profile,
          purchase, achievement, and mini-game reward logic stays on owned routes and server-validated
          claim paths.
        </p>
      </div>
    </section>
  );
}

export default function HomeMain() {
  return (
    <main className="relative z-20 bg-[#080611] px-4 py-20 text-white sm:px-6 lg:px-8">
      <section aria-labelledby="home-sections-title" className="mx-auto max-w-7xl" style={containSectionStyle}>
        <SectionHeader />
        <h2 id="home-sections-title" className="sr-only">
          Otaku-mori site sections
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {HOME_SECTION_CARDS.map((card) => (
            <HomeSectionCard key={card.href} card={card} />
          ))}
        </div>
      </section>

      <PerformanceGuardrails />
    </main>
  );
}
