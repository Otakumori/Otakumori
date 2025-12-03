'use client';

import { generateSEO } from '@/app/lib/seo';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/unauthorized',
  });
}
export default function UnauthorizedPage() {
  const { isSignedIn, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
    }
  }, [isSignedIn, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0d1a] via-[#0f1021] to-[#0b0b13] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-300">
            You don't have permission to access this area. This realm is restricted to
            administrators only.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-block bg-[#ff4fa3] hover:bg-[#ff86c2] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Return Home
          </Link>

          {isAdmin && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">
                Wait, you are an admin! There might be a configuration issue.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          <p>If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </div>
  );
}
