'use client';

export default function NewPagesNav() {
  const navItems = [
    { href: '/starter-pack', label: 'Free Starter Pack', emoji: '🎁' },
    { href: '/play', label: 'Asset Playground', emoji: '🎮' },
    { href: '/collections/gamecube-nostalgia', label: 'GameCube Collection', emoji: '🎯' },
    { href: '/collections/ps1-lofi-portraits', label: 'PS1 Lofi Collection', emoji: '🎭' },
    { href: '/collections/kawaii-hud', label: 'Kawaii HUD Collection', emoji: '🌸' },
    { href: '/collections/soulslike-runes', label: 'Soulslike Runes', emoji: '⚔️' },
    { href: '/collab', label: 'Creator Collab', emoji: '🤝' },
  ];

  return (
    <nav className="bg-slate-800/50 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <a href="/" className="text-slatey-200 font-bold text-lg">
              Otakumori
            </a>
            
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-slatey-300 hover:text-slatey-200 transition-colors flex items-center gap-2"
                >
                  <span>{item.emoji}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="/starter-pack"
              className="bg-sakura-500/20 border border-sakura-400 text-slatey-200 px-4 py-2 rounded-lg hover:bg-sakura-500/30 transition-colors text-sm font-medium"
            >
              Get Free Pack
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
