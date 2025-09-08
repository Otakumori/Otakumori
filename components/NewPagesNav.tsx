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
            <a href="/" className="text-slatey-200 font-bold text-lg">{<>''
              <span role='img' aria-label='emoji'>O</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>k</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>i</span>
              ''</>}</a>

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
            >{<>''
              <span role='img' aria-label='emoji'>G</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>t</span>' '<span role='img' aria-label='emoji'>F</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>k</span>
              ''</>}</a>
          </div>
        </div>
      </div>
    </nav>
  );
}
