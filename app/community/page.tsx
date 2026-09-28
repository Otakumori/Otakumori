import { generateSEO } from '@/app/lib/seo';
import { CommunityHub } from './_components/CommunityHub';
import { env } from '@/env';
import { isLighthouseCiRuntime } from '@/app/lib/performance/lighthouseMode';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/community',
  });
}
export default async function CommunityPage() {
  const useLighthouseShell = isLighthouseCiRuntime();
  // Check if Clerk is configured
  const isClerkConfigured = Boolean(env.CLERK_SECRET_KEY && env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!isClerkConfigured) {
    return (
      <main className="om-route-page om-route-page--community flex min-h-screen items-center justify-center px-4">
        <section className="om-route-state om-route-state--bounded" aria-labelledby="community-title">
          <span aria-hidden="true" className="om-route-state__mark" />
          <p className="mori-foundation-eyebrow">Correspondence archive</p>
          <h1 id="community-title" className="mt-3 font-display text-3xl font-semibold text-[#f6eddf]">
            Community is being prepared
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#d9cdbd]">
            Messages, avatars, and traveler correspondence will appear here when this archive is available.
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.16em] text-[#c6a77d]">Return when the seal is ready</p>
        </section>
      </main>
    );
  }

  // Allow guest access - CommunityHub will handle auth-gated features
  return (
    <main className="om-route-page om-route-page--community min-h-screen">
      <CommunityHub performanceMode={useLighthouseShell} />
    </main>
  );
}
