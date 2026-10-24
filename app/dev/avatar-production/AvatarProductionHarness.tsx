'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import type { CreatorAvatarConfig } from '@/app/lib/creator/types';
import { normalizeAvatarReadResponse } from '@/app/lib/avatar/canonical';

type AssetStatus = {
  id: string;
  state: string;
  runtimePath: string | null;
  ownerApproved: boolean;
  qaPassed: boolean;
};

export function AvatarProductionHarness({ assets }: { assets: AssetStatus[] }) {
  const [config, setConfig] = useState<CreatorAvatarConfig | null>(null);
  const [status, setStatus] = useState('Load canonical identity to begin.');
  const [busy, setBusy] = useState(false);
  const missing = assets.filter((asset) => !asset.ownerApproved || !asset.runtimePath);

  const loadIdentity = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/v1/creator/load', { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Avatar load failed');
      setConfig(normalizeAvatarReadResponse(body).config);
      setStatus('Canonical identity loaded.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Avatar load failed');
    } finally {
      setBusy(false);
    }
  }, []);

  async function saveIdentity() {
    if (!config) return;
    setBusy(true);
    try {
      const response = await fetch('/api/v1/creator/save', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-idempotency-key': crypto.randomUUID(),
        },
        body: JSON.stringify(config),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? 'Avatar save failed');
      setStatus('Canonical identity saved. Use Reload to verify the round trip.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Avatar save failed');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void loadIdentity();
  }, [loadIdentity]);

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Development-only QA</p>
          <h1 className="mt-2 text-3xl font-semibold">Avatar production vertical slice</h1>
          <p className="mt-3 max-w-3xl text-zinc-300">
            This harness uses the canonical Creator persistence path. Missing production art is
            reported explicitly and is never replaced with procedural geometry.
          </p>
        </header>

        <section
          aria-labelledby="asset-status"
          className="rounded-xl border border-amber-700/50 bg-zinc-900 p-5"
        >
          <h2 id="asset-status" className="text-xl font-medium">
            Asset readiness
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {assets.map((asset) => (
              <li key={asset.id} className="rounded-lg border border-zinc-700 p-3">
                <code>{asset.id}</code>
                <p
                  className={
                    asset.runtimePath && asset.ownerApproved ? 'text-emerald-300' : 'text-rose-300'
                  }
                >
                  {asset.runtimePath && asset.ownerApproved ? asset.state : 'ASSET MISSING'}
                </p>
              </li>
            ))}
          </ul>
          {missing.length > 0 && (
            <p role="status" className="mt-4 text-rose-200">
              Runtime preview and animation controls remain blocked until these exact assets are
              owner-approved and runtime-ready.
            </p>
          )}
        </section>

        <section
          aria-labelledby="identity-controls"
          className="rounded-xl border border-zinc-700 bg-zinc-900 p-5"
        >
          <h2 id="identity-controls" className="text-xl font-medium">
            Canonical identity round trip
          </h2>
          {config ? (
            <div className="mt-4 space-y-5">
              <p>
                Base <code>{config.baseAssetId ?? config.baseModel}</code> · Hair{' '}
                <code>{config.hair.style}</code> · Outfit{' '}
                <code>{config.parts.OuterWear ?? 'none'}</code>
              </p>
              <label className="block">
                <span>Height {config.body.height.toFixed(2)}</span>
                <input
                  className="mt-2 block w-full"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.body.height}
                  onChange={(event) =>
                    setConfig({
                      ...config,
                      body: { ...config.body, height: Number(event.target.value) },
                    })
                  }
                />
              </label>
              <label className="block">
                <span>Jawline {config.face.jawline.toFixed(2)}</span>
                <input
                  className="mt-2 block w-full"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.face.jawline}
                  onChange={(event) =>
                    setConfig({
                      ...config,
                      face: { ...config.face, jawline: Number(event.target.value) },
                    })
                  }
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  disabled={busy}
                  onClick={() => void saveIdentity()}
                  className="rounded bg-amber-700 px-4 py-2 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  disabled={busy}
                  onClick={() => window.location.reload()}
                  className="rounded border border-amber-600 px-4 py-2 disabled:opacity-50"
                >
                  Hard reload proof
                </button>
                <Link href="/creator" className="rounded border border-zinc-600 px-4 py-2">
                  Open Creator
                </Link>
                <Link href="/profile" className="rounded border border-zinc-600 px-4 py-2">
                  Open Profile
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-zinc-300">
              No persisted Avatar identity exists. Create one in the canonical Creator.
            </p>
          )}
          <p aria-live="polite" className="mt-4 text-sm text-zinc-300">
            {status}
          </p>
        </section>
      </div>
    </main>
  );
}
