'use client';

import Link from 'next/link';

export function BlogTeaser() {
  // For now, show empty state - can be enhanced later with real blog data
  const hasPosts = false;

  return (
    <section id="blog-teaser" className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-800">Latest Stories</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Discover the latest tales from the Otaku-mori community.
          </p>
        </div>

        {hasPosts ? (
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Blog posts would go here */}
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl">🌸</div>
            <h3 className="mb-4 text-xl font-medium text-gray-600">No petals have fallen yet.</h3>
            <p className="mb-6 text-gray-500">
              Our first stories are brewing in the digital shrine.
            </p>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/blog"
            className="inline-block rounded-full border-2 border-purple-600 px-8 py-3 font-semibold text-purple-600 transition-colors duration-200 hover:bg-purple-600 hover:text-white"
          >
            {hasPosts ? 'Read More Stories' : 'Visit Blog'}
          </Link>
        </div>
      </div>
    </section>
  );
}
