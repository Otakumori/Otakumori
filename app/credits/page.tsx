import type { Metadata } from 'next';

import {
  MoriDivider,
  MoriSectionHeader,
  MoriStatus,
  MoriSurface,
} from '@/app/components/mori/MoriFoundation';
import audioAttributions from '@/docs/legal/audio-attributions.json';

export const metadata: Metadata = {
  title: 'Credits & Asset Acknowledgments | Otaku-mori',
  description:
    'Creator credits, source acknowledgments, and license references for Otaku-mori assets.',
};

const publicEntries = audioAttributions.entries.filter(({ publicCredit }) => publicCredit);

const LICENSE_LABELS: Record<string, string> = {
  CC_BY_4_0: 'Creative Commons Attribution 4.0',
  CC0: 'Creative Commons CC0',
  CUSTOM_ROYALTY_FREE: 'Custom royalty-free license',
  PIXABAY_CONTENT_LICENSE: 'Pixabay Content License',
};

const licenseLabel = (licenseId: string) =>
  LICENSE_LABELS[licenseId] ?? licenseId.replaceAll('_', ' ');

export default function CreditsPage() {
  return (
    <main className="min-h-screen bg-[var(--om-bg-root)] px-4 py-16 text-[var(--om-text-ivory)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        <MoriSurface
          as="section"
          containment="raised"
          material="charcoal"
          texture="grain"
          className="rounded-3xl border border-[var(--om-border-soft)] px-6 py-8 sm:px-10"
        >
          <MoriSectionHeader
            eyebrow="The archive remembers its makers"
            title="Credits & Asset Acknowledgments"
            description="Verified creator, source, and license records for Otaku-mori's asset library. Inclusion here acknowledges source authority; individual in-game placement and publication remain separately reviewed."
            headingLevel={1}
          />
          <div className="mt-6 flex flex-wrap gap-2">
            <MoriStatus tone="success">Verified provenance</MoriStatus>
            <MoriStatus>Owner-controlled placement</MoriStatus>
          </div>
        </MoriSurface>

        <section aria-labelledby="audio-source-libraries">
          <MoriSectionHeader
            eyebrow="Source authority"
            title="Audio source libraries"
            description="Publisher evidence is recorded once and applied only to exact files or verified pack members."
            headingLevel={2}
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {audioAttributions.publisherEvidence.map((source) => (
              <MoriSurface
                as="article"
                containment="quiet"
                material="stone"
                key={source.id}
                className="rounded-2xl border border-[var(--om-border-soft)] p-5"
              >
                <h3 className="font-display text-lg font-semibold text-[var(--om-text-ivory)]">
                  {source.title}
                </h3>
                <p className="mt-1 text-sm text-[var(--om-text-ivory)]/64">{source.publisher}</p>
                <p className="mt-4 text-sm leading-6 text-[var(--om-text-ivory)]/80">
                  {source.rightsSummary}
                </p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <a
                    className="text-[var(--om-accent-pink)] underline decoration-transparent underline-offset-4 transition hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--om-accent-pink)]"
                    href={source.sourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Publisher source
                  </a>
                  <a
                    className="text-[var(--om-accent-pink)] underline decoration-transparent underline-offset-4 transition hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--om-accent-pink)]"
                    href={source.licenseUrl}
                    rel="license noopener noreferrer"
                    target="_blank"
                  >
                    {licenseLabel(source.licenseId)}
                  </a>
                </div>
              </MoriSurface>
            ))}
          </div>
        </section>

        <MoriDivider label="Recorded works" />

        <section aria-labelledby="audio-work-credits">
          <MoriSectionHeader
            eyebrow="Creator record"
            title="Audio works"
            description="Required and voluntary credits for matched source recordings. Raw source-library paths and private intake metadata are never published here."
            headingLevel={2}
          />
          <div className="mt-6 grid gap-4">
            {publicEntries.map((entry) => (
              <MoriSurface
                as="article"
                containment="quiet"
                material="paper"
                key={entry.id}
                className="rounded-2xl border border-[var(--om-border-soft)] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{entry.title}</h3>
                    <p className="mt-1 text-sm text-[var(--om-text-ivory)]/64">{entry.creator}</p>
                    <p className="mt-3 text-sm leading-6 text-[var(--om-text-ivory)]/76">
                      {entry.modifications}
                    </p>
                  </div>
                  <MoriStatus>
                    {entry.attributionRequired ? 'Attribution required' : 'Voluntary credit'}
                  </MoriStatus>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                  <a
                    className="text-[var(--om-accent-pink)] underline decoration-transparent underline-offset-4 transition hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--om-accent-pink)]"
                    href={entry.sourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Exact source record
                  </a>
                  <a
                    className="text-[var(--om-accent-pink)] underline decoration-transparent underline-offset-4 transition hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--om-accent-pink)]"
                    href={entry.licenseUrl}
                    rel="license noopener noreferrer"
                    target="_blank"
                  >
                    {licenseLabel(entry.licenseId)}
                  </a>
                </div>
              </MoriSurface>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
