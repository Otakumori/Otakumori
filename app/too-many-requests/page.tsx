// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
// import Link from 'next/link'; // Unused
import { COPY } from '@/app/lib/copy';
import GlassButton from '@/app/components/ui/GlassButton';
import GlassCard from '@/app/components/ui/GlassCard';

export default function TooManyRequests() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <GlassCard className="p-8 text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Too Many Requests</h1>
            <p className="text-lg text-gray-600 mb-2">{COPY.site.subtleMove}</p>
            <p className="text-gray-500">Please slow down and try again in a moment.</p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              You've been making requests too quickly. Take a breather and come back in a few
              seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassButton href="/" variant="primary">
                Return to Home
              </GlassButton>
              <GlassButton href="/mini-games" variant="secondary">
                Play Mini-Games
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
