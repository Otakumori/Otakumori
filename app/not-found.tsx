'use client';

import { useEffect, useState } from 'react';
// import Link from 'next/link';
import { COPY } from '@/app/lib/copy';
import GlassButton from '@/app/components/ui/GlassButton';
import GlassCard from '@/app/components/ui/GlassCard';
import NotFoundPopup from '@/components/404/NotFoundPopup';

export default function NotFound() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Show popup after a short delay
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <GlassCard className="p-8 text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">{COPY.errors.died404}</h1>
              <p className="text-xl text-gray-600 mb-2">{COPY.errors.gameOverAlt}</p>
              <p className="text-gray-500">{COPY.errors.princessElsewhere}</p>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600">
                The page you're looking for doesn't exist in this realm.
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

      <NotFoundPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
      />
    </>
  );
}
