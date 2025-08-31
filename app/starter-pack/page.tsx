/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';
import { useState } from 'react';
import { useQuests } from '@/app/hooks/useQuests';

export default function StarterPackPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackQuest } = useQuests();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setError(null);

    try {
      // Track starter pack signup for quests
      await trackQuest('browse-collection');

      const response = await fetch('/api/starter-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit');
      }

      setSuccess(true);

      // Trigger download
      if (data.url) {
        const link = document.createElement('a');
        link.href = data.url;
        link.download = 'otakumori-starter-pack.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-cube-900 via-cube-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6 text-6xl">🎉</div>
          <h1 className="text-2xl font-bold text-slatey-200 mb-4">Welcome to the Adventure!</h1>
          <p className="text-slatey-400 mb-6">
            Your starter pack is downloading now. We've also sent the link to your email so you can
            re-download anytime.
          </p>
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
            <h3 className="text-slatey-200 font-medium mb-2">What's Inside:</h3>
            <ul className="text-sm text-slatey-400 space-y-1">
              <li>• 5 PS1-style UI buttons (PNG + PSD)</li>
              <li>• 3 retro game icons (32x32, 64x64)</li>
              <li>• 2 atmospheric SFX (WAV, 44.1kHz)</li>
              <li>• Color palette guide</li>
              <li>• Quick start tutorial</li>
            </ul>
          </div>
          <a
            href="/"
            className="inline-block bg-sakura-500/20 border border-sakura-400 text-slatey-200 px-6 py-3 rounded-xl hover:bg-sakura-500/30 transition-colors"
          >
            Explore More Assets
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-cube-900 via-cube-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="mb-4 text-6xl">🎮</div>
          <h1 className="text-3xl font-bold text-slatey-200 mb-4">Free Starter Pack</h1>
          <p className="text-lg text-slatey-400">
            Get your first taste of Otakumori's retro gaming assets. No strings attached, just pure
            pixel goodness.
          </p>
        </div>

        {/* Value Props */}
        <div className="grid gap-4 mb-8">
          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎨</div>
              <div>
                <h3 className="text-slatey-200 font-medium">PS1-Style UI Elements</h3>
                <p className="text-sm text-slatey-400">Authentic retro buttons and frames</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🔊</div>
              <div>
                <h3 className="text-slatey-200 font-medium">Retro SFX Collection</h3>
                <p className="text-sm text-slatey-400">Chiptune-style audio for your games</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="text-slatey-200 font-medium">Ready to Use</h3>
                <p className="text-sm text-slatey-400">PNG, PSD, and WAV files included</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Form */}
        <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-slatey-200 mb-4 text-center">
            Get Your Free Pack
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slatey-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-600 bg-slate-700 text-slatey-200 placeholder-slatey-400 focus:border-sakura-400 focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-900/20 border border-red-800 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-sakura-500/20 border border-sakura-400 text-slatey-200 py-3 rounded-xl font-medium hover:bg-sakura-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? 'Preparing Download...' : 'Download Starter Pack'}
            </button>
          </form>

          <p className="text-xs text-slatey-400 text-center mt-4">
            We'll send you the download link and occasional updates about new assets. Unsubscribe
            anytime.
          </p>
        </div>

        {/* Social Proof */}
        <div className="text-center mt-8">
          <p className="text-slatey-400 text-sm mb-2">Trusted by indie developers worldwide</p>
          <div className="flex items-center justify-center gap-6 text-xs text-slatey-500">
            <span>🎮 2,000+ Downloads</span>
            <span>⭐ 4.8/5 Rating</span>
            <span>🌍 50+ Countries</span>
          </div>
        </div>
      </div>
    </main>
  );
}
