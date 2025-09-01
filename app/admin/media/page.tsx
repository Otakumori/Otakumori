 
 
'use client';

import React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

type BlobItem = {
  url: string;
  pathname: string;
  size?: number;
  contentType?: string;
  uploadedAt?: number;
};

export default function AdminMediaPage() {
  const [blobs, setBlobs] = useState<BlobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [upLoading, setUpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/media/list', { cache: 'no-store' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Failed to list blobs');
      setBlobs(json.blobs || []);
    } catch (e: any) {
      setError(e.message || 'List failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const onUpload = async (file: File) => {
    setUpLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Upload failed');
      await fetchList();
    } catch (e: any) {
      setError(e.message || 'Upload error');
    } finally {
      setUpLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onDelete = async (url: string) => {
    if (!confirm('Delete this asset? This cannot be undone.')) return;
    setError(null);
    try {
      const res = await fetch('/api/admin/media/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'Delete failed');
      setBlobs((prev) => prev.filter((b) => b.url !== url));
    } catch (e: any) {
      setError(e.message || 'Delete error');
    }
  };

  const totalSizeMB = useMemo(
    () => (blobs.reduce((s, b) => s + (b.size || 0), 0) / (1024 * 1024)).toFixed(2),
    [blobs],
  );

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Media Manager</h1>
        <button
          onClick={fetchList}
          className="rounded-xl border px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <section className="mb-8 rounded-2xl border p-4">
        <h2 className="mb-2 text-lg font-semibold">Upload</h2>
        <p className="mb-4 text-sm text-neutral-500">
          Use for blog headers, hero art, and site images. Public CDN URLs are returned.
        </p>
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f);
            }}
            className="block w-full cursor-pointer rounded-lg border p-2"
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90 disabled:opacity-50 dark:bg-white dark:text-black"
            disabled={upLoading}
          >
            {upLoading ? 'Uploading...' : 'Select File'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </section>

      <section className="rounded-2xl border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Library</h2>
          <div className="text-sm text-neutral-500">
            {blobs.length} item(s) • {totalSizeMB} MB total
          </div>
        </div>

        {blobs.length === 0 ? (
          <p className="text-sm text-neutral-500">No media yet. Upload your first file above.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blobs.map((b) => {
              const isImage = (b.contentType || '').startsWith('image/');
              const name = b.pathname.split('/').pop() || b.pathname;
              const uploaded = b.uploadedAt ? new Date(b.uploadedAt).toLocaleString() : '';

              return (
                <li key={b.url} className="rounded-xl border p-3">
                  <div className="mb-2 aspect-video overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
                    {isImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.url} alt={name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
                        {b.contentType || 'binary'}
                      </div>
                    )}
                  </div>

                  <div className="mb-1 truncate text-sm font-medium">{name}</div>
                  <div className="mb-3 truncate text-xs text-neutral-500">{b.url}</div>
                  <div className="mb-3 text-xs text-neutral-500">{uploaded}</div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(b.url);
                      }}
                      className="rounded-lg border px-3 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => onDelete(b.url)}
                      className="rounded-lg border px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
