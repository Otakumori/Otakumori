"use client";
import PetalGameImage from './components/PetalGameImage'
import Header from './components/Header'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-pink-50">
      <Header />
      <section className="flex flex-col items-center justify-center pt-24 pb-12">
        <PetalGameImage />
      </section>
      {/* Petal Collection Bar Placeholder */}
      <section className="flex flex-col items-center justify-center mt-8">
        <div className="w-full max-w-xl bg-white/80 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-pink-700">Seasonal Petal Progress</span>
            <span className="text-sm text-pink-500">Spring: 12,345 / 25,000</span>
          </div>
          <div className="w-full bg-pink-200 rounded-full h-4">
            <div className="bg-pink-500 h-4 rounded-full" style={{ width: '49%' }}></div>
          </div>
        </div>
        {/* Leaderboard Placeholder */}
        <div className="w-full max-w-xl bg-white/80 rounded-lg shadow p-4">
          <h2 className="font-semibold text-pink-700 mb-2">Top Petal Collectors</h2>
          <ol className="list-decimal pl-6 text-pink-900">
            <li>CommanderA - 2,500 petals</li>
            <li>SakuraQueen - 2,100 petals</li>
            <li>PixelRonin - 1,950 petals</li>
          </ol>
        </div>
      </section>
    </main>
  )
}
