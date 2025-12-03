import { generateSEO } from '@/app/lib/seo';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { CommunityHub } from './_components/CommunityHub';
import { env } from '@/env';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/community',
  });
}
export default async function CommunityPage() {
  // Check if Clerk is configured
  const isClerkConfigured = Boolean(env.CLERK_SECRET_KEY && env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  if (!isClerkConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="glass-card p-8 rounded-2xl">
            <h1 className="text-3xl font-bold text-primary mb-4">Community Coming Soon</h1>
            <p className="text-secondary mb-6">
              Community features require authentication. Once Clerk is configured, you'll be able to
              leave messages for fellow travelers, share avatars, and participate in discussions.
            </p>
            <p className="text-muted text-sm">
              In the meantime, you can browse products and play mini-games!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-black">
      <CommunityHub />
    </div>
  );
}
