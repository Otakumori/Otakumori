'use client';

import { SignIn } from '@clerk/nextjs';
import { Suspense } from 'react';
import PetalField from '@/app/components/effects/PetalField';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0d1a] via-[#0f1021] to-[#0b0b13] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Space-pixel atmosphere */}
      <div className="absolute inset-0 opacity-[0.06]">
        {Array.from({ length: 24 }, (_, i) => {
          // Use deterministic values based on index to avoid hydration mismatch
          const seed = i * 7 + 13; // Simple deterministic seed
          const top = (seed * 17) % 100;
          const left = (seed * 23) % 100;
          const delay = (seed * 31) % 20;

          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                top: `${top}%`,
                left: `${left}%`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* Petal Field Effect */}
      <PetalField density="auth" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-['Roboto_Condensed']">
            Leave a mark
          </h1>
          <p className="text-gray-300 text-sm">Secure • Fast • Cute (and a bit cursed)</p>
        </div>

        {/* Auth Card */}
        <div className="bg-black/20 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
          <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              fallbackRedirectUrl="/"
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  card: 'bg-transparent shadow-none border-none',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtonsBlockButton:
                    'bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-lg transition-all duration-200',
                  formButtonPrimary:
                    'bg-[#ff4fa3] hover:bg-[#ff86c2] text-white rounded-lg font-medium transition-all duration-200',
                  formFieldInput:
                    'bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#ff4fa3] focus:border-transparent',
                  formFieldLabel: 'text-gray-300 font-medium',
                  footerActionLink:
                    'text-[#ff4fa3] hover:text-[#ff86c2] font-medium transition-colors',
                  identityPreviewText: 'text-gray-300',
                  formFieldSuccessText: 'text-green-400',
                  formFieldErrorText: 'text-red-400',
                },
              }}
            />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <a
              href="/sign-up"
              className="text-[#ff4fa3] hover:text-[#ff86c2] font-medium transition-colors"
            >
              Sign up
            </a>
          </p>
          <div className="mt-4 flex items-center justify-center">
            <img
              src="/assets/images/soapstonefilter.png"
              alt="Secret Ahead"
              className="w-6 h-6 opacity-60"
            />
            <span className="text-gray-500 text-xs ml-2">Secret Ahead</span>
          </div>
        </div>
      </div>
    </div>
  );
}
