import Header from '../components/Header';

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header />
      <section className="mx-auto max-w-4xl px-4 pb-12 pt-32">
        <h1 className="mb-6 text-center text-3xl font-extrabold text-pink-700 md:text-5xl">Blog</h1>
        <p className="mb-8 text-center text-lg text-pink-900">
          Otaku-mori Insiders: Anime, gaming lore, cosplay, and more!
        </p>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-xl bg-white/80 p-6 shadow">
            <h2 className="mb-2 text-xl font-semibold text-pink-700">
              How to Collect Petals Like a Pro
            </h2>
            <p className="mb-2 text-pink-900">
              Tips and tricks for maximizing your petal collection and unlocking achievements.
            </p>
            <div className="italic text-pink-400">(Full blog system coming soon!)</div>
          </div>
          <div className="rounded-xl bg-white/80 p-6 shadow">
            <h2 className="mb-2 text-xl font-semibold text-pink-700">Cosplay Contest Winners</h2>
            <p className="mb-2 text-pink-900">
              See the latest community highlights and winning looks.
            </p>
            <div className="italic text-pink-400">(Full blog system coming soon!)</div>
          </div>
        </div>
      </section>
    </main>
  );
}
