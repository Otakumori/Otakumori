'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

type Loadout = {
  primary?: string;
  secondary?: string;
  charm?: string;
  relic?: string;
};

export default function ProfileLoadout() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Loadout | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const pm = (user!.publicMetadata || {}) as any;
    setData((pm.loadout as Loadout) || {});
  }, [isLoaded, isSignedIn, user]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    const r = await fetch('/api/profile/loadout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (!r.ok) alert('Failed to save loadout');
    else setOpen(false);
  };

  if (!isSignedIn) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 text-xs text-fuchsia-200 hover:bg-fuchsia-500/20"
      >
        Loadout
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
            }}
            role="button"
            tabIndex={0}
            aria-label="Close loadout modal"
          />
          <div className="relative z-[71] w-[min(94vw,640px)] rounded-2xl border border-fuchsia-500/20 bg-zinc-950/80 p-4 shadow-2xl">
            <div className="mb-3 text-sm font-semibold text-fuchsia-200">Memory Card — Loadout</div>
            <div className="grid grid-cols-2 gap-3 text-sm text-zinc-200">
              <Slot
                label="Primary"
                value={data?.primary}
                onChange={(v) => setData({ ...data!, primary: v })}
              />
              <Slot
                label="Secondary"
                value={data?.secondary}
                onChange={(v) => setData({ ...data!, secondary: v })}
              />
              <Slot
                label="Charm"
                value={data?.charm}
                onChange={(v) => setData({ ...data!, charm: v })}
              />
              <Slot
                label="Relic"
                value={data?.relic}
                onChange={(v) => setData({ ...data!, relic: v })}
              />
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                className="rounded-md px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-md bg-fuchsia-500 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-fuchsia-400 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Slot({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-zinc-400">{label}</span>
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label}`}
        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-fuchsia-400/50"
      />
    </label>
  );
}
