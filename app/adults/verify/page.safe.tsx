'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function AdultsVerifyPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
      return;
    }

    if (isLoaded && user) {
      const adultVerified = user.publicMetadata?.adultVerified as boolean;
      if (adultVerified) {
        router.push('/adults');
        return;
      }
    }
  }, [user, isLoaded, router]);

  const handleVerification = async () => {
    if (!user) return;

    setIsVerifying(true);

    try {
      // In production, this would call an API to update the user's metadata
      // For now, we'll simulate the verification process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Implement actual verification logic
      // This would typically involve:
      // 1. Calling Clerk to update user.publicMetadata.adultVerified = true
      // 2. Setting default gated preferences
      // 3. Logging the verification event

      setVerificationComplete(true);

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/adults');
      }, 3000);
    } catch (error) {
      console.error('Verification failed:', error);
      setIsVerifying(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  if (verificationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Complete!</h2>
          <p className="text-gray-300 mb-4">You now have access to the Adult Zone.</p>
          <p className="text-gray-400 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Adult Verification</h1>
            <p className="text-gray-300 text-lg">
              Verify your age to access adult content and features.
            </p>
          </div>

          {/* Verification Card */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Age Verification Required</h2>
              <p className="text-gray-300">You must be 18 or older to access adult content.</p>
            </div>

            {/* Content Warning */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-yellow-400 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h4 className="text-yellow-400 font-medium mb-1">Content Warning</h4>
                  <p className="text-yellow-300 text-sm">
                    Adult content may include suggestive outfits, physics simulations, and
                    interactions. All content is tasteful and non-explicit, but may not be suitable
                    for all audiences.
                  </p>
                </div>
              </div>
            </div>

            {/* What You'll Get */}
            <div className="mb-6">
              <h3 className="text-white font-semibold text-lg mb-3">What you'll get access to:</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Premium avatar customization with deep sliders</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Advanced physics simulations and cloth effects</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Stylized shaders and premium textures</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Interactive poses and emotes</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Granular safety controls and preferences</span>
                </div>
              </div>
            </div>

            {/* Verification Button */}
            <div className="text-center">
              <button
                onClick={handleVerification}
                disabled={isVerifying}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  isVerifying
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-pink-500 hover:bg-pink-600 text-white'
                }`}
              >
                {isVerifying ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Verifying...</span>
                  </div>
                ) : (
                  'I am 18 or older - Verify Age'
                )}
              </button>
            </div>

            {/* Legal Notice */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-xs">
                By verifying your age, you confirm that you are 18 years or older and agree to our
                <a href="/terms" className="text-pink-400 hover:text-pink-300 underline ml-1">
                  Terms of Service
                </a>{' '}
                and
                <a href="/privacy" className="text-pink-400 hover:text-pink-300 underline ml-1">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>

          {/* Back Button */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
