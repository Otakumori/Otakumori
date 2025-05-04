import Header from '../components/Header'

export default function MiniGamesPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header />
      <section className="max-w-3xl mx-auto pt-32 pb-12 px-4 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-pink-700 mb-6 text-center">Mini-Games</h1>
        <div className="w-full bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl shadow-xl p-8 flex flex-col items-center mb-8">
          <div className="text-white text-2xl md:text-4xl font-bold mb-2">GameCube Boot-Up</div>
          <div className="text-pink-100 mb-4">(Pink variant intro animation coming soon!)</div>
          <div className="w-24 h-24 bg-pink-200 rounded-full flex items-center justify-center text-4xl font-extrabold text-pink-700 mb-2">🎮</div>
          <div className="text-white text-lg">Interactive cube and mini-games hub coming soon!</div>
        </div>
        <div className="text-pink-400 italic">(Mini-games and trading center will be playable soon!)</div>
      </section>
    </main>
  )
} 