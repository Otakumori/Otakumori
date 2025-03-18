"use client";
import Header from "./components/Header";
import Hero from "./components/Hero";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-gray-900">
      <Header />
      <Hero />

      <section className="p-8 text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to Otakumori!</h1>
        <p className="text-lg">
          Explore our shop, read our blog, play minigames, and collect petals to unlock achievements!
        </p>
      </section>
    </div>
  );
}
