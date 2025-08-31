/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import Header from '../../components/Header';

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header />
      <section className="mx-auto max-w-4xl px-4 pb-12 pt-32">
        <h1 className="mb-6 text-center text-3xl font-extrabold text-pink-700 md:text-5xl">
          Community
        </h1>
        <p className="mb-8 text-center text-lg text-pink-900">
          Join the Otaku-mori community! Upload, share, and connect.
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl bg-white/80 p-6 shadow">
            <h2 className="mb-2 text-xl font-semibold text-pink-700">FAQ Uploads</h2>
            <p className="mb-2 text-pink-900">
              Upload screenshots for order support and get help from the community.
            </p>
            <div className="italic text-pink-400">(Upload system coming soon!)</div>
          </div>
          <div className="rounded-xl bg-white/80 p-6 shadow">
            <h2 className="mb-2 text-xl font-semibold text-pink-700">Cosplay Hub</h2>
            <p className="mb-2 text-pink-900">
              Participate in contests or post with our hashtag to be featured in the gallery.
            </p>
            <div className="italic text-pink-400">(Live hashtag gallery coming soon!)</div>
          </div>
        </div>
      </section>
    </main>
  );
}
