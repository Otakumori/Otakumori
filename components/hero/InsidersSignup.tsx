'use client';

import { useState } from 'react';

export function InsidersSignup() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call - replace with actual endpoint later
    await new Promise(resolve => setTimeout(resolve, 1000));

    setIsSubmitted(true);
    setIsSubmitting(false);
    setEmail('');
  };

  if (isSubmitted) {
    return (
      <section id="insiders-signup" className="bg-gradient-to-br from-purple-600 to-pink-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-md">
            <div className="mb-4 text-6xl">✨</div>
            <h3 className="mb-2 text-2xl font-bold text-white">Welcome to the Inner Circle!</h3>
            <p className="text-purple-100">
              You&apos;ll be the first to know about new drops and hidden petals.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="insiders-signup" className="bg-gradient-to-br from-purple-600 to-pink-600 py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Inner Shrine — Sign up. Don&apos;t you dare go hollow.
          </h2>
          <p className="mb-8 text-lg text-purple-100">
            Get early access to drops, hidden petals, and exclusive content.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 rounded-full px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-white px-8 py-3 font-semibold text-purple-600 transition-colors duration-200 hover:bg-purple-50 disabled:opacity-50"
            >
              {isSubmitting ? 'Joining...' : 'Join Insiders'}
            </button>
          </form>

          <p className="mt-4 text-sm text-purple-200">No spam, just petals and pixel art.</p>
        </div>
      </div>
    </section>
  );
}
