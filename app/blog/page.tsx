import Header from '../components/Header'

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header />
      <section className="max-w-4xl mx-auto pt-32 pb-12 px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-pink-700 mb-6 text-center">Blog</h1>
        <p className="text-lg text-pink-900 mb-8 text-center">Otaku-mori Insiders: Anime, gaming lore, cosplay, and more!</p>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white/80 rounded-xl shadow p-6">
            <h2 className="font-semibold text-pink-700 text-xl mb-2">How to Collect Petals Like a Pro</h2>
            <p className="text-pink-900 mb-2">Tips and tricks for maximizing your petal collection and unlocking achievements.</p>
            <div className="text-pink-400 italic">(Full blog system coming soon!)</div>
          </div>
          <div className="bg-white/80 rounded-xl shadow p-6">
            <h2 className="font-semibold text-pink-700 text-xl mb-2">Cosplay Contest Winners</h2>
            <p className="text-pink-900 mb-2">See the latest community highlights and winning looks.</p>
            <div className="text-pink-400 italic">(Full blog system coming soon!)</div>
          </div>
        </div>
      </section>
    </main>
  )
} 