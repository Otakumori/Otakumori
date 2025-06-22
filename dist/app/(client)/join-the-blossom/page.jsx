'use strict';
'use client'; // 👈 THIS IS THE FIX
Object.defineProperty(exports, '__esModule', { value: true });
exports.dynamic = void 0;
exports.default = JoinTheBlossomPage;
exports.dynamic = 'force-dynamic';
const react_1 = require('react');
const navigation_1 = require('next/navigation');
const supabaseClient_1 = require('../../../lib/supabaseClient');
function JoinTheBlossomContent() {
  const searchParams = (0, navigation_1.useSearchParams)();
  const initialEmail = searchParams ? searchParams.get('email') || '' : '';
  const [email, setEmail] = (0, react_1.useState)(initialEmail);
  const [submitted, setSubmitted] = (0, react_1.useState)(false);
  const [error, setError] = (0, react_1.useState)('');
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError('Please enter a valid email address.');
      return;
    }
    const { error } = await supabaseClient_1.supabase.from('newsletter_signups').insert({ email });
    if (error) {
      setError('Something went wrong. Please try again!');
    } else {
      setSubmitted(true);
    }
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 py-16 text-white">
      <div className="flex w-full max-w-xl flex-col items-center rounded-3xl bg-gray-900/90 p-8 shadow-2xl">
        <h1 className="mb-4 text-center text-4xl font-bold text-pink-400">Join the Blossom 🌸</h1>
        <p className="mb-6 text-center text-lg text-pink-100">
          Become part of the Otaku-mori community!
          <br />
          <span className="font-semibold text-pink-300">Benefits include:</span>
        </p>
        <ul className="mb-6 list-inside list-disc space-y-2 text-base text-pink-200">
          <li>
            Earn <span className="font-bold text-pink-400">more petals</span> for exclusive rewards
          </li>
          <li>Early access to shop drops & events</li>
          <li>Special community-only giveaways</li>
          <li>Unlock lore, mini-games, and profile perks</li>
          <li>Get the latest blog & newsletter updates</li>
        </ul>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-4">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Your email address"
              className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-pink-300 shadow focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white transition hover:bg-pink-700"
            >
              Join the Blossom
            </button>
            {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
          </form>
        ) : (
          <div className="mt-4 text-center text-lg font-semibold text-green-400">
            Thank you for joining! Check your inbox for Otaku-mori updates soon.
          </div>
        )}
      </div>
    </main>
  );
}
function JoinTheBlossomPage() {
  return (
    <react_1.Suspense>
      <JoinTheBlossomContent />
    </react_1.Suspense>
  );
}
