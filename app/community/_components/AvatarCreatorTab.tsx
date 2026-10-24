import Link from 'next/link';

/** Community discovery adapter; avatar editing belongs to the canonical Creator route. */
export function AvatarCreatorTab() {
  return (
    <section className="rounded-xl border border-white/20 bg-white/5 p-8 text-center">
      <p className="text-sm uppercase tracking-[0.24em] text-pink-200">Traveler identity</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Shape your Otaku-mori avatar</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-300">
        The full Creator is the single place to customize and save the identity used by your
        profile and supported games.
      </p>
      <Link
        href="/creator"
        className="mt-6 inline-flex rounded-lg bg-pink-500 px-5 py-2.5 font-semibold text-white transition hover:bg-pink-400 focus:outline-none focus:ring-2 focus:ring-pink-200"
      >
        Open Creator
      </Link>
    </section>
  );
}
