'use client';

import Link from 'next/link';

export function SeasonalCollectionBand() {
  const currentSeason = getCurrentSeason();

  return (
    <section className="bg-gradient-to-r from-pink-100 to-purple-100 py-8">
      <div className="container mx-auto px-4 text-center">
        <div className="mx-auto max-w-2xl">
          <h3 className="mb-2 text-xl font-medium text-gray-700">
            {getSeasonalMessage(currentSeason)}
          </h3>
          <Link
            href="/shop"
            className="inline-block rounded-full bg-purple-600 px-6 py-2 font-medium text-white transition-colors duration-200 hover:bg-purple-700"
          >
            Shop the {currentSeason} Collection
          </Link>
        </div>
      </div>
    </section>
  );
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
}

function getSeasonalMessage(season: string): string {
  const messages = {
    Spring: 'Cherry blossoms bloom softly — new beginnings await.',
    Summer: 'Summer rays dance through leaves — adventure calls.',
    Fall: 'Autumn leaves burn softly — warmth in every moment.',
    Winter: 'Winter whispers bring peace — find your center.',
  };
  return messages[season as keyof typeof messages] || messages.Spring;
}
