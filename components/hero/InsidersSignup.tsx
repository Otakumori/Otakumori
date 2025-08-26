/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { Mail, Sparkles, Crown, Eye, Lock } from 'lucide-react';

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
      <section id="insiders-signup" className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 py-20 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Crown className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <h3 className="mb-4 text-4xl font-bold text-white">Welcome to the Inner Circle!</h3>
            <p className="text-xl text-purple-100 leading-relaxed">
              You&apos;ve been granted access to the digital shrine&apos;s deepest secrets. 
              <span className="block mt-2 text-lg text-purple-200">
                Expect whispers of new drops, hidden petals, and exclusive content in your inbox.
              </span>
            </p>
            
            <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 text-white backdrop-blur-sm">
              <Mail className="h-5 w-5" />
              <span>Check your email for confirmation</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="insiders-signup" className="bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 py-20 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px]" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
              <Eye className="h-12 w-12 text-white" />
            </div>
          </div>
          
          <h2 className="mb-6 text-4xl font-bold text-white md:text-5xl">
            Inner Shrine — Sign up. Don&apos;t you dare go hollow.
          </h2>
          
          <p className="mx-auto mb-12 max-w-3xl text-xl text-purple-100 leading-relaxed">
            Beyond the veil of the ordinary lies a realm where cherry blossoms whisper secrets and pixel art holds ancient wisdom. 
            <span className="block mt-3 text-lg text-purple-200">
              Join the chosen few who receive early access to drops, hidden petals, and exclusive content that exists only in the digital shrine.
            </span>
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto mb-8 flex max-w-md flex-col gap-4 sm:flex-row"
          >
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-full border-0 bg-white/90 px-12 py-4 text-gray-800 placeholder-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-2 focus:ring-offset-purple-600"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative rounded-full bg-white px-8 py-4 font-semibold text-purple-600 transition-all duration-200 hover:bg-purple-50 hover:shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-600 border-t-transparent"></div>
                  Joining...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Join Insiders
                </span>
              )}
            </button>
          </form>

          <div className="mx-auto max-w-2xl">
            <p className="mb-6 text-purple-200">
              No spam, just petals and pixel art. Your email is sacred to us.
            </p>
            
            {/* Benefits grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm text-center">
                <div className="mb-3 text-3xl">🌸</div>
                <h4 className="mb-2 text-lg font-semibold text-white">Early Access</h4>
                <p className="text-sm text-purple-200">Be first to discover new drops</p>
              </div>
              
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm text-center">
                <div className="mb-3 text-3xl">🎮</div>
                <h4 className="mb-2 text-lg font-semibold text-white">Hidden Petals</h4>
                <p className="text-sm text-purple-200">Exclusive content and rewards</p>
              </div>
              
              <div className="rounded-xl bg-white/10 p-6 backdrop-blur-sm text-center">
                <div className="mb-3 text-3xl">⚡</div>
                <h4 className="mb-2 text-lg font-semibold text-white">Inner Circle</h4>
                <p className="text-sm text-purple-200">Join the digital shrine elite</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
