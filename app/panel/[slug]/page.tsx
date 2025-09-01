 
 
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, Gamepad2, Users, Music, Info } from 'lucide-react';

interface PanelConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
  routes: Array<{
    name: string;
    href: string;
    description: string;
  }>;
}

const PANEL_CONFIGS: Record<string, PanelConfig> = {
  trade: {
    title: 'Trade Center',
    description: 'Shop and trading hub for the community',
    icon: <ShoppingBag className="h-12 w-12 text-pink-400" />,
    routes: [
      {
        name: 'Shop Collection',
        href: '/shop',
        description: 'Browse anime-inspired apparel and accessories',
      },
      { name: 'Trade Items', href: '/trade', description: 'Exchange items with other players' },
      {
        name: 'Petals Store',
        href: '/account/petals',
        description: 'Spend your hard-earned petals',
      },
    ],
  },
  'mini-games': {
    title: 'Mini-Games',
    description: 'Seasonal arcade games and challenges',
    icon: <Gamepad2 className="h-12 w-12 text-purple-400" />,
    routes: [
      {
        name: 'Samurai Petal Slice',
        href: '/mini-games/samurai-petal-slice',
        description: "Draw the Tetsusaiga's arc",
      },
      {
        name: 'Memory Match',
        href: '/mini-games/memory-match',
        description: 'Recall the faces bound by fate',
      },
      {
        name: 'Rhythm Beat-Em-Up',
        href: '/mini-games/rhythm-beat-em-up',
        description: "Sync to the Moon Prism's pulse",
      },
      { name: 'All Games', href: '/mini-games', description: 'Browse all available mini-games' },
    ],
  },
  community: {
    title: 'Avatar / Community Hub',
    description: 'Customize your avatar and connect with others',
    icon: <Users className="h-12 w-12 text-blue-400" />,
    routes: [
      { name: 'Profile', href: '/profile', description: 'Customize your avatar and profile' },
      {
        name: 'Achievements',
        href: '/profile/achievements',
        description: 'View your unlocked achievements',
      },
      { name: 'Friends', href: '/friends', description: 'Connect with other players' },
      { name: 'Community', href: '/community', description: 'Join discussions and events' },
    ],
  },
  music: {
    title: 'Music / Extras',
    description: 'OST and bonus content',
    icon: <Music className="h-12 w-12 text-green-400" />,
    routes: [
      { name: 'Music Player', href: '/music', description: 'Listen to curated anime OSTs' },
      { name: 'Playlists', href: '/music/playlists', description: 'Community-created playlists' },
      { name: 'Bonus Content', href: '/bonus', description: 'Exclusive extras and rewards' },
    ],
  },
  about: {
    title: 'About',
    description: 'Learn more about Otakumori',
    icon: <Info className="h-12 w-12 text-yellow-400" />,
    routes: [
      { name: 'About Us', href: '/about', description: 'Our story and mission' },
      { name: 'FAQ', href: '/faq', description: 'Frequently asked questions' },
      { name: 'Contact', href: '/contact', description: 'Get in touch with us' },
    ],
  },
};

export default function PanelPage() {
  const params = useParams();
  const slug = params.slug as string;
  const config = PANEL_CONFIGS[slug];

  if (!config) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Panel Not Found</h1>
          <Link href="/gamecube" className="text-pink-400 hover:text-pink-300">
            Return to GameCube
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/gamecube"
              className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center gap-4">
              {config.icon}
              <div>
                <h1 className="text-3xl font-bold">{config.title}</h1>
                <p className="text-neutral-400">{config.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {config.routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="group p-6 border border-neutral-800 rounded-xl hover:border-pink-500/50 hover:bg-neutral-900/50 transition-all duration-200"
            >
              <h3 className="text-xl font-semibold mb-2 group-hover:text-pink-400 transition-colors">
                {route.name}
              </h3>
              <p className="text-neutral-400 group-hover:text-neutral-300 transition-colors">
                {route.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
