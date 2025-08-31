import Link from 'next/link';

const tiles = [
  {
    href: '/mini-games/blossomware',
    title: 'BlossomWare (Playlist)',
    blurb: 'Rapid chaos + long minis',
  },
  {
    href: '/mini-games/petal-storm-rhythm',
    title: 'Petal Storm Rhythm',
    blurb: 'Tap petals on beat',
  },
  { href: '/mini-games/maid-cafe-manager', title: 'Maid Café Manager', blurb: 'Serve… everything' },
  { href: '/mini-games/thigh-coliseum', title: 'Thigh Coliseum', blurb: 'Endure the squeeze' },
  { href: '/mini-games/dungeon-of-desire', title: 'Dungeon of Desire', blurb: 'Roguelite tease' },
];

export default function MiniGamesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Mini-Games</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group rounded-2xl p-5 bg-white/5 hover:bg-white/10 transition ring-1 ring-white/10"
          >
            <div className="text-xl mb-1">{t.title}</div>
            <div className="text-sm opacity-80">{t.blurb}</div>
            <div className="mt-4 text-xs opacity-70 group-hover:opacity-100">Enter →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
