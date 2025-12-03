'use client';
import { useEffect, useState } from 'react';
import { AdminLayout } from '../../../components/admin/AdminNav';

);
}
export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState<any>({
    grayIntensity: 0.8,
    pinkIntensity: 0.7,
    motionIntensity: 2,
  });
  const [seasonal, setSeasonal] = useState<any>({
    autumnMode: false,
    springMode: false,
    sakuraBoost: false,
  });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch('/api/admin/site-config');
        const j = await r.json();
        if (j?.ok && j?.data) {
          if (j.data.theme) setTheme(j.data.theme);
          if (j.data.seasonal) setSeasonal(j.data.seasonal);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const r = await fetch('/api/admin/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, seasonal }),
      });
      const j = await r.json();
      if (j?.ok) setMsg('Saved');
      else setMsg(j?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="mb-4 text-3xl font-bold text-white">Appearance Settings</h1>
        <p className="mb-6 text-neutral-300">
          Adjust theme colors and seasonal flags. Changes take effect immediately.
        </p>
        {loading ? (
          <div className="text-neutral-400">Loading…</div>
        ) : (
          <div className="grid max-w-2xl gap-6">
            <section className="rounded-xl border border-white/10 bg-black/50 p-4">
              <h2 className="mb-3 text-lg font-semibold text-pink-200">Theme</h2>
              <div className="space-y-3">
                <label className="block text-sm">
                  Gray Intensity ({theme.grayIntensity})
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={theme.grayIntensity}
                    onChange={(e) =>
                      setTheme({ ...theme, grayIntensity: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </label>
                <label className="block text-sm">
                  Pink Intensity ({theme.pinkIntensity})
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={theme.pinkIntensity}
                    onChange={(e) =>
                      setTheme({ ...theme, pinkIntensity: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </label>
                <label className="block text-sm">
                  Motion Intensity ({theme.motionIntensity})
                  <input
                    type="range"
                    min={0}
                    max={4}
                    step={0.1}
                    value={theme.motionIntensity}
                    onChange={(e) =>
                      setTheme({ ...theme, motionIntensity: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-white/10 bg-black/50 p-4">
              <h2 className="mb-3 text-lg font-semibold text-pink-200">Seasonal</h2>
              <div className="grid grid-cols-2 gap-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!seasonal.springMode}
                    onChange={(e) => setSeasonal({ ...seasonal, springMode: e.target.checked })}
                  />
                  Spring Mode
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!seasonal.autumnMode}
                    onChange={(e) => setSeasonal({ ...seasonal, autumnMode: e.target.checked })}
                  />
                  Autumn Mode
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!seasonal.sakuraBoost}
                    onChange={(e) => setSeasonal({ ...seasonal, sakuraBoost: e.target.checked })}
                  />
                  Sakura Boost
                </label>
              </div>
            </section>

            <div className="flex items-center gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="rounded bg-pink-600 px-4 py-2 text-white disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              {msg && <span className="text-xs text-neutral-300">{msg}</span>}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
