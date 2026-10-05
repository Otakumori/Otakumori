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
      <main className="om-route-page om-route-page--community min-h-screen px-6">
        <section className="om-route-state om-route-state--open mt-12" aria-labelledby="community-title">
          <span aria-hidden="true" className="om-route-state__mark" />
          <h1 id="community-title" className="mt-3 font-display text-3xl font-semibold text-[#f6eddf]">
            Community
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#d9cdbd]">
            Correspondence is temporarily unavailable. Please check back later.
          </p>
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
