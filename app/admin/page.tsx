/**
 * Admin Console Page
 * 
 * Secure admin interface for managing feature flags and site settings.
 * Only accessible to admin users (emails in ADMIN_EMAILS).
 */

import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isAdminEmail } from '@/app/lib/config/admin';
import { env } from '@/env';
import AdminConsoleClient from './AdminConsoleClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminPage() {
  // Check if Clerk is configured
  const isClerkConfigured = Boolean(
    env.CLERK_SECRET_KEY && env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );

  if (!isClerkConfigured) {
    // In development, allow access; in production, show disabled message
    if (process.env.NODE_ENV === 'development') {
      // Allow dev access but warn
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 mb-6">
              <h1 className="text-2xl font-bold text-yellow-200 mb-2">Admin Console (Dev Mode)</h1>
              <p className="text-yellow-100/80">
                Clerk is not configured. Admin console is only available in development mode.
              </p>
            </div>
            <AdminConsoleClient />
          </div>
        </div>
      );
    }

    // Production: show disabled message
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Admin Disabled</h1>
          <p className="text-zinc-300">
            Admin console requires authentication. Clerk is not configured in this environment.
          </p>
        </div>
      </div>
    );
  }

  // Get current user
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in?redirect_url=/admin');
  }

  // Get user email
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress ??
    null;

  // Check if user is admin
  if (!isAdminEmail(email)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Not Authorized</h1>
          <p className="text-zinc-300">
            You do not have permission to access the admin console.
          </p>
        </div>
      </div>
    );
  }

  // User is admin - show admin console
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Console</h1>
          <p className="text-zinc-300">Manage feature flags and site settings</p>
        </div>
        <AdminConsoleClient userId={user.id} userEmail={email} />
      </div>
    </div>
  );
}
