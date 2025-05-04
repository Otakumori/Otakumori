import Header from '../components/Header'

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header />
      <section className="max-w-4xl mx-auto pt-32 pb-12 px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-pink-700 mb-6 text-center">Community</h1>
        <p className="text-lg text-pink-900 mb-8 text-center">Join the Otaku-mori community! Upload, share, and connect.</p>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white/80 rounded-xl shadow p-6">
            <h2 className="font-semibold text-pink-700 text-xl mb-2">FAQ Uploads</h2>
            <p className="text-pink-900 mb-2">Upload screenshots for order support and get help from the community.</p>
            <div className="text-pink-400 italic">(Upload system coming soon!)</div>
          </div>
          <div className="bg-white/80 rounded-xl shadow p-6">
            <h2 className="font-semibold text-pink-700 text-xl mb-2">Cosplay Hub</h2>
            <p className="text-pink-900 mb-2">Participate in contests or post with our hashtag to be featured in the gallery.</p>
            <div className="text-pink-400 italic">(Live hashtag gallery coming soon!)</div>
          </div>
        </div>
      </section>
    </main>
  )
} 