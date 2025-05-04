import Header from '../components/Header'

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header />
      <section className="max-w-5xl mx-auto pt-32 pb-12 px-4">
        <h1 className="text-3xl md:text-5xl font-extrabold text-pink-700 mb-6 text-center">Shop</h1>
        <p className="text-lg text-pink-900 mb-8 text-center">Browse our hottest anime apparel, accessories, home decor, and more!</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-pink-500 text-2xl">👕</span>
            <span className="mt-2 font-semibold">Apparel</span>
          </div>
          <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-pink-500 text-2xl">🎀</span>
            <span className="mt-2 font-semibold">Accessories</span>
          </div>
          <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-pink-500 text-2xl">👟</span>
            <span className="mt-2 font-semibold">Footwear</span>
          </div>
          <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-pink-500 text-2xl">🏠</span>
            <span className="mt-2 font-semibold">Home Decor</span>
          </div>
        </div>
        <div className="mt-12 text-center text-pink-400 italic">(Product grid and filters coming soon!)</div>
      </section>
    </main>
  )
} 