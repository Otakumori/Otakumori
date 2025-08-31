'use client';

import { useWorld } from '@/app/world/WorldProvider';

export default function QuakeHUD() {
  const { settings } = useWorld();

  if (settings.avatarMode !== 'hud') return null;

  return (
    <div className="fixed left-4 bottom-4 z-40 pointer-events-auto hud-shell">
      <div className="hud-panel">
        <div className="hud-avatar">{/* cropped avatar render */}</div>
        <div className="hud-bars">
          <div className="bar stamina">
            <span />
          </div>
          <div className="bar xp">
            <span />
          </div>
        </div>
        <div className="hud-metrics">
          <button className="petals">
            ◦ <b>1,248</b>
          </button>
          <button className="quest-ticker">Petal Collector 23/50</button>
        </div>
        <div className="hud-toasts" aria-live="polite" />
      </div>
    </div>
  );
}
