'use client';

import { generateSEO } from '@/app/lib/seo';
import { useCallback, useState, useEffect } from 'react';
import GameCubeBootSequence from '@/app/components/GameCubeBoot';
import GameCube3D from '@/components/BootCube3D';
import { audio } from '@/app/lib/audio';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/gamecube',
  });
}
export default function GameCubePage() {
  const [hasBooted, setHasBooted] = useState(false);

  // Preload audio files on mount
  useEffect(() => {
    const files: [string, string][] = [
      ['boot_whoosh', '/sfx/boot_whoosh.mp3'],
      ['gamecube_menu', '/sfx/gamecube-menu.mp3'],
      ['samus_jingle', '/sfx/samus-jingle.mp3'],
      ['midna_lament', '/sfx/midna-lament.mp3'],
      ['jpotter_sound', '/sfx/jpotter-sound.mp3'],
    ];

    audio.preload(files);

    // Unlock audio on first user interaction
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const handleBootComplete = useCallback(() => {
    setHasBooted(true);
  }, []);

  if (!hasBooted) {
    return <GameCubeBootSequence onComplete={handleBootComplete} />;
  }

  return <GameCube3D textures={['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png']} />;
}
