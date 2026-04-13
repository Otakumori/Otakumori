'use client';

import Link from 'next/link';
import { useUser } from '@clerk/nextjs';

export default function UnauthorizedPage() {
  const { isSignedIn, user } = useUser();
  const isAdmin =
    user?.publicMetadata?.role === 'admin' ||
    user?.unsafeMetadata?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0d1a] via-[#0f1021] to-[#0b0b13] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-300">
            You do not have permission to access this area. This realm is restricted to
            administrators only.
          </p>
        </div>

        <div className="space-y-4">
          {!isSignedIn ? (
            <Link
              href="/sign-in"
              className="inline-block bg-[#ff4fa3] hover:bg-[#ff86c2] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Sign In
            </Link>
          ) : (
            <Link
              href="/"
              className="inline-block bg-[#ff4fa3] hover:bg-[#ff86c2] text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              Return Home
            </Link>
          )}

          {isAdmin && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">
                Your account looks like an admin account. The middleware role check may be reading the
                wrong claim key.
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
