
'use client';

import { generateSEO } from '@/app/lib/seo';
import React from 'react';
import LoadingBonfire from '../../components/ui/LoadingBonfire';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\(client)\bonfire\page.tsx',
  });
}
export default function BonfirePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-black to-gray-900 p-4">
      <h1 className="mb-8 text-4xl font-bold text-pink-400">Bonfire</h1>
      <p className="mb-8 max-w-md text-center text-white/70">
        "In the depths of darkness, the bonfire stands as a beacon of hope. Rest here, gather your
        strength, and prepare for the journey ahead."
      </p>
      <LoadingBonfire />
    </div>
  );
}
