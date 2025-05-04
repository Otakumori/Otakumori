import Header from '../components/Header'

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header />
      <section className="max-w-3xl mx-auto pt-32 pb-12 px-4 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-pink-700 mb-6 text-center">Admin Panel</h1>
        <div className="w-full bg-white/80 rounded-2xl shadow-xl p-8 flex flex-col items-center mb-8">
          <div className="text-pink-900 font-semibold text-xl mb-2">Petal Economy Controls</div>
          <div className="text-pink-400 italic mb-4">(Petal, season, and reward settings coming soon!)</div>
          <div className="text-pink-900 font-semibold text-xl mb-2">Moderation</div>
          <div className="text-pink-400 italic">(Profile ban appeals and AI pacing coming soon!)</div>
        </div>
      </section>
    </main>
  )
} 