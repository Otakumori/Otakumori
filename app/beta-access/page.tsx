import Link from 'next/link';
import { buildCanonicalSignInUrl } from '@/app/lib/auth/accountUrls';

export const metadata = {
  title: 'Closed Beta Access | Otaku-mori',
  description: 'Otaku-mori is currently open to invited beta travelers.',
};

export default function BetaAccessPage() {
  return (
    <main className="min-h-screen bg-[#0b090b] px-5 py-24 text-[#f3e9df]">
      <section
        className="mx-auto max-w-2xl rounded-[2rem] border border-[#b68a4a]/35 bg-[#171218]/95 p-8 shadow-2xl shadow-black/50 sm:p-12"
        aria-labelledby="beta-access-title"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d7a4b0]">
          Invitation threshold
        </p>
        <h1 id="beta-access-title" className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
          The Mori is in closed beta.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-[#cfc2b8]">
          Invited travelers can sign in to continue. If your invitation has not arrived yet, your
          place outside the gate is preserved—there is no attendance penalty or expiring progress.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href={buildCanonicalSignInUrl('/')}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#d1a45c]/60 bg-[#7d293f] px-6 py-3 font-semibold text-white transition hover:bg-[#91334c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0bdca]"
          >
            Sign in with an invitation
          </a>
          <Link
            href="/terms"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-6 py-3 font-semibold text-[#e4d7cc] transition hover:border-white/30 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0bdca]"
          >
            Read beta terms
          </Link>
        </div>
      </section>
    </main>
  );
}
