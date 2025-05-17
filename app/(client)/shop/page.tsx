'use client';

import Header from '../../components/Header';

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-pink-50">
      <Header />
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-32">
        <h1 className="mb-6 text-center text-3xl font-extrabold text-pink-700 md:text-5xl">Shop</h1>
        <p className="mb-8 text-center text-lg text-pink-900">
          Browse our hottest anime apparel, accessories, home decor, and more!
        </p>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="flex flex-col items-center rounded-xl bg-white/80 p-6 shadow">
            <span className="text-2xl text-pink-500">👕</span>
            <span className="mt-2 font-semibold">Apparel</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-white/80 p-6 shadow">
            <span className="text-2xl text-pink-500">🎀</span>
            <span className="mt-2 font-semibold">Accessories</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-white/80 p-6 shadow">
            <span className="text-2xl text-pink-500">👟</span>
            <span className="mt-2 font-semibold">Footwear</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-white/80 p-6 shadow">
            <span className="text-2xl text-pink-500">🏠</span>
            <span className="mt-2 font-semibold">Home Decor</span>
          </div>
        </div>
        <div className="mt-12 text-center italic text-pink-400">
          (Product grid and filters coming soon!)
        </div>
      </section>
    </main>
  );
}
