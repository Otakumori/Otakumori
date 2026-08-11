import type { CSSProperties } from 'react';
import HomeSoapstoneDialog from './HomeSoapstoneDialog';
import {
  MoriBody,
  MoriCard,
  MoriEyebrow,
  MoriLink,
  MoriMeta,
  MoriPanel,
  MoriSectionHeading,
} from '@/app/components/mori';
import { StorefrontPanel } from '@/app/components/shop/StorefrontPrimitives';

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
      <MoriEyebrow>The path through the grove</MoriEyebrow>
      <MoriSectionHeading className="mt-4">
        Shop, play, and return to a world that feels handmade.
      </MoriSectionHeading>
      <MoriBody className="mt-5 md:text-lg">
        The sakura tree stays as the signature living landmark. The sections below it use quiet
        ornamental frames, clear entry points, and server-owned routes so the atmosphere never gets
        in the way of browsing.
      </MoriBody>
    </div>
  );
}

function HomeSectionCard({ card }: { card: HomeSectionCard }) {
  return (
    <MoriCard className="group p-6 md:p-7">
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-6 flex items-center justify-between gap-4">
          <MoriEyebrow>{card.eyebrow}</MoriEyebrow>
          <MoriMeta>{card.status}</MoriMeta>
        </div>

        <h3 className="font-display text-2xl font-semibold text-[var(--mori-ivory)]">
          {card.title}
        </h3>
        <p className="font-body mt-4 flex-1 text-sm leading-7 text-[var(--mori-parchment-muted)]">
          {card.description}
        </p>

        <MoriLink href={card.href} className="mt-7 w-fit" variant="secondary">
          {card.cta}
        </MoriLink>
      </div>
    </MoriCard>
  );
}

function PerformanceGuardrails() {
  return (
    <MoriPanel
      aria-labelledby="home-guardrails-title"
      className="mx-auto mt-24 max-w-5xl p-6 text-white/75 md:p-8"
      style={containSectionStyle}
    >
      <MoriEyebrow>Build standard</MoriEyebrow>
      <h2
        id="home-guardrails-title"
        className="font-display mt-3 text-2xl font-semibold text-[var(--mori-ivory)]"
      >
        UI, UX, performance, memory, and data safety carry equal weight.
      </h2>
      <div className="font-body mt-6 grid gap-4 text-sm leading-7 text-[var(--mori-parchment-muted)] md:grid-cols-2">
        <p>
          This skeleton is server-first and static by default. It does not add timers, observers,
          third-party scripts, external fetches, or arbitrary client-trusted grant calls to the
          homepage path.
        </p>
        <p>
          Homepage tree petals may use a thin authenticated collection session later. Full profile,
          purchase, achievement, and mini-game reward logic stays on owned routes and
          server-validated claim paths.
        </p>
      </div>
    </MoriPanel>
  );
}

function HomeFooter() {
  return (
    <footer className="mx-auto mt-20 max-w-5xl text-center" style={containSectionStyle}>
      <StorefrontPanel className="p-6 text-[var(--mori-parchment-muted)] md:p-8">
        <MoriEyebrow>Community signs</MoriEyebrow>
        <h2 className="font-display mt-3 text-2xl font-semibold text-[var(--mori-ivory)]">
          Leave a sign for fellow travelers
        </h2>
        <p className="font-body mx-auto mt-4 max-w-2xl text-sm leading-7">
          Soapstone posting stays behind its owned route and auth flow; the homepage keeps the
          public invitation visible without depending on live community data.
        </p>
        <HomeSoapstoneDialog />
      </StorefrontPanel>

      <div className="mt-8 border-t border-white/10 pt-6 text-sm text-white/55">
        <p>
          Otakumori {'\u2122'} made with {'\u2661'}
        </p>
        <p className="mt-2 text-xs">
          {'\u00a9'} {new Date().getFullYear()} Otaku-mori. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function HomeMain() {
  return (
    <main className="mori-page relative z-20 px-4 py-20 sm:px-6 lg:px-8">
      <section
        aria-labelledby="home-sections-title"
        className="mx-auto max-w-7xl"
        style={containSectionStyle}
      >
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
      <HomeFooter />
    </main>
  );
}
