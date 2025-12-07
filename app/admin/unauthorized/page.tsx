import Link from 'next/link';
import { Shield } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center p-8">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-500/20 p-4">
            <Shield className="h-12 w-12 text-red-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-zinc-300 mb-6">
          You do not have permission to access the admin console. Only administrators can view this
          page.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-pink-600 px-6 py-3 text-white hover:bg-pink-700 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
