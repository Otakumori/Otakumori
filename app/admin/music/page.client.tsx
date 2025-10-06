'use client';

import { useEffect, useState } from 'react';

type Track = { id: string; title: string; artist: string; url: string; sort: number };
type Playlist = { id: string; name: string; isPublic: boolean; tracks: Track[] };

export default function AdminMusicClient() {
  const [pls, setPls] = useState<Playlist[]>([]);
  const [name, setName] = useState('');

  async function load() {
    const r = await fetch('/api/admin/music/playlists', { cache: 'no-store' });
    const j = await r.json();
    if (j.ok) setPls(j.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createPl() {
    if (!name) return;
    const r = await fetch('/api/admin/music/playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (r.ok) {
      setName('');
      load();
    }
  }

  async function addTrack(plId: string, file: File, title: string, artist: string) {
    // Create a blob slot
    const res = await fetch('/api/admin/music/blob-upload-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    }).then((r) => r.json());
    if (!res.ok) return;

    // Upload actual file bytes to the URL returned
    await fetch(res.url, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

    // Attach to playlist
    await fetch(`/api/admin/music/playlists/${plId}/tracks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, artist, url: res.url }),
    });
    await load();
  }

  async function deletePlaylist(id: string) {
    if (!confirm('Delete this playlist? This cannot be undone.')) return;
    const r = await fetch(`/api/admin/music/playlists/${id}`, { method: 'DELETE' });
    if (r.ok) await load();
  }

  async function deleteTrack(id: string) {
    if (!confirm('Delete this track?')) return;
    const r = await fetch(`/api/admin/music/tracks/${id}`, { method: 'DELETE' });
    if (r.ok) await load();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-800/60 p-4">
        <h2 className="mb-2 font-medium">Create Playlist</h2>
        <div className="flex gap-2">
          <input
            className="w-64 rounded-md border border-zinc-700 bg-black px-3 py-1.5"
            placeholder="Playlist name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={createPl}
            className="rounded-md bg-emerald-600 px-3 py-1.5 hover:bg-emerald-500"
          >
            Create
          </button>
        </div>
      </div>

      {pls.map((pl) => (
        <div key={pl.id} className="rounded-2xl border border-zinc-800/60 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="font-medium">
              {pl.name} {pl.isPublic ? '• Public' : '• Private'}
            </div>
            <button
              onClick={() => deletePlaylist(pl.id)}
              className="rounded-md bg-red-600 px-2 py-1 text-sm hover:bg-red-500"
            >
              Delete Playlist
            </button>
          </div>
          <TrackUploader
            onUpload={(file, meta) => addTrack(pl.id, file, meta.title, meta.artist)}
          />
          <ul className="mt-3 space-y-2">
            {pl.tracks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-md border border-zinc-800/60 px-3 py-2"
              >
                <div>
                  <div className="text-sm">{t.title}</div>
                  <div className="text-xs text-zinc-500">{t.artist}</div>
                </div>
                <div className="flex items-center gap-2">
                  <audio src={t.url} controls preload="none">
                    <track kind="captions" src="" label="No captions available" />
                  </audio>
                  <button
                    onClick={() => deleteTrack(t.id)}
                    className="rounded-md bg-red-600 px-2 py-1 text-xs hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function TrackUploader({
  onUpload,
}: {
  onUpload: (file: File, meta: { title: string; artist: string }) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor="track-file-upload" className="text-sm font-medium">
        Audio File
      </label>
      <input
        id="track-file-upload"
        type="file"
        accept="audio/mpeg,audio/mp3"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="block"
      />
      <input
        className="rounded-md border border-zinc-700 bg-black px-3 py-1.5"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        className="rounded-md border border-zinc-700 bg-black px-3 py-1.5"
        placeholder="Artist"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
      />
      <button
        onClick={() => file && title && onUpload(file, { title, artist })}
        className="rounded-md bg-pink-600 px-3 py-1.5 text-sm font-medium hover:bg-pink-500 disabled:opacity-50"
        disabled={!file || !title}
      >
        Add Track
      </button>
    </div>
  );
}
