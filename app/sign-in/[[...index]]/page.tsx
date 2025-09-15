'use client';

import { SignIn } from '@clerk/nextjs';
import { env } from '@/env';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to continue your journey</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'bg-transparent shadow-none border-none',
                headerTitle: 'text-white',
                headerSubtitle: 'text-gray-300',
                socialButtonsBlockButton:
                  'bg-white/10 hover:bg-white/20 border-white/20 text-white',
                formButtonPrimary: 'bg-pink-500 hover:bg-pink-600 text-white',
                formFieldInput: 'bg-white/10 border-white/20 text-white placeholder-gray-400',
                formFieldLabel: 'text-gray-300',
                footerActionLink: 'text-pink-400 hover:text-pink-300',
                identityPreviewText: 'text-gray-300',
                formFieldSuccessText: 'text-green-400',
                formFieldErrorText: 'text-red-400',
              },
            }}
          />
        </div>

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <a href="/sign-up" className="text-pink-400 hover:text-pink-300 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
