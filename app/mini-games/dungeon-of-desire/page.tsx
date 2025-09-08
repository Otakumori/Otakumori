// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import { STANDALONE_GAMES } from '@/components/arcade/registry';
import Engine from '@/components/arcade/Engine';

export default function DungeonOfDesirePage() {
  const game = STANDALONE_GAMES['dungeon-of-desire'];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold mb-2">{game.label}</h1>
      <p className="text-sm opacity-80 mb-6">{<>''
        <span role='img' aria-label='emoji'>N</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>v</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>s</span>' '<span role='img' aria-label='emoji'>d</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>n</span>' '<span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>w</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>r</span>' '<span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>c</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>o</span><span role='img' aria-label='emoji'>g</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>m</span><span role='img' aria-label='emoji'>e</span>.' '<span role='img' aria-label='emoji'>F</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>d</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>h</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>s</span><span role='img' aria-label='emoji'>u</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span>' '<span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>d</span>' '<span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>n</span>
        <span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>t</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>l</span><span role='img' aria-label='emoji'>s</span>!
        ''</>}</p>
      <div className="rounded-2xl bg-white/5 backdrop-blur p-4 ring-1 ring-white/10">
        <Engine playlist={[game]} mode="long" autoplay={false} />
      </div>
    </div>
  );
}
